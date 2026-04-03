/**
 * Seeds the first TPO account if none exists.
 * Usage: npx tsx src/scripts/createTPO.ts
 * Optional env: TPO_EMAIL, TPO_PASSWORD, TPO_NAME
 */
import "dotenv/config";
import { connectDb, disconnectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  await connectDb();

  const existing = await User.findOne({ role: "tpo" });
  if (existing) {
    console.log(`TPO already exists: ${existing.email}`);
    await disconnectDb();
    return;
  }

  const email = (process.env.TPO_EMAIL ?? "tpo@college.edu").toLowerCase();
  const password = process.env.TPO_PASSWORD ?? "Tpo@123456";
  const name = process.env.TPO_NAME ?? "Placement Officer";

  const hashed = await hashPassword(password);
  await User.create({ name, email, password: hashed, role: "tpo" });

  console.log(`Created TPO: ${email} / ${password}  (change password after first login)`);
  await disconnectDb();
}

main().catch((e) => { console.error(e); process.exit(1); });
