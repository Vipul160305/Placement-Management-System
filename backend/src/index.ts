import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";

const app = createApp();

let dbConnectionPromise: ReturnType<typeof connectDb> | null = null;

function ensureDbConnection() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDb().catch((error) => {
      dbConnectionPromise = null;
      throw error;
    });
  }

  return dbConnectionPromise;
}

export default async function handler(req: any, res: any) {
  await ensureDbConnection();
  return app(req, res);
}
