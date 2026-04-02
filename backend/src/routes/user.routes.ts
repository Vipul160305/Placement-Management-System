import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as user from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/me", authenticate, asyncHandler(user.me));

userRouter.get("/", authenticate, authorize("admin"), asyncHandler(user.listUsers));
userRouter.post("/", authenticate, authorize("admin"), asyncHandler(user.createUser));
userRouter.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(user.updateUser)
);
userRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(user.deleteUser)
);
