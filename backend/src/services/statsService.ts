import type { Request } from "express";
import mongoose, { type PipelineStage } from "mongoose";
import { Application } from "../models/Application.js";
import { User } from "../models/User.js";
import { escapeRegex } from "../utils/escapeRegex.js";

function baseStages(req: Request): PipelineStage[] {
  const role = req.user!.role;
  const driveId = (req.query.driveId as string | undefined)?.trim();

  const stages: PipelineStage[] = [];

  if (driveId && mongoose.Types.ObjectId.isValid(driveId)) {
    stages.push({
      $match: { drive: new mongoose.Types.ObjectId(driveId) },
    });
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

  if (role === "coordinator") {
    const dept = req.user!.department?.trim();
    if (!dept) {
      stages.push({ $match: { _id: { $exists: false } } });
    } else {
      stages.push({
        $match: {
          "studentUser.department": new RegExp(`^${escapeRegex(dept)}$`, "i"),
        },
      });
    }
  }

  return stages;
}

export async function getOverviewStats(req: Request) {
  const role = req.user!.role;
  const driveId = (req.query.driveId as string | undefined)?.trim();

  const studentQuery: Record<string, unknown> = { role: "student" };
  if (role === "coordinator") {
    const dept = req.user!.department?.trim();
    if (!dept) {
      return {
        totalStudentsInScope: 0,
        studentsWithApplications: 0,
        applicationsByStatus: {} as Record<string, number>,
        offeredCount: 0,
        placementRateVsAllStudents: null as number | null,
        placementRateVsApplicants: null as number | null,
        driveId:
          driveId && mongoose.Types.ObjectId.isValid(driveId) ? driveId : null,
        denominatorNote:
          "placementRateVsAllStudents = offered / totalStudentsInScope; placementRateVsApplicants = offered / studentsWithApplications",
      };
    }
    studentQuery.department = new RegExp(`^${escapeRegex(dept)}$`, "i");
  }

  const totalStudentsInScope = await User.countDocuments(studentQuery);

  const statusStages = [
    ...baseStages(req),
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ];

  const statusRows = await Application.aggregate(statusStages);
  const applicationsByStatus: Record<string, number> = {};
  for (const row of statusRows) {
    applicationsByStatus[String(row._id)] = row.count;
  }

  const offeredCount = applicationsByStatus["offered"] ?? 0;

  const distinctStages = [
    ...baseStages(req),
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
    denominatorNote:
      "placementRateVsAllStudents = offered / totalStudentsInScope; placementRateVsApplicants = offered / studentsWithApplications",
  };
}

export async function getDepartmentStats(req: Request) {
  const stages = [
    ...baseStages(req),
    {
      $group: {
        _id: {
          $ifNull: ["$studentUser.department", "Unknown"],
        },
        totalApplications: { $sum: 1 },
        applied: {
          $sum: { $cond: [{ $eq: ["$status", "applied"] }, 1, 0] },
        },
        shortlisted: {
          $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
        },
        offered: {
          $sum: { $cond: [{ $eq: ["$status", "offered"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        withdrawn: {
          $sum: { $cond: [{ $eq: ["$status", "withdrawn"] }, 1, 0] },
        },
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
