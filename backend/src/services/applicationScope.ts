import type { Request } from "express";
import mongoose from "mongoose";
import { Drive } from "../models/Drive.js";

/** Returns a MongoDB filter for applications based on the user's role. */
export async function applicationFilterForRole(
  req: Request
): Promise<Record<string, unknown>> {
  const role = req.user!.role;
  const { driveId } = req.query as { driveId?: string };

  let filter: Record<string, unknown> = {};
  if (driveId && mongoose.Types.ObjectId.isValid(driveId)) {
    filter.drive = driveId;
  }

  if (role === "hr") {
    // HR sees only applications for drives belonging to their company
    const companyId = req.user!.companyId;
    if (!companyId) return { ...filter, drive: { $in: [] } };
    const drives = await Drive.find({ company: companyId }).select("_id");
    const driveIds = drives.map((d) => d._id);
    // If a specific driveId was requested, intersect
    if (filter.drive) {
      const requestedId = filter.drive as string;
      const allowed = driveIds.map((d) => d.toString());
      if (!allowed.includes(requestedId)) {
        return { drive: { $in: [] } }; // no access
      }
    } else {
      filter.drive = { $in: driveIds };
    }
  }

  if (role === "student") {
    filter.student = req.user!.id;
  }

  return filter;
}
