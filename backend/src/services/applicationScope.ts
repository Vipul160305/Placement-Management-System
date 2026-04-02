import type { Request } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { escapeRegex } from "../utils/escapeRegex.js";

/** Same visibility rules as list applications (for exports and JSON list). */
export async function applicationFilterForRole(
  req: Request
): Promise<Record<string, unknown>> {
  const role = req.user!.role;
  const { driveId } = req.query as { driveId?: string };

  let filter: Record<string, unknown> = {};
  if (driveId && mongoose.Types.ObjectId.isValid(driveId)) {
    filter.drive = driveId;
  }

  if (role === "coordinator") {
    const dept = req.user!.department?.trim();
    if (!dept) {
      return { ...filter, student: { $in: [] } };
    }
    const students = await User.find({
      role: "student",
      department: new RegExp(`^${escapeRegex(dept)}$`, "i"),
    }).select("_id");
    const ids = students.map((s) => s._id);
    filter.student = { $in: ids };
  }

  if (role === "student") {
    filter.student = req.user!.id;
  }

  return filter;
}
