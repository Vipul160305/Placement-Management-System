import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Company } from "../models/Company.js";
import { Drive } from "../models/Drive.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { recordAudit } from "../services/auditService.js";

export async function listCompanies(_req: Request, res: Response): Promise<void> {
  const companies = await Company.find().sort({ name: 1 }).limit(500);
  sendSuccess(res, 200, { companies });
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

  const company = await Company.create({
    name: name.trim(),
    website: typeof body.website === "string" ? body.website.trim() : undefined,
    contactEmail:
      typeof body.contactEmail === "string" ? body.contactEmail.trim() : undefined,
    contactPhone:
      typeof body.contactPhone === "string" ? body.contactPhone.trim() : undefined,
    createdBy: req.user!.id,
  });

  await recordAudit({
    actorId: req.user!.id,
    action: "company.create",
    entityType: "Company",
    entityId: company.id,
    metadata: { name: company.name },
  });

  sendSuccess(res, 201, { company });
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
  if (typeof body.contactEmail === "string")
    company.contactEmail = body.contactEmail.trim();
  if (typeof body.contactPhone === "string")
    company.contactPhone = body.contactPhone.trim();

  await company.save();

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
    throw new AppError(
      400,
      "Cannot delete company that has drives",
      "VALIDATION_ERROR"
    );
  }
  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    throw new AppError(404, "Company not found", "NOT_FOUND");
  }

  await recordAudit({
    actorId: req.user!.id,
    action: "company.delete",
    entityType: "Company",
    entityId: id,
  });

  sendSuccess(res, 200, { deleted: true });
}
