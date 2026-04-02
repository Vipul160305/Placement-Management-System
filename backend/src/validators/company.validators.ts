import { body } from "express-validator";

export const createCompanyRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("website").optional().isString().trim(),
  body("contactEmail").optional().isString().trim(),
  body("contactPhone").optional().isString().trim(),
];
