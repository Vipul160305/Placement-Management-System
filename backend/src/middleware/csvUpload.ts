import multer from "multer";
import { AppError } from "../utils/AppError.js";

const maxBytes = 5 * 1024 * 1024; // 5 MB

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter(_req, file, cb) {
    const ok =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (ok) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, "Only .csv files are allowed", "VALIDATION_ERROR"));
  },
});
