import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { resumeUpload } from "../middleware/resumeUpload.js";
import * as user from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/me", authenticate, asyncHandler(user.me));

// Resume routes (student only)
userRouter.post(
  "/me/resume",
  authenticate,
  authorize("student"),
  resumeUpload.single("resume"),
  asyncHandler(user.uploadResume)
);
userRouter.get(
  "/me/resume",
  authenticate,
  authorize("student"),
  asyncHandler(user.getResume)
);

// Staff: view any student's resume
userRouter.get(
  "/:id/resume",
  authenticate,
  authorize("tpo", "hr"),
  asyncHandler(user.getStudentResume)
);

userRouter.get("/", authenticate, authorize("tpo"), asyncHandler(user.listUsers));
userRouter.post("/", authenticate, authorize("tpo"), asyncHandler(user.createUser));
userRouter.patch("/:id", authenticate, authorize("tpo"), asyncHandler(user.updateUser));
userRouter.delete("/:id", authenticate, authorize("tpo"), asyncHandler(user.deleteUser));
