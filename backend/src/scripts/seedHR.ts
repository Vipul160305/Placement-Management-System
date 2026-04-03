/**
 * Seeds 2 HR accounts linked to the first 2 companies in the DB.
 * Removes existing coordinator accounts first.
 * Usage: npx tsx src/scripts/seedHR.ts
 */
import "dotenv/config";
import { connectDb, disconnectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  await connectDb();

  // Remove old coordinator accounts
  const deleted = await User.deleteMany({ role: "coordinator" });
  console.log(`Removed ${deleted.deletedCount} coordinator account(s).`);

  const companies = await Company.find().sort({ createdAt: 1 }).limit(2);
  if (companies.length === 0) {
    console.log("No companies found. Create companies first via the TPO dashboard.");
    await disconnectDb();
    return;
  }

  const hrSeeds = [
    { name: "HR Manager 1", email: "hr1@company1.com", password: "Hr@123456" },
    { name: "HR Manager 2", email: "hr2@company2.com", password: "Hr@123456" },
  ];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]!;
    const seed = hrSeeds[i]!;

    const existing = await User.findOne({ role: "hr", companyId: company._id });
    if (existing) {
      console.log(`HR already exists for ${company.name}: ${existing.email}`);
      continue;
    }

    const emailTaken = await User.findOne({ email: seed.email });
    const email = emailTaken ? `hr${i + 1}@${company.name.toLowerCase().replace(/\s+/g, "")}.com` : seed.email;

    const hashed = await hashPassword(seed.password);
    const hr = await User.create({
      name: seed.name,
      email,
      password: hashed,
      role: "hr",
      companyId: company._id,
    });
    console.log(`Created HR for ${company.name}: ${hr.email} / ${seed.password}`);
  }

  await disconnectDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
