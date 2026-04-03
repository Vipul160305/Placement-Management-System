import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as stats from "../controllers/stats.controller.js";

export const statsRouter = Router();

statsRouter.use(authenticate);
statsRouter.use(authorize("tpo", "hr"));

statsRouter.get("/overview", asyncHandler(stats.overview));
statsRouter.get("/by-department", asyncHandler(stats.byDepartment));
// Live dashboard stats for TPO
statsRouter.get("/dashboard", asyncHandler(stats.dashboardStats));
