import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { parseRole } from "../middleware/auth.js";
import { recordAudit } from "../services/auditService.js";

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
  const { role } = req.query as { role?: string };
  const filter =
    role && ["admin", "tpo", "coordinator", "student"].includes(role)
      ? { role }
      : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
  sendSuccess(res, 200, { users: users.map(publicUser) });
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
    throw new AppError(400, "Cannot delete own account here", "VALIDATION_ERROR");
  }
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(404, "User not found", "NOT_FOUND");
  }
  if (user.role === "admin") {
    throw new AppError(403, "Admin users cannot be deleted", "FORBIDDEN");
  }
  await User.findByIdAndDelete(id);

  await recordAudit({
    actorId: req.user!.id,
    action: "user.delete",
    entityType: "User",
    entityId: id,
    metadata: { email: user.email },
  });

  sendSuccess(res, 200, { deleted: true });
}
