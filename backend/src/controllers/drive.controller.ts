import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Drive } from "../models/Drive.js";
import { User } from "../models/User.js";
import { Application } from "../models/Application.js";
import { AuditLog } from "../models/AuditLog.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { recordAudit } from "../services/auditService.js";
import { evaluateEligibility } from "../services/eligibilityService.js";
import type { ISectionAssignment } from "../models/Drive.js";

function serializeDrive(d: InstanceType<typeof Drive>) {
  return {
    id: d.id,
    company: d.company,
    createdBy: d.createdBy,
    title: d.title,
    description: d.description,
    scheduledAt: d.scheduledAt,
    minCgpa: d.minCgpa,
    maxBacklogs: d.maxBacklogs,
    allowedBranches: d.allowedBranches,
    jobRole: d.jobRole,
    package: d.package,
    status: d.status,
    sectionAssignments: d.sectionAssignments,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function listDrives(req: Request, res: Response): Promise<void> {
  const role = req.user!.role;
  const statusFilter = req.query.status as string | undefined;

  let query: Record<string, unknown> = {};
  if (statusFilter && ["draft", "open", "closed"].includes(statusFilter)) {
    query = { status: statusFilter };
  }

  if (role === "student") {
    query = { ...query, status: "open" };
  } else if (role === "hr") {
    // HR sees only drives for their company
    const companyId = req.user!.companyId;
    if (!companyId) {
      sendSuccess(res, 200, { drives: [] });
      return;
    }
    const hrClause: Record<string, unknown> = { company: new mongoose.Types.ObjectId(companyId) };
    const keys = Object.keys(query);
    query = keys.length === 0 ? hrClause : { $and: [query, hrClause] };
  }

  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "50", 10)));
  const skip = (page - 1) * limit;

  const [drives, total] = await Promise.all([
    Drive.find(query)
      .populate("company", "name website contactEmail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Drive.countDocuments(query),
  ]);

  if (role === "student") {
    const student = await User.findById(req.user!.id);
    if (!student) throw new AppError(404, "User not found", "NOT_FOUND");
    const withEligibility = drives.map((d) => {
      const ev = evaluateEligibility(student, d);
      return { ...serializeDrive(d), eligibility: ev };
    });
    sendSuccess(res, 200, { drives: withEligibility, total, page, pages: Math.ceil(total / limit) });
    return;
  }

  // Attach application counts for non-student roles
  const driveIds = drives.map((d) => d._id);
  const counts = await Application.aggregate([
    { $match: { drive: { $in: driveIds } } },
    { $group: { _id: "$drive", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count as number]));

  sendSuccess(res, 200, {
    drives: drives.map((d) => ({
      ...serializeDrive(d),
      company: d.company,
      applicationCount: countMap.get(d.id) ?? 0,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
export async function getDrive(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid drive id", "VALIDATION_ERROR");
  }
  const drive = await Drive.findById(id).populate(
    "company",
    "name website contactEmail contactPhone"
  );
  if (!drive) {
    throw new AppError(404, "Drive not found", "NOT_FOUND");
  }

  const role = req.user!.role;
  if (role === "student" && drive.status !== "open") {
    throw new AppError(403, "Drive not available", "FORBIDDEN");
  }

  if (role === "student") {
    const student = await User.findById(req.user!.id);
    if (!student) {
      throw new AppError(404, "User not found", "NOT_FOUND");
    }
    const ev = evaluateEligibility(student, drive);
    sendSuccess(res, 200, {
      drive: { ...serializeDrive(drive), company: drive.company, eligibility: ev },
    });
    return;
  }

  sendSuccess(res, 200, { drive: { ...serializeDrive(drive), company: drive.company } });
}

export async function createDrive(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const companyId = body.company;
  const title = body.title;
  if (typeof companyId !== "string" || !mongoose.Types.ObjectId.isValid(companyId)) {
    throw new AppError(400, "Valid company id required", "VALIDATION_ERROR");
  }
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError(400, "title required", "VALIDATION_ERROR");
  }

  const drive = await Drive.create({
    company: companyId,
    createdBy: req.user!.id,
    title: title.trim(),
    description:
      typeof body.description === "string" ? body.description.trim() : undefined,
    scheduledAt:
      body.scheduledAt !== undefined && body.scheduledAt !== null
        ? new Date(body.scheduledAt as string)
        : undefined,
    minCgpa: typeof body.minCgpa === "number" ? body.minCgpa : 0,
    maxBacklogs: typeof body.maxBacklogs === "number" ? body.maxBacklogs : 0,
    allowedBranches: Array.isArray(body.allowedBranches)
      ? (body.allowedBranches as unknown[]).filter(
          (b): b is string => typeof b === "string"
        )
      : [],
    jobRole: typeof body.jobRole === "string" ? body.jobRole.trim() : undefined,
    package: typeof body.package === "string" ? body.package.trim() : undefined,
    status:
      typeof body.status === "string" &&
      ["draft", "open", "closed"].includes(body.status)
        ? body.status
        : "draft",
    sectionAssignments: [],
  });

  await recordAudit({
    actorId: req.user!.id,
    action: "drive.create",
    entityType: "Drive",
    entityId: drive.id,
    metadata: { title: drive.title },
  });

  const populated = await Drive.findById(drive.id).populate(
    "company",
    "name"
  );
  sendSuccess(res, 201, { drive: populated });
}

export async function updateDrive(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid drive id", "VALIDATION_ERROR");
  }
  const drive = await Drive.findById(id);
  if (!drive) {
    throw new AppError(404, "Drive not found", "NOT_FOUND");
  }

  const body = req.body as Record<string, unknown>;
  if (typeof body.title === "string") drive.title = body.title.trim();
  if (typeof body.description === "string")
    drive.description = body.description.trim();
  if (body.scheduledAt !== undefined) {
    drive.scheduledAt =
      body.scheduledAt === null || body.scheduledAt === ""
        ? undefined
        : new Date(body.scheduledAt as string);
  }
  if (typeof body.minCgpa === "number") drive.minCgpa = body.minCgpa;
  if (typeof body.maxBacklogs === "number") drive.maxBacklogs = body.maxBacklogs;
  if (Array.isArray(body.allowedBranches)) {
    drive.allowedBranches = (body.allowedBranches as unknown[]).filter(
      (b): b is string => typeof b === "string"
    );
  }
  if (typeof body.jobRole === "string") drive.jobRole = body.jobRole.trim();
  if (typeof body.package === "string") drive.package = body.package.trim();
  if (
    typeof body.status === "string" &&
    ["draft", "open", "closed"].includes(body.status)
  ) {
    drive.status = body.status as "draft" | "open" | "closed";
  }
  if (
    typeof body.company === "string" &&
    mongoose.Types.ObjectId.isValid(body.company)
  ) {
    drive.company = new mongoose.Types.ObjectId(body.company);
  }

  await drive.save();

  await recordAudit({
    actorId: req.user!.id,
    action: "drive.update",
    entityType: "Drive",
    entityId: drive.id,
  });

  const populated = await Drive.findById(drive.id).populate(
    "company",
    "name"
  );
  sendSuccess(res, 200, { drive: populated });
}

export async function deleteDrive(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid drive id", "VALIDATION_ERROR");
  }

  const drive = await Drive.findById(id);
  if (!drive) {
    throw new AppError(404, "Drive not found", "NOT_FOUND");
  }

  // Cascade delete — applications and audit logs for this drive
  const [appResult] = await Promise.all([
    Application.deleteMany({ drive: id }),
    AuditLog.deleteMany({ entityType: "Drive", entityId: id }),
    AuditLog.deleteMany({ entityType: "Application", metadata: { driveId: id } }),
  ]);

  await Drive.findByIdAndDelete(id);

  await recordAudit({
    actorId: req.user!.id,
    action: "drive.delete",
    entityType: "Drive",
    entityId: id,
    metadata: { title: drive.title, applicationsDeleted: appResult.deletedCount },
  });

  sendSuccess(res, 200, {
    deleted: true,
    applicationsDeleted: appResult.deletedCount,
  });
}

export async function putAssignments(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid drive id", "VALIDATION_ERROR");
  }
  const drive = await Drive.findById(id);
  if (!drive) {
    throw new AppError(404, "Drive not found", "NOT_FOUND");
  }

  const body = req.body as { sectionAssignments?: unknown };
  if (!Array.isArray(body.sectionAssignments)) {
    throw new AppError(
      400,
      "sectionAssignments array required",
      "VALIDATION_ERROR"
    );
  }

  const normalized: ISectionAssignment[] = [];
  for (const row of body.sectionAssignments) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const department =
      typeof r.department === "string" ? r.department.trim() : "";
    if (!department) {
      throw new AppError(
        400,
        "Each assignment needs department",
        "VALIDATION_ERROR"
      );
    }
    const sections = Array.isArray(r.sections)
      ? (r.sections as unknown[])
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    normalized.push({ department, sections });
  }

  drive.sectionAssignments = normalized;
  await drive.save();

  await recordAudit({
    actorId: req.user!.id,
    action: "drive.assignments.update",
    entityType: "Drive",
    entityId: drive.id,
    metadata: { count: normalized.length },
  });

  sendSuccess(res, 200, { drive: serializeDrive(drive) });
}

export async function applyToDrive(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid drive id", "VALIDATION_ERROR");
  }
  if (req.user!.role !== "student") {
    throw new AppError(403, "Only students can apply", "FORBIDDEN");
  }

  const drive = await Drive.findById(id);
  if (!drive) {
    throw new AppError(404, "Drive not found", "NOT_FOUND");
  }

  const student = await User.findById(req.user!.id);
  if (!student) {
    throw new AppError(404, "User not found", "NOT_FOUND");
  }

  const ev = evaluateEligibility(student, drive);
  if (!ev.eligible) {
    throw new AppError(400, ev.reasons.join(" "), "NOT_ELIGIBLE", ev.reasons);
  }

  try {
    const application = await Application.create({
      student: student.id,
      drive: drive.id,
      status: "applied",
    });

    await recordAudit({
      actorId: student.id,
      action: "application.submit",
      entityType: "Application",
      entityId: application.id,
      metadata: { driveId: drive.id },
    });

    sendSuccess(res, 201, { application });
  } catch (e: unknown) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: number }).code === 11000
    ) {
      throw new AppError(409, "Already applied to this drive", "CONFLICT");
    }
    throw e;
  }
}
