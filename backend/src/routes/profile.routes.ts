import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as profile from "../controllers/profile.controller.js";

export const profileRouter = Router();

profileRouter.use(authenticate);

// Student routes
profileRouter.post("/edit-requests", authorize("student"), asyncHandler(profile.submitEditRequest));
profileRouter.get("/edit-requests/me", authorize("student"), asyncHandler(profile.getMyEditRequest));

// TPO routes
profileRouter.get("/edit-requests", authorize("tpo"), asyncHandler(profile.listEditRequests));
profileRouter.patch("/edit-requests/:id/review", authorize("tpo"), asyncHandler(profile.reviewEditRequest));
