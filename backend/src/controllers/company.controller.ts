import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { Drive } from "../models/Drive.js";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { recordAudit } from "../services/auditService.js";

export async function listCompanies(_req: Request, res: Response): Promise<void> {
  const companies = await Company.find().sort({ name: 1 }).limit(500);
  // Attach HR user info to each company
  const companyIds = companies.map((c) => c._id);
  const hrUsers = await User.find({ role: "hr", companyId: { $in: companyIds } })
    .select("name email companyId");
  const hrMap = new Map<string, { name: string; email: string }>();
  for (const u of hrUsers) {
    if (u.companyId) hrMap.set(u.companyId.toString(), { name: u.name, email: u.email });
  }
  const result = companies.map((c) => ({
    id: c.id,
    _id: c._id,
    name: c.name,
    website: c.website,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    hr: hrMap.get(c.id) || null,
  }));
  sendSuccess(res, 200, { companies: result });
}

export async function getCompany(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid company id", "VALIDATION_ERROR");
  }
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(404, "Company not found", "NOT_FOUND");
  }
  sendSuccess(res, 200, { company });
}

export async function createCompany(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>;
  const name = body.name;
  if (typeof name !== "string" || !name.trim()) {
    throw new AppError(400, "name required", "VALIDATION_ERROR");
  }

  // HR credentials (optional — can be added later via update)
  const hrEmail = typeof body.hrEmail === "string" ? body.hrEmail.trim().toLowerCase() : null;
  const hrPassword = typeof body.hrPassword === "string" ? body.hrPassword.trim() : null;
  const hrName = typeof body.hrName === "string" ? body.hrName.trim() : `${name.trim()} HR`;

  if (hrEmail && !hrPassword) {
    throw new AppError(400, "hrPassword required when hrEmail is provided", "VALIDATION_ERROR");
  }
  if (hrEmail) {
    const exists = await User.findOne({ email: hrEmail });
    if (exists) throw new AppError(409, "HR email already registered", "CONFLICT");
  }

  const company = await Company.create({
    name: name.trim(),
    website: typeof body.website === "string" ? body.website.trim() : undefined,
    contactEmail: typeof body.contactEmail === "string" ? body.contactEmail.trim() : undefined,
    contactPhone: typeof body.contactPhone === "string" ? body.contactPhone.trim() : undefined,
    createdBy: req.user!.id,
  });

  let hrUser = null;
  if (hrEmail && hrPassword) {
    const hashed = await hashPassword(hrPassword);
    hrUser = await User.create({
      name: hrName,
      email: hrEmail,
      password: hashed,
      role: "hr",
      companyId: company._id,
    });
    await recordAudit({
      actorId: req.user!.id,
      action: "user.create",
      entityType: "User",
      entityId: hrUser.id,
      metadata: { email: hrUser.email, role: "hr", companyId: company.id },
    });
  }

  await recordAudit({
    actorId: req.user!.id,
    action: "company.create",
    entityType: "Company",
    entityId: company.id,
    metadata: { name: company.name },
  });

  sendSuccess(res, 201, {
    company: {
      id: company.id,
      name: company.name,
      website: company.website,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      hr: hrUser ? { name: hrUser.name, email: hrUser.email } : null,
    },
  });
}

export async function updateCompany(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid company id", "VALIDATION_ERROR");
  }
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError(404, "Company not found", "NOT_FOUND");
  }

  const body = req.body as Record<string, unknown>;
  if (typeof body.name === "string") company.name = body.name.trim();
  if (typeof body.website === "string") company.website = body.website.trim();
  if (typeof body.contactEmail === "string") company.contactEmail = body.contactEmail.trim();
  if (typeof body.contactPhone === "string") company.contactPhone = body.contactPhone.trim();
  await company.save();

  // Update or create HR credentials if provided
  const hrEmail = typeof body.hrEmail === "string" ? body.hrEmail.trim().toLowerCase() : null;
  const hrPassword = typeof body.hrPassword === "string" ? body.hrPassword.trim() : null;
  const hrName = typeof body.hrName === "string" ? body.hrName.trim() : null;

  if (hrEmail) {
    let hrUser = await User.findOne({ role: "hr", companyId: company._id });
    if (hrUser) {
      // Update existing HR
      if (hrEmail !== hrUser.email) {
        const taken = await User.findOne({ email: hrEmail });
        if (taken && taken.id !== hrUser.id) throw new AppError(409, "HR email already in use", "CONFLICT");
        hrUser.email = hrEmail;
      }
      if (hrName) hrUser.name = hrName;
      if (hrPassword) hrUser.password = await hashPassword(hrPassword);
      await hrUser.save();
    } else {
      // Create new HR for this company
      if (!hrPassword) throw new AppError(400, "hrPassword required for new HR account", "VALIDATION_ERROR");
      const hashed = await hashPassword(hrPassword);
      hrUser = await User.create({
        name: hrName || `${company.name} HR`,
        email: hrEmail,
        password: hashed,
        role: "hr",
        companyId: company._id,
      });
    }
  }

  await recordAudit({
    actorId: req.user!.id,
    action: "company.update",
    entityType: "Company",
    entityId: company.id,
  });

  sendSuccess(res, 200, { company });
}

export async function deleteCompany(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid company id", "VALIDATION_ERROR");
  }
  const driveCount = await Drive.countDocuments({ company: id });
  if (driveCount > 0) {
    throw new AppError(400, "Cannot delete company that has drives", "VALIDATION_ERROR");
  }
  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    throw new AppError(404, "Company not found", "NOT_FOUND");
  }
  // Remove associated HR user
  await User.deleteMany({ role: "hr", companyId: id });

  await recordAudit({
    actorId: req.user!.id,
    action: "company.delete",
    entityType: "Company",
    entityId: id,
  });

  sendSuccess(res, 200, { deleted: true });
}
