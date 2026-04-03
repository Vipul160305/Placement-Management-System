# ScholarFlow — Placement Management System
## Presentation Preparation Guide

---

## 1. PROJECT OVERVIEW

**ScholarFlow** is a full-stack web application that digitizes and automates the entire college placement process — from company registration and drive creation to student applications, shortlisting, and final offers.

**Problem it solves:**
- Manual placement processes are slow, error-prone, and hard to track
- Students don't know their eligibility in real time
- TPO officers struggle to manage multiple companies and hundreds of students
- No centralized system for HR companies to view and act on applicants

**Tech Stack:**
- **Backend:** Node.js, Express.js, TypeScript, MongoDB (Atlas), Mongoose
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6
- **Storage:** Cloudinary (resume PDFs)
- **Auth:** JWT (access + refresh tokens)
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 2. ROLES IN THE SYSTEM

There are **3 roles**:

### TPO (Training & Placement Officer)
- The most powerful role — manages everything
- Creates and manages companies, drives, users
- Views and manages all applications across all drives
- Approves or rejects student profile edit requests
- Exports application data (CSV/Excel)
- Views live analytics and past drives on dashboard
- Can import students in bulk via CSV

### HR (Company HR)
- Created automatically when TPO adds a company (with email + password)
- Linked to exactly one company
- Can only see drives and applications for their own company
- Can shortlist, offer, or reject applicants
- Can view student resumes (PDF from Cloudinary)
- Has their own dashboard showing company-specific stats

### Student
- Self-registers or is imported via CSV
- Browses open placement drives
- Sees real-time eligibility check before applying
- Applies to eligible drives
- Tracks application status (applied → shortlisted → offered/rejected)
- Can withdraw an application
- Uploads resume (PDF to Cloudinary)
- Can request profile edits (TPO must approve)
- Gets in-app notifications when application status changes

---

## 3. KEY FEATURES — DETAILED

### Authentication & Security
- JWT-based login with **access token** (15 min) + **refresh token** (7 days)
- Refresh tokens are **hashed** before storing in DB (bcrypt) — not stored in plain text
- On logout, refresh token hash is cleared from DB
- Role mismatch on login is caught and user is logged out automatically
- All protected routes check role on both frontend (ProtectedRoute) and backend (authorize middleware)

### Company Management (TPO)
- Add company with name, website, contact email/phone
- When adding a company, TPO can also set up an **HR account** (name, email, password) — HR user is auto-created and linked to that company
- Deleting a company also deletes the linked HR account
- Import companies via CSV
- Each company card shows whether an HR account is linked

### Drive Management (TPO)
- Create placement drives linked to a company
- Fields: title, job role, package, scheduled date, min CGPA, max backlogs, allowed branches (checkbox UI), description, status
- Status workflow: **draft → open → closed**
- TPO can edit any drive detail at any time
- Deleting a drive **cascades** — all applications for that drive are also deleted
- Branch selection uses checkboxes (CSE, IT, ECE, EEE, MECH, CIVIL, MBA, MCA)
- Empty branch list = all branches allowed

### Eligibility Engine (Backend)
When a student views drives or tries to apply, the system checks:
1. Drive status must be **open**
2. Student's **branch** must be in allowed branches (or list is empty)
3. Student's **CGPA** must be ≥ minCgpa
4. Student's **backlog count** must be ≤ maxBacklogs
5. Student must have **department** set
6. Student must have **section** set
7. Student must have **uploaded a resume**

If any check fails → student sees the exact reason why they're ineligible. Apply button is disabled.

