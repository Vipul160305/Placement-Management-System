/**
 * One-time: create admin if no admin exists.
 * Usage: npx tsx src/scripts/createAdmin.ts
 * Optional env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (defaults shown in logs)
 */
import "dotenv/config";
import { connectDb, disconnectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  await connectDb();
  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log("Admin already exists; skipping.");
    await disconnectDb();
    return;
  }

  const email = (
    process.env.ADMIN_EMAIL ?? "admin@example.com"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const name = process.env.ADMIN_NAME ?? "System Admin";

  const hashed = await hashPassword(password);
  await User.create({
    name,
    email,
    password: hashed,
    role: "admin",
  });

  console.log(`Created admin: ${email} (change password after first login).`);
  await disconnectDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
