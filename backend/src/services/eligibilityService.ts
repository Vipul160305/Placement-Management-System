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

  if (drive.status !== "open") {
    reasons.push("Drive is not open for applications.");
  }

  const branch = (student.branch ?? student.department ?? "").trim();
  if (
    drive.allowedBranches.length > 0 &&
    !drive.allowedBranches.map((b) => b.toLowerCase()).includes(branch.toLowerCase())
  ) {
    reasons.push("Branch is not allowed for this drive.");
  }

  if (student.cgpa === undefined || student.cgpa === null) {
    reasons.push("Student CGPA is not set.");
  } else if (student.cgpa < drive.minCgpa) {
    reasons.push(`CGPA below minimum (${drive.minCgpa}).`);
  }

  const backlogs = student.backlogCount ?? 0;
  if (backlogs > drive.maxBacklogs) {
    reasons.push(`Backlog count exceeds maximum (${drive.maxBacklogs}).`);
  }

  if (drive.sectionAssignments.length === 0) {
    reasons.push("Drive has no section assignments yet.");
  }

  const dept = (student.department ?? "").trim();
  const section = (student.section ?? "").trim();
  if (!dept || !section) {
    reasons.push("Student department or section is not set.");
  } else {
    const match = drive.sectionAssignments.some(
      (a) =>
        a.department.trim().toLowerCase() === dept.toLowerCase() &&
        a.sections.some((s) => s.trim().toLowerCase() === section.toLowerCase())
    );
    if (!match) {
      reasons.push("Your section is not assigned to this drive.");
    }
  }

  return { eligible: reasons.length === 0, reasons };
}
