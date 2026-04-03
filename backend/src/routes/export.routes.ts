import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as exp from "../controllers/export.controller.js";

export const exportRouter = Router();

exportRouter.use(authenticate);
exportRouter.use(authorize("tpo", "hr"));

exportRouter.get("/applications", asyncHandler(exp.exportApplications));
exportRouter.get("/placed-students", asyncHandler(exp.exportPlacedStudents));
