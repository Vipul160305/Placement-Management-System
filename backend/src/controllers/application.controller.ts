import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { Drive } from "../models/Drive.js";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { recordAudit } from "../services/auditService.js";
import { applicationFilterForRole } from "../services/applicationScope.js";
import { sendApplicationStatusEmail } from "../services/emailService.js";
import type { ApplicationStatus } from "../models/Application.js";

const TERMINAL: ApplicationStatus[] = ["offered", "rejected", "withdrawn"];

function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  if (from === to) return true;
  if (TERMINAL.includes(from)) return false;
  if (from === "applied") {
    return to === "shortlisted" || to === "rejected" || to === "withdrawn";
  }
  if (from === "shortlisted") {
    return to === "offered" || to === "rejected";
  }
  return false;
}

export async function listMyApplications(
  req: Request,
  res: Response
): Promise<void> {
  if (req.user!.role !== "student") {
    throw new AppError(403, "Students only", "FORBIDDEN");
  }
  const apps = await Application.find({ student: req.user!.id })
    .populate({
      path: "drive",
      select: "title status company scheduledAt package jobRole",
      populate: { path: "company", select: "name" },
    })
    .sort({ updatedAt: -1 });

  sendSuccess(res, 200, { applications: apps });
}

export async function listApplications(req: Request, res: Response): Promise<void> {
  const role = req.user!.role;
  if (role === "hr" && !req.user!.companyId) {
    sendSuccess(res, 200, { applications: [], total: 0, page: 1, pages: 1 });
    return;
  }

  const filter = await applicationFilterForRole(req);

  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "50", 10)));
  const skip = (page - 1) * limit;

  const [apps, total] = await Promise.all([
    Application.find(filter)
      .populate("student", "name email department section branch cgpa backlogCount")
      .populate({
        path: "drive",
        select: "title status company sectionAssignments",
        populate: { path: "company", select: "name" },
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(filter),
  ]);

  sendSuccess(res, 200, {
    applications: apps,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function updateApplicationStatus(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid application id", "VALIDATION_ERROR");
  }

  const { status } = req.body as { status?: string };
  const allowed: ApplicationStatus[] = [
    "applied",
    "shortlisted",
    "offered",
    "rejected",
    "withdrawn",
  ];
  if (typeof status !== "string" || !allowed.includes(status as ApplicationStatus)) {
    throw new AppError(400, "Invalid status", "VALIDATION_ERROR");
  }
  const nextStatus = status as ApplicationStatus;

  const application = await Application.findById(id);

  if (!application) {
    throw new AppError(404, "Application not found", "NOT_FOUND");
  }

  const role = req.user!.role;
  if (role === "student") {
    if (application.student.toString() !== req.user!.id) {
      throw new AppError(403, "Forbidden", "FORBIDDEN");
    }
    if (nextStatus !== "withdrawn") {
      throw new AppError(403, "Students may only withdraw", "FORBIDDEN");
    }
  } else if (role === "hr") {
    // HR can only act on applications for their company's drives
    const companyId = req.user!.companyId;
    if (!companyId) throw new AppError(403, "No company assigned to this HR account", "FORBIDDEN");
    const drive = await Drive.findById(application.drive).select("company");
    if (!drive || drive.company.toString() !== companyId) {
      throw new AppError(403, "This application is not for your company", "FORBIDDEN");
    }
    if (!["shortlisted", "rejected", "offered"].includes(nextStatus)) {
      throw new AppError(403, "HR may only shortlist, offer, or reject", "FORBIDDEN");
    }
  }
  // tpo and admin have no restrictions

  const from = application.status;
  if (!canTransition(from, nextStatus)) {
    throw new AppError(
      400,
      `Invalid transition ${from} -> ${nextStatus}`,
      "VALIDATION_ERROR"
    );
  }

  application.status = nextStatus;
  await application.save();

  await recordAudit({
    actorId: req.user!.id,
    action: "application.status",
    entityType: "Application",
    entityId: application.id,
    metadata: { from, to: nextStatus },
  });

  const fresh = await Application.findById(application.id)
    .populate("student", "name email department")
    .populate({
      path: "drive",
      select: "title company",
      populate: { path: "company", select: "name" },
    });

  // Send email notification to student (fire-and-forget — don't block response)
  const student = fresh?.student as { name?: string; email?: string } | null;
  const drive = fresh?.drive as { title?: string; company?: { name?: string } } | null;
  if (student?.email && ["shortlisted", "offered", "rejected"].includes(nextStatus)) {
    sendApplicationStatusEmail({
      studentEmail: student.email,
      studentName: student.name ?? "Student",
      companyName: drive?.company?.name ?? "the company",
      driveTitle: drive?.title ?? "the drive",
      status: nextStatus,
    }).catch(() => {}); // silently ignore email errors
  }

  sendSuccess(res, 200, { application: fresh });
}
