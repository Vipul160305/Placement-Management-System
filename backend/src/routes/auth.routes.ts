import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loginRules,
  refreshRules,
  registerRules,
} from "../validators/auth.validators.js";
import * as auth from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  registerRules,
  validateRequest,
  asyncHandler(auth.register)
);
authRouter.post("/login", loginLimiter, loginRules, validateRequest, asyncHandler(auth.login));
authRouter.post(
  "/refresh",
  refreshRules,
  validateRequest,
  asyncHandler(auth.refresh)
);
authRouter.post("/logout", authenticate, asyncHandler(auth.logout));
