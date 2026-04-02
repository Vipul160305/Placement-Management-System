import mongoose from "mongoose";
import { env } from "./env.js";

function connectionHint(uri: string, err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const code =
    err && typeof err === "object" && "code" in err
      ? (err as { code?: number }).code
      : undefined;
  const isBadAuth =
    msg.includes("bad auth") ||
    msg.includes("authentication failed") ||
    code === 8000;

  if (isBadAuth) {
    return [
      "",
      "MongoDB authentication failed (wrong username/password in MONGODB_URI).",
      "  • In Atlas: Database Access → confirm the database USER name and PASSWORD.",
      "  • In the URI, special characters in the password must be URL-encoded (@ → %40, # → %23, etc.).",
      "  • Use the password you set for that DB user, not your Atlas account login.",
      "",
    ].join("\n");
  }

  const isRefused =
    msg.includes("ECONNREFUSED") || msg.includes("ServerSelection");

  if (!isRefused) {
    return "";
  }

  const isLocal =
    uri.includes("127.0.0.1") ||
    uri.includes("localhost") ||
    uri.includes("mongodb://mongo:");

  if (isLocal) {
    return [
      "",
      "MongoDB refused the connection. Options:",
      "  1. Install/start MongoDB locally (Windows: MongoDB Community + run mongod / the Windows service), or",
      "  2. Set MONGODB_URI in .env to a MongoDB Atlas connection string (mongodb+srv://...)",
      "",
    ].join("\n");
  }

  return [
    "",
    "Could not reach MongoDB. Check MONGODB_URI in .env (Atlas IP allowlist, user/password).",
    "",
  ].join("\n");
}

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri);
  } catch (err) {
    console.error(connectionHint(env.mongoUri, err));
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
