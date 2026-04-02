import type { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { recordAudit } from "../services/auditService.js";

function stripBom(buf: Buffer): Buffer {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3);
  }
  return buf;
}

function normKey(k: string): string {
  return k
    .replace(/^\ufeff/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function rowMap(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[normKey(k)] = v == null ? "" : String(v).trim();
  }
  return out;
}

function parseCsvBuffer(buf: Buffer): Record<string, string>[] {
  const raw = parse(stripBom(buf), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, unknown>[];
  return raw.map(rowMap);
}

export async function importStudents(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file?.buffer?.length) {
    throw new AppError(400, "CSV file required (field name: file)", "VALIDATION_ERROR");
  }

  let rows: Record<string, string>[];
  try {
    rows = parseCsvBuffer(file.buffer);
  } catch {
    throw new AppError(400, "Invalid CSV format", "VALIDATION_ERROR");
  }

  let created = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const rowNum = i + 2;
    const name = r.name;
    const email = r.email?.toLowerCase();
    const password = r.password;
    const department = r.department;
    const section = r.section;
    const branch = r.branch || r.department || "";
    const cgpaStr = r.cgpa ?? r.c_gpa ?? "";
    const backlogStr = r.backlog_count ?? r.backlogs ?? r.backlogcount ?? "";

    if (!name || !email || !password) {
      errors.push({ row: rowNum, message: "name, email, password required" });
      continue;
    }
    if (!department || !section) {
      errors.push({ row: rowNum, message: "department and section required" });
      continue;
    }

    const cgpa = cgpaStr === "" ? 0 : Number(cgpaStr);
    if (Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errors.push({ row: rowNum, message: "cgpa must be 0–10" });
      continue;
    }
    const backlogCount = backlogStr === "" ? 0 : Number(backlogStr);
    if (Number.isNaN(backlogCount) || backlogCount < 0) {
      errors.push({ row: rowNum, message: "backlog count must be a non-negative number" });
      continue;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      errors.push({ row: rowNum, message: "email already exists" });
      continue;
    }

    try {
      const hashed = await hashPassword(password);
      await User.create({
        name,
        email,
        password: hashed,
        role: "student",
        department,
        section,
        branch: branch || department,
        cgpa,
        backlogCount,
      });
      created += 1;
    } catch {
      errors.push({ row: rowNum, message: "could not create user" });
    }
  }

  await recordAudit({
    actorId: req.user!.id,
    action: "import.students",
    entityType: "User",
    metadata: { created, failed: errors.length, fileName: file.originalname },
  });

  sendSuccess(res, 200, {
    imported: created,
    failed: errors.length,
    rowErrors: errors.slice(0, 100),
    truncated: errors.length > 100,
  });
}

export async function importCompanies(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file?.buffer?.length) {
    throw new AppError(400, "CSV file required (field name: file)", "VALIDATION_ERROR");
  }

  let rows: Record<string, string>[];
  try {
    rows = parseCsvBuffer(file.buffer);
  } catch {
    throw new AppError(400, "Invalid CSV format", "VALIDATION_ERROR");
  }

  let created = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const rowNum = i + 2;
    const name = r.name;
    const website = r.website ?? "";
    const contactEmail = r.contact_email ?? r.contactemail ?? "";
    const contactPhone = r.contact_phone ?? r.contactphone ?? "";

    if (!name) {
      errors.push({ row: rowNum, message: "name required" });
      continue;
    }

    try {
      await Company.create({
        name,
        website: website || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        createdBy: req.user!.id,
      });
      created += 1;
    } catch {
      errors.push({ row: rowNum, message: "could not create company" });
    }
  }

  await recordAudit({
    actorId: req.user!.id,
    action: "import.companies",
    entityType: "Company",
    metadata: { created, failed: errors.length, fileName: file.originalname },
  });

  sendSuccess(res, 200, {
    imported: created,
    failed: errors.length,
    rowErrors: errors.slice(0, 100),
    truncated: errors.length > 100,
  });
}
