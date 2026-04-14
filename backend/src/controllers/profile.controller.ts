import type { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { ProfileEditRequest } from "../models/ProfileEditRequest.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { recordAudit } from "../services/auditService.js";
import { sendProfileEditRequestEmail, sendProfileReviewEmail } from "../services/emailService.js";

/** Student: submit a profile edit request */
export async function submitEditRequest(req: Request, res: Response): Promise<void> {
  const studentId = req.user!.id;
  const body = req.body as Record<string, unknown>;

  const changes: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();
  if (typeof body.department === "string" && body.department.trim()) changes.department = body.department.trim();
  if (typeof body.section === "string" && body.section.trim()) changes.section = body.section.trim();
  if (typeof body.branch === "string" && body.branch.trim()) changes.branch = body.branch.trim();
  if (typeof body.cgpa === "number") changes.cgpa = body.cgpa;
  if (typeof body.backlogCount === "number") changes.backlogCount = body.backlogCount;

  if (Object.keys(changes).length === 0) {
    throw new AppError(400, "No changes provided", "VALIDATION_ERROR");
  }

  // Cancel any existing pending request for this student
  await ProfileEditRequest.deleteMany({ student: studentId, status: "pending" });

  const request = await ProfileEditRequest.create({
    student: studentId,
    changes,
    status: "pending",
  });

  await recordAudit({
    actorId: studentId,
    action: "profile.edit.request",
    entityType: "ProfileEditRequest",
    entityId: request.id,
    metadata: { changes },
  });

  // Notify all TPO users by email (fire-and-forget)
  const student = await User.findById(studentId).select("name email");
  if (student) {
    const tpoUsers = await User.find({ role: "tpo" }).select("email").limit(5);
    for (const tpo of tpoUsers) {
      sendProfileEditRequestEmail({
        tpoEmail: tpo.email,
        studentName: student.name,
        studentEmail: student.email,
      }).catch(() => {});
    }
  }

  sendSuccess(res, 201, { request });
}

/** Student: get their own pending/latest request */
export async function getMyEditRequest(req: Request, res: Response): Promise<void> {
  const studentId = req.user!.id;
  const request = await ProfileEditRequest.findOne({ student: studentId })
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, { request });
}

/** TPO: list all pending requests */
export async function listEditRequests(req: Request, res: Response): Promise<void> {
  const { status } = req.query as { status?: string };
  const filter: Record<string, unknown> = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  } else {
    filter.status = "pending"; // default to pending
  }

  const requests = await ProfileEditRequest.find(filter)
    .populate("student", "name email department section branch cgpa backlogCount")
    .populate("reviewedBy", "name")
    .sort({ createdAt: -1 })
    .limit(200);

  sendSuccess(res, 200, { requests });
}

/** TPO: approve or reject a request */
export async function reviewEditRequest(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid request id", "VALIDATION_ERROR");
  }

  const { action, reviewNote } = req.body as { action?: string; reviewNote?: string };
  if (action !== "approve" && action !== "reject") {
    throw new AppError(400, 'action must be "approve" or "reject"', "VALIDATION_ERROR");
  }

  const request = await ProfileEditRequest.findById(id);
  if (!request) throw new AppError(404, "Request not found", "NOT_FOUND");
  if (request.status !== "pending") {
    throw new AppError(400, "Request already reviewed", "VALIDATION_ERROR");
  }

  request.status = action === "approve" ? "approved" : "rejected";
  request.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
  request.reviewNote = reviewNote?.trim() || undefined;
  await request.save();

  if (action === "approve") {
    const update: Record<string, unknown> = {};
    const c = request.changes;
    if (c.name)         update.name = c.name;
    if (c.department)   update.department = c.department;
    if (c.section)      update.section = c.section;
    if (c.branch)       update.branch = c.branch;
    if (c.cgpa !== undefined)         update.cgpa = c.cgpa;
    if (c.backlogCount !== undefined) update.backlogCount = c.backlogCount;

    await User.findByIdAndUpdate(request.student, { $set: update });
  }

  await recordAudit({
    actorId: req.user!.id,
    action: `profile.edit.${action}`,
    entityType: "ProfileEditRequest",
    entityId: request.id,
    metadata: { studentId: request.student, action },
  });

  const populated = await ProfileEditRequest.findById(request.id)
    .populate("student", "name email department section branch cgpa backlogCount")
    .populate("reviewedBy", "name");

  // Notify student of the review outcome (fire-and-forget)
  const studentUser = populated?.student as { name?: string; email?: string } | null;
  if (studentUser?.email) {
    sendProfileReviewEmail({
      studentEmail: studentUser.email,
      studentName: studentUser.name ?? "Student",
      action: action as "approved" | "rejected",
      reviewNote: request.reviewNote,
    }).catch(() => {});
  }

  sendSuccess(res, 200, { request: populated });
}
