import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as company from "../controllers/company.controller.js";

export const companyRouter = Router();

companyRouter.get("/", authenticate, asyncHandler(company.listCompanies));
companyRouter.get("/:id", authenticate, asyncHandler(company.getCompany));

companyRouter.post(
  "/",
  authenticate,
  authorize("admin", "tpo"),
  asyncHandler(company.createCompany)
);
companyRouter.patch(
  "/:id",
  authenticate,
  authorize("admin", "tpo"),
  asyncHandler(company.updateCompany)
);
companyRouter.delete(
  "/:id",
  authenticate,
  authorize("admin", "tpo"),
  asyncHandler(company.deleteCompany)
);
