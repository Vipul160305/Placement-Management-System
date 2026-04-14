import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { parseRole } from "../middleware/auth.js";
import { recordAudit } from "../services/auditService.js";
import { cloudinary, RESUME_FOLDER } from "../config/cloudinary.js";

function publicUser(u: InstanceType<typeof User>) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    section: u.section,
    branch: u.branch,
    cgpa: u.cgpa,
    backlogCount: u.backlogCount,
    hasResume: !!(u.resumeUrl),
    companyId: u.companyId?.toString() || null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found", "NOT_FOUND");
  }
  sendSuccess(res, 200, { user: publicUser(user) });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const { role, search } = req.query as { role?: string; search?: string };

  const filter: Record<string, unknown> = {};
  if (role && ["tpo", "hr", "student"].includes(role)) filter.role = role;
  if (search?.trim()) {
    const re = new RegExp(search.trim(), "i");
    filter.$or = [{ name: re }, { email: re }];
  }

  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "50", 10)));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, {
    users: users.map(publicUser),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const name = body.name;
  const email = body.email;
  const password = body.password;
  const roleRaw = body.role;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof roleRaw !== "string"
  ) {
    throw new AppError(
      400,
      "name, email, password, role required",
      "VALIDATION_ERROR"
    );
  }

  const role = parseRole(roleRaw);
  const exists = await User.findOne({
    email: email.toLowerCase().trim(),
  });
  if (exists) {
    throw new AppError(409, "Email already exists", "CONFLICT");
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    role,
    department:
      typeof body.department === "string" ? body.department.trim() : undefined,
    section:
      typeof body.section === "string" ? body.section.trim() : undefined,
    branch: typeof body.branch === "string" ? body.branch.trim() : undefined,
    cgpa: typeof body.cgpa === "number" ? body.cgpa : undefined,
    backlogCount:
      typeof body.backlogCount === "number" ? body.backlogCount : 0,
  });

  const actorId = req.user!.id;
  await recordAudit({
    actorId,
    action: "user.create",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  sendSuccess(res, 201, { user: publicUser(user) });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, "User not found", "NOT_FOUND");
  }

  const body = req.body as Record<string, unknown>;
  if (typeof body.name === "string") user.name = body.name.trim();
  if (typeof body.department === "string")
    user.department = body.department.trim();
  if (typeof body.section === "string") user.section = body.section.trim();
  if (typeof body.branch === "string") user.branch = body.branch.trim();
  if (typeof body.cgpa === "number") user.cgpa = body.cgpa;
  if (typeof body.backlogCount === "number")
    user.backlogCount = body.backlogCount;
  if (typeof body.role === "string") user.role = parseRole(body.role);
  if (typeof body.password === "string" && body.password.length > 0) {
    user.password = await hashPassword(body.password);
  }
  if (typeof body.email === "string") {
    const nextEmail = body.email.toLowerCase().trim();
    if (nextEmail !== user.email) {
      const taken = await User.findOne({ email: nextEmail });
      if (taken) {
        throw new AppError(409, "Email already exists", "CONFLICT");
      }
      user.email = nextEmail;
    }
  }

  await user.save();

  await recordAudit({
    actorId: req.user!.id,
    action: "user.update",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });

  sendSuccess(res, 200, { user: publicUser(user) });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (id === req.user?.id) {
    throw new AppError(400, "Cannot delete your own account", "VALIDATION_ERROR");
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError(404, "User not found", "NOT_FOUND");
  }

  await recordAudit({
    actorId: req.user!.id,
    action: "user.delete",
    entityType: "User",
    entityId: id,
    metadata: { email: user.email },
  });

  sendSuccess(res, 200, { deleted: true });
}

/** Upload a helper that streams a buffer to Cloudinary */
function uploadToCloudinary(
  buffer: Buffer,
  publicId: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: RESUME_FOLDER,
        public_id: publicId,
        resource_type: "raw", // PDF is a raw file, not an image
        overwrite: true,
        format: "pdf",
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function uploadResume(req: Request, res: Response): Promise<void> {
  if (!req.file?.buffer) {
    throw new AppError(400, "PDF file required (field name: resume)", "VALIDATION_ERROR");
  }

  const userId = req.user!.id;
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

  // Delete old resume from Cloudinary if exists
  if (user.resumePublicId) {
    await cloudinary.uploader.destroy(user.resumePublicId, { resource_type: "raw" }).catch(() => {});
  }

  const publicId = `resume_${userId}`;
  const { secure_url, public_id } = await uploadToCloudinary(req.file.buffer, publicId);

  user.resumeUrl = secure_url;
  user.resumePublicId = public_id;
  await user.save();

  await recordAudit({
    actorId: userId,
    action: "user.resume.upload",
    entityType: "User",
    entityId: userId,
    metadata: { filename: req.file.originalname },
  });

  sendSuccess(res, 200, {
    message: "Resume uploaded successfully",
    resumeUrl: secure_url,
    uploadDate: new Date().toISOString(),
  });
}

export async function getResume(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found", "NOT_FOUND");
  if (!user.resumeUrl) throw new AppError(404, "No resume uploaded yet", "NOT_FOUND");
  sendSuccess(res, 200, { resumeUrl: user.resumeUrl });
}

/** Staff (tpo, hr) view a specific student's resume */
export async function getStudentResume(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid user id", "VALIDATION_ERROR");
  }
  const student = await User.findById(id);
  if (!student || student.role !== "student") {
    throw new AppError(404, "Student not found", "NOT_FOUND");
  }
  if (!student.resumeUrl) {
    throw new AppError(404, "Student has not uploaded a resume", "NOT_FOUND");
  }
  sendSuccess(res, 200, { resumeUrl: student.resumeUrl });
}
