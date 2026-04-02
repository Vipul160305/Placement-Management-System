import { body } from "express-validator";

export const registerRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().isEmail().withMessage("valid email required"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("password min length 6"),
  body("department").optional().isString().trim(),
  body("section").optional().isString().trim(),
  body("branch").optional().isString().trim(),
  body("cgpa").optional().isFloat({ min: 0, max: 10 }),
  body("backlogCount").optional().isInt({ min: 0 }),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("valid email required"),
  body("password").isString().notEmpty().withMessage("password required"),
];

export const refreshRules = [
  body("refreshToken").isString().notEmpty().withMessage("refreshToken required"),
];
