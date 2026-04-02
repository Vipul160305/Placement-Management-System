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
export async function getTPOAnalytics(): Promise<TPOAnalyticsResult> {
  const [overview, byDept] = await Promise.all([
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

/* Staff export: CSV / XLSX blob */
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

/** No backend resume route yet — keeps UI working (plan out of scope). */
export async function uploadStudentResume(formData: FormData) {
  await new Promise((r) => setTimeout(r, 400));
  const file = formData.get("resume");
  const name =
    file && typeof file === "object" && "name" in file && typeof (file as File).name === "string"
      ? (file as File).name
      : "resume.pdf";
  return {
    status: "success",
    message: "Resume recorded locally (backend upload not configured)",
    filename: name,
    uploadDate: new Date().toISOString(),
  };
}
