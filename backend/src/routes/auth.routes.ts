import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as auth from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(auth.register));
authRouter.post("/login", asyncHandler(auth.login));
authRouter.post("/refresh", asyncHandler(auth.refresh));
authRouter.post("/logout", authenticate, asyncHandler(auth.logout));
