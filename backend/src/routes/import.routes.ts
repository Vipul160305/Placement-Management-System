import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { csvUpload } from "../middleware/csvUpload.js";
import * as imp from "../controllers/import.controller.js";

export const importRouter = Router();

importRouter.post(
  "/students",
  authenticate,
  authorize("admin"),
  csvUpload.single("file"),
  asyncHandler(imp.importStudents)
);

importRouter.post(
  "/companies",
  authenticate,
  authorize("admin", "tpo"),
  csvUpload.single("file"),
  asyncHandler(imp.importCompanies)
);
