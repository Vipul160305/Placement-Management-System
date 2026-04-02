import { httpClient } from './httpClient';

export function unwrap(response) {
  const body = response.data;
  if (body?.success === true) return body.data;
  if (body?.success === false) {
    const msg = body.error?.message || 'Request failed';
    const err = new Error(msg);
    err.code = body.error?.code;
    err.details = body.error?.details;
    throw err;
  }
  return body;
}

async function apiGet(url, config) {
  return unwrap(await httpClient.get(url, config));
}

async function apiPost(url, data, config) {
  return unwrap(await httpClient.post(url, data, config));
}

async function apiPatch(url, data, config) {
  return unwrap(await httpClient.patch(url, data, config));
}

async function apiPut(url, data, config) {
  return unwrap(await httpClient.put(url, data, config));
}

async function apiDelete(url, config) {
  return unwrap(await httpClient.delete(url, config));
}

/* Users (admin) */
export async function listUsers(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiGet(q ? `/api/users?${q}` : '/api/users');
}

export async function createUser(body) {
  return apiPost('/api/users', body);
}

export async function updateUser(id, body) {
  return apiPatch(`/api/users/${id}`, body);
}

export async function deleteUser(id) {
  return apiDelete(`/api/users/${id}`);
}

export async function importStudentsCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiPost('/api/imports/students', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function importCompaniesCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiPost('/api/imports/companies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/* Companies */
export async function listCompanies() {
  return apiGet('/api/companies');
}

export async function createCompany(body) {
  return apiPost('/api/companies', body);
}

export async function updateCompany(id, body) {
  return apiPatch(`/api/companies/${id}`, body);
}

export async function deleteCompany(id) {
  return apiDelete(`/api/companies/${id}`);
}

/* Drives */
export async function listDrives(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiGet(q ? `/api/drives?${q}` : '/api/drives');
}

export async function createDrive(body) {
  return apiPost('/api/drives', body);
}

export async function updateDrive(id, body) {
  return apiPatch(`/api/drives/${id}`, body);
}

export async function deleteDrive(id) {
  return apiDelete(`/api/drives/${id}`);
}

export async function putDriveAssignments(id, sectionAssignments) {
  return apiPut(`/api/drives/${id}/assignments`, { sectionAssignments });
}

export async function applyToDrive(driveId) {
  return apiPost(`/api/drives/${driveId}/apply`);
}

/* Applications */
export async function listMyApplications() {
  return apiGet('/api/applications/me');
}

export async function listApplications(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiGet(q ? `/api/applications?${q}` : '/api/applications');
}

/* Analytics */
export async function getTPOAnalytics() {
  const [overview, byDept] = await Promise.all([
    apiGet('/api/stats/overview'),
    apiGet('/api/stats/by-department'),
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
      { name: 'Placed', value: placed, color: '#10b981' },
      { name: 'Unplaced', value: unplaced, color: '#f43f5e' },
    ],
    departmentStats,
    overview,
  };
}

/* Staff export: CSV / XLSX blob */
export async function downloadApplicationsExport(format = 'csv') {
  const res = await httpClient.get(`/api/exports/applications?format=${format}`, {
    responseType: 'blob',
  });
  const ct = res.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    const text = await res.data.text();
    const j = JSON.parse(text);
    if (!j.success) {
      const msg = j.error?.message || 'Export failed';
      throw new Error(msg);
    }
  }
  return res.data;
}

/** No backend resume route yet — keeps UI working (plan out of scope). */
export async function uploadStudentResume(formData) {
  await new Promise((r) => setTimeout(r, 400));
  return {
    status: 'success',
    message: 'Resume recorded locally (backend upload not configured)',
    filename: formData.get('resume')?.name || 'resume.pdf',
    uploadDate: new Date().toISOString(),
  };
}
