import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as application from "../controllers/application.controller.js";

export const applicationRouter = Router();

applicationRouter.use(authenticate);

applicationRouter.get(
  "/me",
  authorize("student"),
  asyncHandler(application.listMyApplications)
);

applicationRouter.get(
  "/",
  authorize("admin", "tpo", "hr", "student"),
  asyncHandler(application.listApplications)
);

applicationRouter.patch(
  "/:id/status",
  authorize("admin", "tpo", "hr", "student"),
  asyncHandler(application.updateApplicationStatus)
);
