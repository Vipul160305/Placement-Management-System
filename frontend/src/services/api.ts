import type { AxiosResponse } from "axios";
import { httpClient } from "./httpClient";
import { toApiError } from "../types/api";

export function unwrap<T = unknown>(response: AxiosResponse<unknown>): T {
  const body = response.data as Record<string, unknown> | null | undefined;
  if (body?.success === true) return body.data as T;
  if (body?.success === false) {
    const errBody = body.error as { message?: string; code?: string; details?: unknown } | undefined;
    const msg = errBody?.message || "Request failed";
    throw toApiError(msg, errBody?.code, errBody?.details);
  }
  return body as T;
}

async function apiGet<T = unknown>(url: string, config?: object) {
  return unwrap<T>(await httpClient.get(url, config));
}

async function apiPost<T = unknown>(url: string, data?: unknown, config?: object) {
  return unwrap<T>(await httpClient.post(url, data, config));
}

async function apiPatch<T = unknown>(url: string, data?: unknown, config?: object) {
  return unwrap<T>(await httpClient.patch(url, data, config));
}

async function apiPut<T = unknown>(url: string, data?: unknown, config?: object) {
  return unwrap<T>(await httpClient.put(url, data, config));
}

async function apiDelete<T = unknown>(url: string, config?: object) {
  return unwrap<T>(await httpClient.delete(url, config));
}

/* Users (admin) */
export async function listUsers(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return apiGet(q ? `/api/users?${q}` : "/api/users");
}
export async function createUser(body: object) {
  return apiPost("/api/users", body);
}

export async function updateUser(id: string, body: object) {
  return apiPatch(`/api/users/${id}`, body);
}

export async function deleteUser(id: string) {
  return apiDelete(`/api/users/${id}`);
}

export async function importStudentsCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiPost("/api/imports/students", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function importCompaniesCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiPost("/api/imports/companies", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/* Companies */
export async function listCompanies() {
  return apiGet("/api/companies");
}

export async function createCompany(body: object) {
  return apiPost("/api/companies", body);
}

export async function updateCompany(id: string, body: object) {
  return apiPatch(`/api/companies/${id}`, body);
}

export async function deleteCompany(id: string) {
  return apiDelete(`/api/companies/${id}`);
}

/* Drives */
export async function listDrives(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return apiGet(q ? `/api/drives?${q}` : "/api/drives");
}

export async function createDrive(body: object) {
  return apiPost("/api/drives", body);
}

export async function updateDrive(id: string, body: object) {
  return apiPatch(`/api/drives/${id}`, body);
}

export async function deleteDrive(id: string) {
  return apiDelete(`/api/drives/${id}`);
}

export async function putDriveAssignments(id: string, sectionAssignments: object[]) {
  return apiPut(`/api/drives/${id}/assignments`, { sectionAssignments });
}

export async function applyToDrive(driveId: string) {
  return apiPost(`/api/drives/${driveId}/apply`);
}

/* Applications */
export async function listMyApplications() {
  return apiGet("/api/applications/me");
}

export async function listApplications(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return apiGet(q ? `/api/applications?${q}` : "/api/applications");
}

export async function updateApplicationStatus(id: string, status: string) {
  return apiPatch(`/api/applications/${id}/status`, { status });
}

export interface DepartmentStatRow {
  department: string;
  totalApplications?: number;
  offered?: number;
}

export interface StatsOverview {
  offeredCount?: number;
  totalStudentsInScope?: number;
  [key: string]: unknown;
}

export interface TPOAnalyticsResult {
  placementStatus: { name: string; value: number; color: string }[];
  departmentStats: { dept: string; placed: number; total: number }[];
  overview: StatsOverview;
}

/* Analytics */
export interface DashboardStats {
  totalStudents: number;
  totalTPO: number;
  totalHR: number;
  openDrives: number;
  totalDrives: number;
  offeredCount: number;
  totalApplications: number;
  placementRate: number;
  pastDrives: {
    id: string;
    title?: string;
    company?: { name?: string };
    jobRole?: string;
    package?: string;
    scheduledAt?: string;
    updatedAt?: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiGet<DashboardStats>("/api/stats/dashboard");
}

export async function getTPOAnalytics(): Promise<TPOAnalyticsResult> {  const [overview, byDept] = await Promise.all([
    apiGet<StatsOverview>("/api/stats/overview"),
    apiGet<{ departments?: DepartmentStatRow[] }>("/api/stats/by-department"),
  ]);

  const placed = overview.offeredCount ?? 0;
  const totalStudents = overview.totalStudentsInScope ?? 0;
  const unplaced = Math.max(0, totalStudents - placed);

  const departments = byDept.departments ?? [];
  const departmentStats = departments.map((d) => ({
    dept: d.department,
    placed: d.offered ?? 0,
    total: Math.max(d.totalApplications ?? 0, d.offered ?? 0),
  }));

  return {
    placementStatus: [
      { name: "Placed", value: placed, color: "#10b981" },
      { name: "Unplaced", value: unplaced, color: "#f43f5e" },
    ],
    departmentStats,
    overview,
  };
}

/* Profile edit requests */
export async function submitProfileEditRequest(changes: object) {
  return apiPost("/api/profile/edit-requests", changes);
}

export async function getMyProfileEditRequest() {
  return apiGet("/api/profile/edit-requests/me");
}

export async function listProfileEditRequests(status = "pending") {
  return apiGet(`/api/profile/edit-requests?status=${status}`);
}

export async function reviewProfileEditRequest(id: string, action: "approve" | "reject", reviewNote?: string) {
  return apiPatch(`/api/profile/edit-requests/${id}/review`, { action, reviewNote });
}
export async function downloadApplicationsExport(format = "csv") {
  const res = await httpClient.get(`/api/exports/applications?format=${format}`, {
    responseType: "blob",
  });
  const ct = (res.headers["content-type"] as string) || "";
  if (ct.includes("application/json")) {
    const text = await (res.data as Blob).text();
    const j = JSON.parse(text) as { success?: boolean; error?: { message?: string } };
    if (!j.success) {
      const msg = j.error?.message || "Export failed";
      throw new Error(msg);
    }
  }
  return res.data as Blob;
}

/** Upload student resume (PDF) */
export async function uploadStudentResume(formData: FormData) {
  return apiPost("/api/users/me/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** Get resume URL for current student — returns the Cloudinary URL */
export async function getResumeUrl(): Promise<string> {
  const res = (await apiGet<{ resumeUrl: string }>("/api/users/me/resume"));
  return res.resumeUrl;
}

/** Staff: get a student's resume URL */
export async function getStudentResumeUrl(studentId: string): Promise<string> {
  const res = (await apiGet<{ resumeUrl: string }>(`/api/users/${studentId}/resume`));
  return res.resumeUrl;
}
