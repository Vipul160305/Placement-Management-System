import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sendSuccess } from "./utils/apiResponse.js";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { companyRouter } from "./routes/company.routes.js";
import { driveRouter } from "./routes/drive.routes.js";
import { applicationRouter } from "./routes/applicationRoutes.js";
import { importRouter } from "./routes/import.routes.js";
import { exportRouter } from "./routes/export.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    sendSuccess(res, 200, { ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/companies", companyRouter);
  app.use("/api/drives", driveRouter);
  app.use("/api/applications", applicationRouter);
  app.use("/api/imports", importRouter);
  app.use("/api/exports", exportRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  app.use(errorHandler);
  return app;
}
