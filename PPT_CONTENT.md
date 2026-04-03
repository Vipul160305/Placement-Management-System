# Internship Presentation — Slide Content
## ScholarFlow: Placement Management System

---

## SLIDE 1 — Title Slide

**Title:** ScholarFlow — Placement Management System
**Subtitle:** Full-Stack Web Application | Internship Project
**Name:** Vipul Dhoraliya
**Duration:** Feb 9, 2026 – April 3, 2026

---

## SLIDE 2 — Problem Statement

**Title:** The Problem

College placement processes are still largely manual:

- TPO officers manage hundreds of students via spreadsheets
- Students don't know if they're eligible for a drive until they're told
- Company HRs have no direct access to applicant data
- No centralized tracking of application status
- Resume collection and verification is scattered

**"ScholarFlow digitizes the entire placement lifecycle — from drive creation to final offer."**

---

## SLIDE 3 — Project Overview

**Title:** What is ScholarFlow?

A role-based placement management platform with **3 user roles:**

| Role | Responsibility |
|------|---------------|
| **TPO Officer** | Manages companies, drives, users, analytics |
| **Company HR** | Views applicants, shortlists, offers/rejects |
| **Student** | Browses drives, applies, tracks status |

**Tech Stack:**
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB Atlas
- Storage: Cloudinary (resumes)
- Auth: JWT (Access + Refresh tokens)

---

## SLIDE 4 — System Architecture

**Title:** Architecture Overview

```
[ React Frontend ]  ←→  [ Express REST API ]  ←→  [ MongoDB Atlas ]
                                  ↕
                          [ Cloudinary ]
                         (Resume Storage)
```

**Key design decisions:**
- MVC pattern on backend (controllers / models / routes)
- Role-based access control enforced on every API route
- JWT with refresh token rotation for secure sessions
- Context API for lightweight global state (no Redux needed)

---

## SLIDE 5 — Core Features: TPO Dashboard

**Title:** TPO Officer — Full Control

**Live Dashboard shows:**
- Open drives count, total students, offers given, placement rate %
- Past drives table (closed drives history)
- All stats pulled live from database

**TPO can:**
- Create / edit / delete placement drives
- Add companies + auto-create HR accounts
- Manage all users (create, edit, delete, bulk CSV import)
- View and manage all applications across all drives
- Approve or reject student profile edit requests
- Export data as CSV or Excel
- View analytics charts (placement rate, department-wise breakdown)

---

## SLIDE 6 — Core Features: Drive & Eligibility System

**Title:** Smart Drive Management + Eligibility Engine

**Drive creation fields:**
- Company, title, job role, package, scheduled date
- Min CGPA, max backlogs, allowed branches (checkbox UI)
- Status: Draft → Open → Closed

**Eligibility Engine (runs on every apply attempt):**

The system automatically checks:
1. Drive is open
2. Student's branch is in allowed list
3. CGPA ≥ minimum required
4. Backlogs ≤ maximum allowed
5. Department & section are set
6. Resume is uploaded

→ Student sees exact reasons why they're ineligible in real time

---

## SLIDE 7 — Core Features: Application Workflow

**Title:** Application State Machine

```
Student Applies → [ applied ]
                      ↓
         TPO/HR → [ shortlisted ]
                      ↓
         TPO/HR → [ offered ] ✓  or  [ rejected ] ✗
                      OR
         Student → [ withdrawn ]
```

- Terminal statuses (offered / rejected / withdrawn) cannot be changed
- Every status change triggers a **confirmation modal** (no accidental actions)
- Students receive **in-app notifications** when their status changes (polling every 30s)
- HR can only act on their own company's applications

---

## SLIDE 8 — Core Features: HR & Student Experience

**Title:** HR & Student Portals

**Company HR:**
- Auto-created when TPO adds a company
- Sees only their company's drives and applicants
- Can shortlist, offer, or reject candidates
- Can view student resumes (PDF from Cloudinary)
- Company-scoped analytics

**Student:**
- Profile page with all academic details
- Resume upload (PDF → Cloudinary, replaces old file)
- Real-time eligibility check before applying
- Application tracker with step-by-step status progress
- Can request profile edits → TPO approves/rejects
- Export own applications as CSV

---

## SLIDE 9 — Security & Technical Highlights

**Title:** Security & Key Technical Decisions

**Security:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT access tokens (15 min) + refresh tokens (7 days, hashed in DB)
- Role enforcement on every backend route — not just UI
- Data scoping at DB query level (HR can't access other companies' data)
- Cascade delete — removing a drive deletes all its applications

**Notable implementations:**
- Cloudinary integration — buffer streamed directly, no disk writes
- Profile edit approval workflow — changes only apply after TPO approves
- Audit logging — every action recorded with actor, entity, timestamp
- CSV import with per-row error reporting

