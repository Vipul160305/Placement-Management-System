/**
 * Full demo seed — wipes all collections and re-creates demo data.
 * Usage: npx tsx src/scripts/seedAll.ts
 *
 * Demo accounts created:
 *   TPO      : tpo@college.edu          / Tpo@123456
 *   HR       : hr@techcorp.com          / Hr@123456
 *   HR       : hr@innovate.com          / Hr@123456
 *   Students : student1@college.edu … student6@college.edu / Student@123456
 */
import "dotenv/config";
import { connectDb, disconnectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { Drive } from "../models/Drive.js";
import { Application } from "../models/Application.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  await connectDb();

  // ── 1. Wipe existing data ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Drive.deleteMany({}),
    Application.deleteMany({}),
  ]);
  console.log("✓ Cleared all collections");

  const pw = {
    tpo: await hashPassword("Tpo@123456"),
    hr: await hashPassword("Hr@123456"),
    student: await hashPassword("Student@123456"),
  };

  // ── 2. TPO ─────────────────────────────────────────────────────────────────
  const tpo = await User.create({
    name: "Placement Officer",
    email: "tpo@college.edu",
    password: pw.tpo,
    role: "tpo",
  });
  console.log(`✓ TPO: tpo@college.edu / Tpo@123456`);

  // ── 3. Companies ──────────────────────────────────────────────────────────
  const [techCorp, innovate] = await Company.insertMany([
    {
      name: "TechCorp Solutions",
      website: "https://techcorp.example.com",
      contactEmail: "recruit@techcorp.example.com",
      contactPhone: "9000000001",
      createdBy: tpo._id,
    },
    {
      name: "Innovate Labs",
      website: "https://innovate.example.com",
      contactEmail: "hr@innovate.example.com",
      contactPhone: "9000000002",
      createdBy: tpo._id,
    },
  ]);
  console.log(`✓ Companies: TechCorp Solutions, Innovate Labs`);

  // ── 4. HR users ───────────────────────────────────────────────────────────
  await User.insertMany([
    {
      name: "Alice HR",
      email: "hr@techcorp.com",
      password: pw.hr,
      role: "hr",
      companyId: techCorp!._id,
    },
    {
      name: "Bob HR",
      email: "hr@innovate.com",
      password: pw.hr,
      role: "hr",
      companyId: innovate!._id,
    },
  ]);
  console.log(`✓ HR: hr@techcorp.com, hr@innovate.com / Hr@123456`);

  // ── 5. Students ───────────────────────────────────────────────────────────
  const studentSeeds = [
    { name: "Rahul Sharma",   email: "student1@college.edu",  branch: "CSE", department: "Computer Science", section: "A", cgpa: 8.5, backlogCount: 0 },
    { name: "Priya Patel",    email: "student2@college.edu",  branch: "CSE", department: "Computer Science", section: "A", cgpa: 7.8, backlogCount: 1 },
    { name: "Arjun Mehta",    email: "student3@college.edu",  branch: "ECE", department: "Electronics",      section: "B", cgpa: 9.1, backlogCount: 0 },
    { name: "Sneha Reddy",    email: "student4@college.edu",  branch: "ECE", department: "Electronics",      section: "B", cgpa: 6.9, backlogCount: 2 },
    { name: "Karan Singh",    email: "student5@college.edu",  branch: "ME",  department: "Mechanical",       section: "A", cgpa: 7.2, backlogCount: 0 },
    { name: "Divya Nair",     email: "student6@college.edu",  branch: "CSE", department: "Computer Science", section: "B", cgpa: 8.9, backlogCount: 0 },
    { name: "Amit Verma",     email: "student7@college.edu",  branch: "CSE", department: "Computer Science", section: "A", cgpa: 7.5, backlogCount: 0 },
    { name: "Pooja Iyer",     email: "student8@college.edu",  branch: "ECE", department: "Electronics",      section: "A", cgpa: 8.2, backlogCount: 0 },
    { name: "Rohan Gupta",    email: "student9@college.edu",  branch: "ME",  department: "Mechanical",       section: "B", cgpa: 6.5, backlogCount: 1 },
    { name: "Ananya Das",     email: "student10@college.edu", branch: "CSE", department: "Computer Science", section: "B", cgpa: 9.3, backlogCount: 0 },
    { name: "Vikram Joshi",   email: "student11@college.edu", branch: "ECE", department: "Electronics",      section: "A", cgpa: 7.0, backlogCount: 2 },
    { name: "Meera Pillai",   email: "student12@college.edu", branch: "CSE", department: "Computer Science", section: "A", cgpa: 8.1, backlogCount: 0 },
    { name: "Siddharth Roy",  email: "student13@college.edu", branch: "ME",  department: "Mechanical",       section: "B", cgpa: 7.6, backlogCount: 0 },
    { name: "Kavya Menon",    email: "student14@college.edu", branch: "CSE", department: "Computer Science", section: "B", cgpa: 8.7, backlogCount: 0 },
    { name: "Nikhil Tiwari",  email: "student15@college.edu", branch: "ECE", department: "Electronics",      section: "B", cgpa: 6.8, backlogCount: 1 },
    { name: "Ishaan Kapoor",  email: "student16@college.edu", branch: "CSE", department: "Computer Science", section: "A", cgpa: 9.0, backlogCount: 0 },
  ];

  const students = await User.insertMany(
    studentSeeds.map((s) => ({ ...s, password: pw.student, role: "student" }))
  );
  console.log(`✓ Students: student1–student16@college.edu / Student@123456`);

  // ── 6. Drives ─────────────────────────────────────────────────────────────
  const now = new Date();
  const future = (days: number) => new Date(now.getTime() + days * 86_400_000);

  const [drive1, drive2, drive3] = await Drive.insertMany([
    {
      company: techCorp!._id,
      createdBy: tpo._id,
      title: "SDE Intern – TechCorp Solutions",
      description: "6-month internship for final-year students.",
      scheduledAt: future(10),
      minCgpa: 7.0,
      maxBacklogs: 1,
      allowedBranches: ["CSE", "ECE"],
      jobRole: "Software Engineer Intern",
      package: "20,000/month",
      status: "open",
      sectionAssignments: [
        { department: "Computer Science", sections: ["A", "B"] },
        { department: "Electronics",      sections: ["B"] },
      ],
    },
    {
      company: innovate!._id,
      createdBy: tpo._id,
      title: "Full Stack Developer – Innovate Labs",
      description: "Full-time role for 2025 graduates.",
      scheduledAt: future(20),
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: ["CSE"],
      jobRole: "Full Stack Developer",
      package: "8 LPA",
      status: "open",
      sectionAssignments: [
        { department: "Computer Science", sections: ["A", "B"] },
      ],
    },
    {
      company: techCorp!._id,
      createdBy: tpo._id,
      title: "Data Analyst – TechCorp Solutions",
      description: "Closed drive for reference.",
      scheduledAt: future(-5),
      minCgpa: 6.5,
      maxBacklogs: 2,
      allowedBranches: ["CSE", "ECE", "ME"],
      jobRole: "Data Analyst",
      package: "6 LPA",
      status: "closed",
      sectionAssignments: [],
    },
  ]);
  console.log(`✓ Drives: 2 open, 1 closed`);

  // ── 7. Applications ───────────────────────────────────────────────────────
  // drive1 (CSE/ECE, minCgpa 7, maxBacklogs 1)
  //   eligible: student1(CSE,8.5,0), student2(CSE,7.8,1), student3(ECE,9.1,0), student6(CSE,8.9,0)
  // drive2 (CSE, minCgpa 8, maxBacklogs 0)
  //   eligible: student1(8.5,0), student6(8.9,0)

  const apps = [
    { student: students[0]!._id, drive: drive1!._id, status: "shortlisted" },
    { student: students[1]!._id, drive: drive1!._id, status: "applied" },
    { student: students[2]!._id, drive: drive1!._id, status: "offered" },
    { student: students[5]!._id, drive: drive1!._id, status: "applied" },
    { student: students[0]!._id, drive: drive2!._id, status: "applied" },
    { student: students[5]!._id, drive: drive2!._id, status: "shortlisted" },
    // closed drive applications
    { student: students[0]!._id, drive: drive3!._id, status: "offered" },
    { student: students[2]!._id, drive: drive3!._id, status: "rejected" },
    { student: students[4]!._id, drive: drive3!._id, status: "offered" },
  ];

  await Application.insertMany(apps);
  console.log(`✓ Applications: ${apps.length} created`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────");
  console.log("  DEMO CREDENTIALS");
  console.log("─────────────────────────────────────────");
  console.log("  TPO      tpo@college.edu          Tpo@123456");
  console.log("  HR       hr@techcorp.com           Hr@123456");
  console.log("  HR       hr@innovate.com           Hr@123456");
  console.log("  Student  student1@college.edu      Student@123456");
  console.log("  Student  student2@college.edu      Student@123456");
  console.log("  Student  student3@college.edu      Student@123456");
  console.log("  Student  student4@college.edu      Student@123456");
  console.log("  Student  student5@college.edu      Student@123456");
  console.log("  Student  student6@college.edu      Student@123456");
  console.log("  Student  student7@college.edu      Student@123456");
  console.log("  Student  student8@college.edu      Student@123456");
  console.log("  Student  student9@college.edu      Student@123456");
  console.log("  Student  student10@college.edu     Student@123456");
  console.log("  Student  student11@college.edu     Student@123456");
  console.log("  Student  student12@college.edu     Student@123456");
  console.log("  Student  student13@college.edu     Student@123456");
  console.log("  Student  student14@college.edu     Student@123456");
  console.log("  Student  student15@college.edu     Student@123456");
  console.log("  Student  student16@college.edu     Student@123456");
  console.log("─────────────────────────────────────────\n");

  await disconnectDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
