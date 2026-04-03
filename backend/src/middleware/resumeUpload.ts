import multer from "multer";
import { AppError } from "../utils/AppError.js";

// Store in memory — we stream directly to Cloudinary, no disk needed
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter(_req, file, cb) {
    const ok =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (ok) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, "Only PDF files are allowed", "VALIDATION_ERROR"));
  },
});
