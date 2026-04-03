import type { IDrive } from "../models/Drive.js";
import type { IUser } from "../models/User.js";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export function evaluateEligibility(
  student: IUser,
  drive: IDrive
): EligibilityResult {
  const reasons: string[] = [];

  // --- Drive state ---
  if (drive.status !== "open") {
    reasons.push("Drive is not open for applications.");
  }

  // --- Required profile fields ---
  if (!student.department?.trim()) {
    reasons.push("Your department is not set on your profile.");
  }
  if (!student.section?.trim()) {
    reasons.push("Your section is not set on your profile.");
  }
  if (!student.branch?.trim() && !student.department?.trim()) {
    reasons.push("Your branch is not set on your profile.");
  }

  // --- Resume ---
  if (!student.resumeUrl) {
    reasons.push("You have not uploaded a resume. Please upload your resume before applying.");
  }

  // --- Branch eligibility ---
  const branch = (student.branch ?? student.department ?? "").trim();
  if (
    drive.allowedBranches.length > 0 &&
    !drive.allowedBranches.map((b) => b.toLowerCase()).includes(branch.toLowerCase())
  ) {
    reasons.push(`Your branch (${branch || "not set"}) is not eligible for this drive.`);
  }

  // --- CGPA ---
  if (student.cgpa === undefined || student.cgpa === null) {
    reasons.push("Your CGPA is not set on your profile.");
  } else if (student.cgpa < drive.minCgpa) {
    reasons.push(`CGPA ${student.cgpa} is below the minimum required (${drive.minCgpa}).`);
  }

  // --- Backlogs ---
  const backlogs = student.backlogCount ?? 0;
  if (backlogs > drive.maxBacklogs) {
    reasons.push(`You have ${backlogs} backlog(s); maximum allowed is ${drive.maxBacklogs}.`);
  }

  return { eligible: reasons.length === 0, reasons };
}
