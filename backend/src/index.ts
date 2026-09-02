import { createApp } from "../src/app.js";
import { connectDb } from "../src/config/db.js";

const app = createApp();

let dbConnectionPromise: Promise<void> | null = null;

function ensureDbConnection() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDb();
  }

  return dbConnectionPromise;
}

export default async function handler(req: any, res: any) {
  await ensureDbConnection();
  return app(req, res);
}
