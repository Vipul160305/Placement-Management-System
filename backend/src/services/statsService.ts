import type { Request } from "express";
import mongoose, { type PipelineStage } from "mongoose";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { Drive } from "../models/Drive.js";

async function getHrDriveIds(req: Request): Promise<mongoose.Types.ObjectId[] | null> {
  const role = req.user!.role;
  if (role !== "hr") return null;
  const companyId = req.user!.companyId;
  if (!companyId) return [];
  const drives = await Drive.find({ company: companyId }).select("_id");
  return drives.map((d) => d._id as mongoose.Types.ObjectId);
}

function baseStages(driveIds: mongoose.Types.ObjectId[] | null, driveId?: string): PipelineStage[] {
  const stages: PipelineStage[] = [];

  if (driveIds !== null) {
    // HR: scope to their company's drives
    stages.push({ $match: { drive: { $in: driveIds } } });
  } else if (driveId && mongoose.Types.ObjectId.isValid(driveId)) {
    stages.push({ $match: { drive: new mongoose.Types.ObjectId(driveId) } });
  }

  stages.push(
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "studentUser",
      },
    },
    { $unwind: "$studentUser" },
    { $match: { "studentUser.role": "student" } }
  );

  return stages;
}

export async function getOverviewStats(req: Request) {
  const driveId = (req.query.driveId as string | undefined)?.trim();
  const hrDriveIds = await getHrDriveIds(req);

  const totalStudentsInScope = await User.countDocuments({ role: "student" });

  const statusStages = [
    ...baseStages(hrDriveIds, driveId),
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ];

  const statusRows = await Application.aggregate(statusStages);
  const applicationsByStatus: Record<string, number> = {};
  for (const row of statusRows) {
    applicationsByStatus[String(row._id)] = row.count;
  }

  const offeredCount = applicationsByStatus["offered"] ?? 0;

  const distinctStages = [
    ...baseStages(hrDriveIds, driveId),
    { $group: { _id: "$student" } },
    { $count: "n" },
  ];
  const distinctRes = await Application.aggregate(distinctStages);
  const studentsWithApplications = distinctRes[0]?.n ?? 0;

  const placementRateVsAllStudents =
    totalStudentsInScope > 0
      ? Math.round((offeredCount / totalStudentsInScope) * 10000) / 100
      : null;
  const placementRateVsApplicants =
    studentsWithApplications > 0
      ? Math.round((offeredCount / studentsWithApplications) * 10000) / 100
      : null;

  return {
    totalStudentsInScope,
    studentsWithApplications,
    applicationsByStatus,
    offeredCount,
    placementRateVsAllStudents,
    placementRateVsApplicants,
    driveId: driveId && mongoose.Types.ObjectId.isValid(driveId) ? driveId : null,
  };
}

export async function getDepartmentStats(req: Request) {
  const driveId = (req.query.driveId as string | undefined)?.trim();
  const hrDriveIds = await getHrDriveIds(req);

  const stages = [
    ...baseStages(hrDriveIds, driveId),
    {
      $group: {
        _id: { $ifNull: ["$studentUser.department", "Unknown"] },
        totalApplications: { $sum: 1 },
        applied: { $sum: { $cond: [{ $eq: ["$status", "applied"] }, 1, 0] } },
        shortlisted: { $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] } },
        offered: { $sum: { $cond: [{ $eq: ["$status", "offered"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        withdrawn: { $sum: { $cond: [{ $eq: ["$status", "withdrawn"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 as const } },
  ] satisfies PipelineStage[];

  const rows = await Application.aggregate(stages);
  return rows.map((r) => ({
    department: r._id as string,
    totalApplications: r.totalApplications,
    applied: r.applied,
    shortlisted: r.shortlisted,
    offered: r.offered,
    rejected: r.rejected,
    withdrawn: r.withdrawn,
  }));
}
