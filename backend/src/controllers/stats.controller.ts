import type { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import { getDepartmentStats, getOverviewStats } from "../services/statsService.js";

export async function overview(req: Request, res: Response): Promise<void> {
  const data = await getOverviewStats(req);
  sendSuccess(res, 200, data);
}

export async function byDepartment(req: Request, res: Response): Promise<void> {
  const departments = await getDepartmentStats(req);
  sendSuccess(res, 200, { departments });
}
