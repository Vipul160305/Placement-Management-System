// =====================
// MOCK DATA — PMS
// =====================

export const mockUsers = [
  { id: 1, name: "Arjun Sharma", email: "arjun@institute.edu", role: "student", department: "CSE", section: "A", cgpa: 8.5, backlogs: 0, status: "active" },
  { id: 2, name: "Priya Mehta", email: "priya@institute.edu", role: "student", department: "CSE", section: "B", cgpa: 7.9, backlogs: 1, status: "active" },
  { id: 3, name: "Rohan Patel", email: "rohan@institute.edu", role: "student", department: "ECE", section: "A", cgpa: 9.1, backlogs: 0, status: "active" },
  { id: 4, name: "Anjali Singh", email: "anjali@institute.edu", role: "student", department: "CSE", section: "A", cgpa: 6.8, backlogs: 2, status: "inactive" },
  { id: 5, name: "Dr. Suresh Kumar", email: "tpo@institute.edu", role: "tpo", department: "TPO Office", section: "-", cgpa: null, backlogs: null, status: "active" },
  { id: 6, name: "Ms. Divya Rao", email: "coord@institute.edu", role: "coordinator", department: "CSE", section: "A", cgpa: null, backlogs: null, status: "active" },
];

export const mockCompanies = [
  { id: 1, name: "Google", industry: "Technology", package: 42, eligibility: { minCGPA: 8.0, maxBacklogs: 0, departments: ["CSE", "ECE"] } },
  { id: 2, name: "Microsoft", industry: "Technology", package: 35, eligibility: { minCGPA: 7.5, maxBacklogs: 0, departments: ["CSE", "ECE", "IT"] } },
  { id: 3, name: "Infosys", industry: "IT Services", package: 6.5, eligibility: { minCGPA: 6.0, maxBacklogs: 2, departments: ["CSE", "ECE", "IT", "MECH"] } },
  { id: 4, name: "Atlan", industry: "Data Tech", package: 18, eligibility: { minCGPA: 7.0, maxBacklogs: 1, departments: ["CSE"] } },
  { id: 5, name: "Flipkart", industry: "E-Commerce", package: 22, eligibility: { minCGPA: 7.5, maxBacklogs: 0, departments: ["CSE", "ECE"] } },
];

export const mockDrives = [
  { id: 1, companyId: 1, companyName: "Google", role: "SWE Intern", date: "2026-04-15", deadline: "2026-04-10", status: "open", package: 42, departments: ["CSE", "ECE"], minCGPA: 8.0, maxBacklogs: 0, sections: ["CSE-A", "CSE-B"] },
  { id: 2, companyId: 2, companyName: "Microsoft", role: "Product Engineer", date: "2026-04-20", deadline: "2026-04-14", status: "open", package: 35, departments: ["CSE", "ECE"], minCGPA: 7.5, maxBacklogs: 0, sections: ["CSE-A"] },
  { id: 3, companyId: 3, companyName: "Infosys", role: "Systems Engineer", date: "2026-04-25", deadline: "2026-04-20", status: "open", package: 6.5, departments: ["CSE", "ECE", "IT"], minCGPA: 6.0, maxBacklogs: 2, sections: ["CSE-A", "CSE-B", "ECE-A"] },
  { id: 4, companyId: 4, companyName: "Atlan", role: "Data Engineer", date: "2026-05-05", deadline: "2026-04-28", status: "closed", package: 18, departments: ["CSE"], minCGPA: 7.0, maxBacklogs: 1, sections: ["CSE-A"] },
];

export const mockApplications = [
  { id: 1, driveId: 1, companyName: "Google", role: "SWE Intern", appliedDate: "2026-04-02", status: "applied", package: 42 },
  { id: 2, driveId: 2, companyName: "Microsoft", role: "Product Engineer", appliedDate: "2026-04-01", status: "shortlisted", package: 35 },
  { id: 3, driveId: 3, companyName: "Infosys", role: "Systems Engineer", appliedDate: "2026-03-28", status: "offered", package: 6.5 },
];

export const mockSections = [
  { id: "CSE-A", label: "CSE Section A", department: "CSE", studentCount: 62, coordinator: "Ms. Divya Rao", companies: [1, 2, 4] },
  { id: "CSE-B", label: "CSE Section B", department: "CSE", studentCount: 58, coordinator: "Ms. Divya Rao", companies: [1, 3] },
  { id: "ECE-A", label: "ECE Section A", department: "ECE", studentCount: 55, coordinator: "Mr. Kapoor", companies: [3] },
];