---

## SLIDE 10 — Weekly Learning Journey (Feb 9 – Feb 28)

**Title:** Phase 1 — React Fundamentals (Feb 9–28)

**Week 1–2 (Feb 9–21):**
- React basics: components, props, state, event handling
- Built Expense Tracker and Investment Calculator practice projects
- Learned useEffect, useReducer, useContext — applied in Food Order App
- Fragments, Portals, useRef, conditional rendering

**Week 3 (Feb 23–28):**
- Custom hooks and form handling
- HTTP requests in React (fetch/axios patterns)
- Redux Toolkit for state management
- React Router — loaders, actions, deferred data, useFetcher
- Built token-based authentication with auto-logout and protected routes

> *These concepts directly applied in ScholarFlow: Context API for auth state, React Router for role-based navigation, custom hooks for notifications*

---

## SLIDE 11 — Weekly Learning Journey (Mar 1 – Mar 22)

**Title:** Phase 2 — Node.js & Databases (Mar 1–22)

**Mar 1–12:**
- Next.js basics — file-based routing, API routes, DB connection
- Node.js introduction — event loop, modules, npm
- Express.js — middleware, routing, template engines (EJS, Pug)
- MVC pattern — separated controllers, models, views

**Mar 13–22:**
- MySQL + Sequelize ORM — models, associations (one-to-many, many-to-many)
- MongoDB basics — schemas, models with Mongoose
- Integrated MongoDB into project — product schema, user model, cart functionality
- Sessions and cookies — implemented signup/login authentication

> *MVC pattern, Mongoose models, and Express middleware are the backbone of ScholarFlow's backend*

---

## SLIDE 12 — Weekly Learning Journey (Mar 23 – Apr 3)

**Title:** Phase 3 — Advanced Backend (Mar 23 – Apr 3)

**Mar 23–27:**
- CSRF protection, email sending, password reset via email link
- Form validation (express-validator)
- File upload & download (Multer)
- Error handling middleware
- PDF generation with PDFKit, pagination

**Mar 28 – Apr 3:**
- Stripe payment integration
- REST API fundamentals — HTTP methods, status codes, stateless design
- CRUD operations via REST
- JWT-based authentication (access + refresh tokens)
- File uploads in REST APIs

> *JWT auth, Multer for file uploads, REST API design, and error handling middleware are all directly used in ScholarFlow*

---

## SLIDE 13 — Challenges & Solutions

**Title:** Key Challenges Faced

| Challenge | Solution |
|-----------|----------|
| Resume viewing across roles | Cloudinary URL returned from API, opened directly in new tab |
| Company selection in drive form | Autocomplete with ref-based ID tracking to avoid React state timing issues |
| Role-scoped data for HR | MongoDB queries filtered at DB level using companyId |
| Student profile edits need approval | ProfileEditRequest model with pending/approved/rejected workflow |
| Preventing orphaned data on delete | Cascade delete — applications removed before drive is deleted |
| Stale JWT after role change | Users must re-login; token carries role at sign-in time |

---

## SLIDE 14 — Project Stats & Scope

**Title:** Project at a Glance

**Backend:**
- 8 route files, 8 controllers
- 6 database models
- 25+ API endpoints
- Middleware: auth, role check, file upload, error handler, async wrapper

**Frontend:**
- 15+ pages across 3 role dashboards
- Reusable components: Modal, ConfirmModal, Badge, Sidebar, DashboardLayout
- 3 React contexts: Auth, Toast, Router

**Features delivered:**
- ✅ Full authentication system (JWT + refresh)
- ✅ 3-role RBAC with scoped data
- ✅ Drive + eligibility engine
- ✅ Application state machine
- ✅ Resume upload to Cloudinary
- ✅ Profile edit approval workflow
- ✅ Analytics + CSV/Excel export
- ✅ Bulk CSV import
- ✅ In-app notifications

---

## SLIDE 15 — Conclusion & Learnings

**Title:** What I Gained from This Internship

**Technical skills built:**
- Full-stack development with TypeScript end-to-end
- Designing and securing REST APIs
- JWT authentication with refresh token rotation
- MongoDB schema design and aggregation pipelines
- Cloud storage integration (Cloudinary)
- Role-based access control patterns

**Soft skills:**
- Breaking large features into small, deliverable tasks
- Debugging across frontend and backend simultaneously
- Writing clean, maintainable code under real project constraints

**Key takeaway:**
> *"Building ScholarFlow taught me that good software isn't just about features — it's about security, data integrity, and user experience working together."*

---

*Total slides: 15 | Project focus: ~67% | Learning journey: ~33%*
