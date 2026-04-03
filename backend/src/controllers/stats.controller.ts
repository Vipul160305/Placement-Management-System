import type { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import { getDepartmentStats, getOverviewStats } from "../services/statsService.js";
import { Drive } from "../models/Drive.js";
import { User } from "../models/User.js";
import { Application } from "../models/Application.js";

export async function overview(req: Request, res: Response): Promise<void> {
  const data = await getOverviewStats(req);
  sendSuccess(res, 200, data);
}

export async function byDepartment(req: Request, res: Response): Promise<void> {
  const departments = await getDepartmentStats(req);
  sendSuccess(res, 200, { departments });
}

/** Combined live stats for the TPO dashboard home page */
export async function dashboardStats(_req: Request, res: Response): Promise<void> {
  const [
    totalStudents,
    totalTPO,
    totalHR,
    openDrives,
    totalDrives,
    offeredCount,
    totalApplications,
    pastDrives,
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "tpo" }),
    User.countDocuments({ role: "hr" }),
    Drive.countDocuments({ status: "open" }),
    Drive.countDocuments(),
    Application.countDocuments({ status: "offered" }),
    Application.countDocuments(),
    Drive.find({ status: "closed" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("company", "name"),
  ]);

  const placementRate =
    totalStudents > 0
      ? Math.round((offeredCount / totalStudents) * 10000) / 100
      : 0;

  sendSuccess(res, 200, {
    totalStudents,
    totalTPO,
    totalHR,
    openDrives,
    totalDrives,
    offeredCount,
    totalApplications,
    placementRate,
    pastDrives: pastDrives.map((d) => ({
      id: d.id,
      title: d.title,
      company: d.company,
      jobRole: d.jobRole,
      package: d.package,
      scheduledAt: d.scheduledAt,
      updatedAt: d.updatedAt,
    })),
  });
}
