import type { Request, Response } from "express";
import { stringify } from "csv-stringify/sync";
import ExcelJS from "exceljs";
import { Application } from "../models/Application.js";
import { AppError } from "../utils/AppError.js";
import { applicationFilterForRole } from "../services/applicationScope.js";

type Row = Record<string, string>;

function formatRows(apps: InstanceType<typeof Application>[]): Row[] {
  return apps.map((a) => {
    const student = a.student as unknown as {
      name?: string;
      email?: string;
      department?: string;
      section?: string;
      branch?: string;
      cgpa?: number;
      backlogCount?: number;
    };
    const drive = a.drive as unknown as {
      title?: string;
      company?: { name?: string };
    };
    return {
      applicationId: String(a._id),
      studentName: student?.name ?? "",
      studentEmail: student?.email ?? "",
      department: student?.department ?? "",
      section: student?.section ?? "",
      branch: student?.branch ?? "",
      cgpa: student?.cgpa != null ? String(student.cgpa) : "",
      backlogs: student?.backlogCount != null ? String(student.backlogCount) : "",
      driveTitle: drive?.title ?? "",
      companyName: drive?.company && typeof drive.company === "object" ? drive.company.name ?? "" : "",
      status: a.status,
      updatedAt: a.updatedAt?.toISOString?.() ?? "",
    };
  });
}

async function loadApplications(
  req: Request,
  extraFilter: Record<string, unknown>
) {
  const base = await applicationFilterForRole(req);
  const filter = { ...base, ...extraFilter };
  return Application.find(filter)
    .populate("student", "name email department section branch cgpa backlogCount")
    .populate({
      path: "drive",
      select: "title company",
      populate: { path: "company", select: "name" },
    })
    .sort({ updatedAt: -1 })
    .limit(5000);
}

export async function exportApplications(req: Request, res: Response): Promise<void> {
  const format = ((req.query.format as string) || "csv").toLowerCase();
  if (!["csv", "xlsx"].includes(format)) {
    throw new AppError(400, 'format must be "csv" or "xlsx"', "VALIDATION_ERROR");
  }

  const apps = await loadApplications(req, {});
  const rows = formatRows(apps);
  await sendExport(res, rows, "applications", format === "xlsx");
}

export async function exportPlacedStudents(req: Request, res: Response): Promise<void> {
  const format = ((req.query.format as string) || "csv").toLowerCase();
  if (!["csv", "xlsx"].includes(format)) {
    throw new AppError(400, 'format must be "csv" or "xlsx"', "VALIDATION_ERROR");
  }

  const apps = await loadApplications(req, { status: "offered" });
  const rows = formatRows(apps);
  await sendExport(res, rows, "placed-students", format === "xlsx");
}

const EXPORT_HEADER = [
  "applicationId",
  "studentName",
  "studentEmail",
  "department",
  "section",
  "branch",
  "cgpa",
  "backlogs",
  "driveTitle",
  "companyName",
  "status",
  "updatedAt",
] as const;

async function sendExport(
  res: Response,
  rows: Row[],
  baseName: string,
  asXlsx: boolean
): Promise<void> {
  const header = rows.length > 0 ? (Object.keys(rows[0]!) as string[]) : [...EXPORT_HEADER];

  if (!asXlsx) {
    const dataRows =
      rows.length > 0
        ? rows.map((r) => header.map((h) => r[h] ?? ""))
        : [];
    const csv = stringify([header, ...dataRows]);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${baseName}.csv"`);
    res.send("\ufeff" + csv);
    return;
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.addRow(header);
  for (const r of rows) {
    ws.addRow(header.map((h) => r[h] ?? ""));
  }
  const buf = await wb.xlsx.writeBuffer();
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${baseName}.xlsx"`);
  res.send(Buffer.from(buf));
}
