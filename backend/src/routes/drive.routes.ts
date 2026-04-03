import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as drive from "../controllers/drive.controller.js";

export const driveRouter = Router();

driveRouter.use(authenticate);

driveRouter.get("/", asyncHandler(drive.listDrives));

driveRouter.post(
  "/",
  authorize("tpo"),
  asyncHandler(drive.createDrive)
);

driveRouter.put(
  "/:id/assignments",
  authorize("admin", "tpo"),
  asyncHandler(drive.putAssignments)
);

driveRouter.post(
  "/:id/apply",
  authorize("student"),
  asyncHandler(drive.applyToDrive)
);

driveRouter.get("/:id", asyncHandler(drive.getDrive));
driveRouter.patch(
  "/:id",
  authorize("tpo"),
  asyncHandler(drive.updateDrive)
);
driveRouter.delete(
  "/:id",
  authorize("tpo"),
  asyncHandler(drive.deleteDrive)
);
