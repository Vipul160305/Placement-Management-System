import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { Drive } from "../models/Drive.js";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { recordAudit } from "../services/auditService.js";
import { applicationFilterForRole } from "../services/applicationScope.js";
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
  if (role === "coordinator" && !req.user!.department?.trim()) {
    sendSuccess(res, 200, { applications: [] });
    return;
  }

  const filter = await applicationFilterForRole(req);

  const apps = await Application.find(filter)
    .populate("student", "name email department section branch cgpa backlogCount")
    .populate({
      path: "drive",
      select: "title status company sectionAssignments",
      populate: { path: "company", select: "name" },
    })
    .sort({ updatedAt: -1 })
    .limit(500);

  sendSuccess(res, 200, { applications: apps });
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
  } else if (role === "coordinator") {
    const stud = await User.findById(application.student).select("department");
    const coordDept = req.user!.department?.trim().toLowerCase();
    const studDept = (stud?.department ?? "").trim().toLowerCase();
    if (!coordDept || !stud || studDept !== coordDept) {
      throw new AppError(403, "Not your department", "FORBIDDEN");
    }
    if (!["shortlisted", "rejected"].includes(nextStatus)) {
      throw new AppError(
        403,
        "Coordinator may only shortlist or reject",
        "FORBIDDEN"
      );
    }
  }

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

  sendSuccess(res, 200, { application: fresh });
}