### Application Workflow
```
Student applies → "applied"
     ↓
TPO/HR shortlists → "shortlisted"
     ↓
TPO/HR offers → "offered"  (terminal)
     OR
TPO/HR rejects → "rejected"  (terminal)
     OR
Student withdraws → "withdrawn"  (terminal)
```
- Terminal statuses cannot be changed
- Students can only withdraw (not shortlist/offer/reject)
- HR can shortlist, offer, reject (only for their company's drives)
- TPO can do everything across all drives

### Resume Upload (Cloudinary)
- Students upload PDF resumes from their dashboard or profile page
- Stored on **Cloudinary** under folder `placement-resumes/`
- File named `resume_<userId>.pdf` — uploading again overwrites the old one
- Old file is deleted from Cloudinary before new one is uploaded
- TPO and HR can view any student's resume (opens in new tab)
- Resume is required to apply for any drive

### Student Profile & Edit Requests
- Students have a dedicated profile page showing all academic details + resume status
- Students **cannot directly edit** their own profile
- They submit an **edit request** with proposed changes
- TPO reviews pending requests, can approve or reject with an optional note
- On approval → student's profile is updated immediately in the database
- Student sees the status of their request (pending/approved/rejected) on their profile page
- Only one pending request allowed at a time

### Notifications (Polling)
- When logged in as a student, the app polls `/api/applications/me` every **30 seconds**
- On first load, it seeds a snapshot of current statuses
- On subsequent polls, if any status changed → toast notification fires:
  - Shortlisted → blue info toast
  - Offered → green success toast
  - Rejected → red error toast
- Includes company name in the notification message

### Analytics (TPO)
- Pie chart: Placed vs Unplaced students
- Bar chart: Department-wise placement breakdown
- KPI cards: Total eligible students, offers generated, placement rate %
- All data is live from the database

### Export
- TPO/HR can export applications as **CSV or Excel**
- Two export types: all applications, or placed students only
- Role-scoped: HR only exports their company's data

### CSV Import
- TPO can bulk import students from CSV
- Required columns: name, email, password, department, section, branch, cgpa, backlog_count
- TPO can bulk import companies from CSV
- Errors are reported per row (up to 100 shown)

### Confirmation Modals
Every destructive action has a confirmation modal:
- Delete drive (warns about cascade-deleting applications)
- Delete company (warns about removing HR account)
- Delete user
- Offer a student (terminal — cannot be undone)
- Reject a student (terminal — cannot be undone)
- Withdraw application (student — cannot re-apply)

---

## 4. DATABASE MODELS

### User
```
name, email, password (hashed), role (tpo/hr/student),
department, section, branch, cgpa, backlogCount,
resumeUrl, resumePublicId, companyId (for HR),
refreshTokenHash, createdAt, updatedAt
```

### Company
```
name, website, contactEmail, contactPhone,
createdBy (ref: User), createdAt, updatedAt
```

### Drive
```
company (ref), createdBy (ref), title, description,
scheduledAt, minCgpa, maxBacklogs, allowedBranches[],
jobRole, package, status (draft/open/closed),
sectionAssignments[], createdAt, updatedAt
```

### Application
```
student (ref: User), drive (ref: Drive),
status (applied/shortlisted/offered/rejected/withdrawn),
createdAt, updatedAt
Unique index: (student, drive) — one application per student per drive
```

### ProfileEditRequest
```
student (ref: User), changes (name/dept/section/branch/cgpa/backlogCount),
status (pending/approved/rejected),
reviewedBy (ref: User), reviewNote,
createdAt, updatedAt
```

### AuditLog
```
actor (ref: User), action (string), entityType, entityId,
metadata (mixed), createdAt
```

---

## 5. API ROUTES SUMMARY

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Login, returns JWT tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Clears refresh token |

### Users
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/users/me | All roles |
| GET | /api/users | TPO only |
| POST | /api/users | TPO only |
| PATCH | /api/users/:id | TPO only |
| DELETE | /api/users/:id | TPO only |
| POST | /api/users/me/resume | Student only |
| GET | /api/users/me/resume | Student only |
| GET | /api/users/:id/resume | TPO, HR |

### Companies
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/companies | All authenticated |
| POST | /api/companies | TPO |
| PATCH | /api/companies/:id | TPO |
| DELETE | /api/companies/:id | TPO |

### Drives
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/drives | Role-scoped |
| POST | /api/drives | TPO |
| GET | /api/drives/:id | Role-scoped |
| PATCH | /api/drives/:id | TPO |
| DELETE | /api/drives/:id | TPO (cascade) |
| POST | /api/drives/:id/apply | Student |

### Applications
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/applications/me | Student |
| GET | /api/applications | TPO, HR, Student |
| PATCH | /api/applications/:id/status | Role-scoped |

### Profile Edit Requests
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/profile/edit-requests | Student |
| GET | /api/profile/edit-requests/me | Student |
| GET | /api/profile/edit-requests | TPO |
| PATCH | /api/profile/edit-requests/:id/review | TPO |

### Stats & Exports
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/stats/dashboard | TPO |
| GET | /api/stats/overview | TPO, HR |
| GET | /api/stats/by-department | TPO, HR |
| GET | /api/exports/applications | TPO, HR |
| GET | /api/exports/placed-students | TPO, HR |

---

## 6. FRONTEND PAGES & ROUTES

### TPO Routes
| Route | Page |
|-------|------|
| /tpo | Dashboard (live stats + past drives) |
| /tpo/create | Placement Drives (create/edit/delete) |
| /tpo/companies | Companies (with HR account management) |
| /tpo/applications | All applications (shortlist/offer/reject) |
| /tpo/profile-requests | Student profile edit requests |
| /tpo/stats | Analytics (charts) |
| /tpo/users | User management (create/edit/delete/import) |

### HR Routes
| Route | Page |
|-------|------|
| /hr | HR Dashboard (company stats) |
| /hr/applications | Company applications |

### Student Routes
| Route | Page |
|-------|------|
| /student | Dashboard (stats + resume upload) |
| /student/profile | Full profile + edit request |
| /student/drives | Browse drives + apply |
| /student/apps | My applications + withdraw |

---

## 7. SECURITY HIGHLIGHTS

1. **Passwords** — hashed with bcrypt (10 salt rounds), never returned in API responses
2. **Refresh tokens** — hashed before storage, rotated on every use
3. **Role enforcement** — checked on every backend route via `authorize()` middleware, not just frontend
4. **Data scoping** — HR can only see their company's data at the database query level
5. **Resume access** — only the student who owns it, or TPO/HR staff, can access a resume
6. **CORS** — configured to only allow the frontend origin
7. **Input validation** — express-validator on auth routes, manual validation elsewhere
8. **Cascade deletes** — drive deletion removes all related applications to prevent orphaned data

---

## 8. LIKELY INTERVIEW QUESTIONS & ANSWERS

**Q: Why did you use JWT instead of sessions?**
A: JWT is stateless — the server doesn't need to store session data. It scales better. We use short-lived access tokens (15 min) with longer refresh tokens (7 days) for security. Refresh tokens are hashed in the DB so even if the DB is compromised, tokens can't be reused.

**Q: How does the eligibility check work?**
A: The `evaluateEligibility()` function runs on the backend before any application is accepted. It checks CGPA, backlogs, branch, department, section, and resume upload. The same function also runs when listing drives for students, so they see their eligibility status in real time before even trying to apply.

**Q: What happens when a drive is deleted?**
A: A cascade delete runs — all Application documents where `drive = driveId` are deleted first, then AuditLog entries for that drive, then the drive itself. This prevents orphaned application records.

**Q: How is the HR account linked to a company?**
A: The User model has a `companyId` field (ObjectId ref to Company). When TPO creates a company with HR credentials, a User with `role: "hr"` is created and `companyId` is set to that company's ID. All backend queries for HR are scoped using this field.

**Q: How does the profile edit approval work?**
A: Student submits a `ProfileEditRequest` document with proposed changes. TPO reviews it and calls the review endpoint with `action: "approve"` or `"reject"`. On approval, the backend immediately applies the changes to the User document using `findByIdAndUpdate`. The student's frontend then calls `refreshUser()` to reload their data.

**Q: Where are resumes stored?**
A: On Cloudinary under the folder `placement-resumes/`. Each resume is named `resume_<userId>.pdf`. When a student re-uploads, the old file is deleted from Cloudinary first using the stored `resumePublicId`, then the new one is uploaded. The `resumeUrl` (Cloudinary secure URL) is stored in the User document.

**Q: How do notifications work?**
A: The frontend polls `/api/applications/me` every 30 seconds for logged-in students. On first load it seeds a Map of `applicationId → status`. On each subsequent poll it compares the new statuses against the snapshot. If any changed, it fires a toast notification with the company name and new status.

**Q: What is the application state machine?**
A: Applications follow strict transitions:
- `applied` → shortlisted, rejected, or withdrawn
- `shortlisted` → offered or rejected
- `offered`, `rejected`, `withdrawn` are terminal — no further changes allowed
The backend enforces this in `canTransition()` before any status update.

**Q: How does role-based data scoping work for HR?**
A: In `applicationScope.ts`, when the requesting user is HR, the code fetches all Drive IDs where `company = req.user.companyId`, then filters applications to only those drives. This happens at the MongoDB query level — HR literally cannot receive data outside their company.

**Q: Why Cloudinary for resumes instead of local storage?**
A: Local storage is lost on server restart/redeploy and doesn't scale. Cloudinary is a CDN — files persist permanently, are globally accessible, and the free tier is sufficient for this use case.

---

## 9. WORKFLOW WALKTHROUGH (End-to-End)

1. **TPO logs in** → sees live dashboard with open drives, student count, placement rate
2. **TPO adds a company** (e.g. TCS) → sets HR email/password → HR account auto-created
3. **TPO creates a drive** for TCS → sets CGPA ≥ 7, max 0 backlogs, branches: CSE/IT, status: open
4. **Student logs in** → goes to Drives page → sees TCS drive with eligibility check
   - If CGPA < 7 → sees "CGPA below minimum" reason, Apply button disabled
   - If eligible → clicks Apply → application created with status "applied"
5. **HR logs in** → sees TCS applications → shortlists eligible students
6. **Student gets notification** → "You've been shortlisted at TCS"
7. **HR offers** selected students → status → "offered"
8. **TPO views analytics** → placement rate updates in real time
9. **TPO exports** placed students list as Excel for records

---

## 10. TECH DECISIONS WORTH MENTIONING

| Decision | Reason |
|----------|--------|
| MongoDB over SQL | Flexible schema for evolving requirements, easy to add fields |
| React Context over Redux | Lightweight — only 2 global states (auth + toast), no need for Redux complexity |
| Tailwind CSS | Rapid UI development, consistent design system, no CSS files to maintain |
| Vite over CRA | Much faster dev server and build times |
| TypeScript everywhere | Catches bugs at compile time, better IDE support, self-documenting code |
| Multer memory storage | No disk writes — buffer goes straight to Cloudinary stream |
| Polling over WebSockets | Simpler to implement, sufficient for notification frequency needed |

---

**Good luck with your presentation!**
