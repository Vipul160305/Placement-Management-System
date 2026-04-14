# GTU Semester 8 Internship Project Report
## Computer Engineering Branch

---

# TITLE PAGE

**Project Title:** ScholarFlow — Web-Based Placement Workflow Management System

**Technology Used:** MERN Stack (MongoDB, Express.js, React.js, Node.js)

**Submitted in partial fulfillment of the requirements for**
**Bachelor of Engineering in Computer Engineering**

**Gujarat Technological University**

---

# TABLE OF CONTENTS

1. Introduction
2. Problem Statement
3. Objectives
4. System Requirements
5. System Architecture
6. Database Design
7. Module Description
8. Technology Stack
9. Implementation Details
10. Testing
11. Results and Screenshots Description
12. Future Enhancements
13. Conclusion
14. References

---

# 1. INTRODUCTION

## 1.1 Overview

Campus placement is one of the most critical activities in any engineering institution. Traditionally, the process involves extensive manual coordination between the Training & Placement Office (TPO), students, companies, and department coordinators. This leads to inefficiencies such as miscommunication, data duplication, delayed updates, and lack of transparency.

**ScholarFlow** is a web-based Placement Workflow Management System developed to digitize and streamline the entire campus placement lifecycle. Built on the MERN stack (MongoDB, Express.js, React.js, Node.js), it provides a centralized, role-based platform that replaces spreadsheets and email chains with a structured, real-time system.

## 1.2 Scope

The system covers:
- User management with role-based access control
- Company and placement drive management
- Student profile and resume management
- Application tracking with eligibility filtering
- Analytics and reporting
- Email notifications
- Bulk data import/export via CSV

## 1.3 Purpose of the Report

This report documents the design, development, and implementation of the ScholarFlow Placement Management System as part of the GTU Semester 8 internship project for the Computer Engineering branch.

---

# 2. PROBLEM STATEMENT

Educational institutions face significant challenges in managing campus placements manually:

- **Data Fragmentation:** Student records, company details, and application statuses are maintained in separate spreadsheets with no single source of truth.
- **Lack of Real-Time Updates:** Students are unaware of their application status until manually notified.
- **Eligibility Errors:** Manual filtering of eligible students based on CGPA, backlogs, and branch is error-prone.
- **No Audit Trail:** There is no systematic record of who performed what action and when.
- **Scalability Issues:** As the number of students and companies grows, manual processes become unmanageable.
- **Communication Gaps:** Coordination between TPO, coordinators, HR representatives, and students is fragmented.

The proposed system addresses all these challenges through a unified digital platform.

---

# 3. OBJECTIVES

The primary objectives of this project are:

1. To develop a secure, role-based web application for managing campus placements.
2. To automate eligibility checking for students applying to placement drives.
3. To provide real-time application status tracking for students.
4. To enable TPOs to manage companies, drives, and users from a single dashboard.
5. To support HR representatives with a dedicated portal to view and manage applications for their company's drives.
6. To implement audit logging for all critical system actions.
7. To provide data import (CSV) and export capabilities for bulk operations.
8. To send automated email notifications for key events (application status changes, profile edit requests).
9. To generate analytics and statistics for placement performance monitoring.

---

# 4. SYSTEM REQUIREMENTS

## 4.1 Hardware Requirements

| Component | Minimum Requirement |
|-----------|-------------------|
| Processor | Intel Core i3 or equivalent |
| RAM | 4 GB |
| Storage | 20 GB free disk space |
| Network | Broadband Internet connection |

## 4.2 Software Requirements

### Development Environment
| Software | Version |
|----------|---------|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | v6+ |
| TypeScript | v5.x |
| Git | v2.x |

### Frontend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router DOM | 6.18.0 | Client-side routing |
| Axios | 1.6.0 | HTTP client |
| Tailwind CSS | 3.3.5 | Utility-first CSS framework |
| Recharts | 3.8.1 | Data visualization charts |
| Lucide React | 0.284.0 | Icon library |
| Vite | 4.4.5 | Build tool and dev server |

### Backend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| Express.js | 4.21.0 | Web framework |
| Mongoose | 8.7.0 | MongoDB ODM |
| JSON Web Token | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing |
| Nodemailer | 8.0.5 | Email service |
| Multer | 2.0.1 | File upload handling |
| Cloudinary | 2.9.0 | Cloud file storage |
| csv-parse | 5.6.0 | CSV file parsing |
| csv-stringify | 6.5.2 | CSV file generation |
| ExcelJS | 4.4.0 | Excel file export |
| express-rate-limit | 8.3.2 | API rate limiting |
| express-validator | 7.2.0 | Input validation |

---

# 5. SYSTEM ARCHITECTURE

## 5.1 Three-Tier Architecture

The system follows a classic three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (Frontend)           │
│         React.js + Tailwind CSS + Vite               │
│   Role-based Dashboards | Forms | Charts | Tables    │
└─────────────────────┬───────────────────────────────┘
                      │ REST API (HTTP/JSON)
                      │ JWT Bearer Token
┌─────────────────────▼───────────────────────────────┐
│              APPLICATION LAYER (Backend)             │
│         Node.js + Express.js + TypeScript            │
│   Auth | RBAC | Business Logic | File Handling       │
└─────────────────────┬───────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼───────────────────────────────┐
│                DATA LAYER (Database)                 │
│                    MongoDB                           │
│   Users | Companies | Drives | Applications | Logs  │
└─────────────────────────────────────────────────────┘
```

## 5.2 Application Architecture

### Backend Structure
```
backend/src/
├── app.ts              # Express app factory, middleware setup
├── server.ts           # HTTP server entry point
├── config/
│   ├── db.ts           # MongoDB connection
│   ├── env.ts          # Environment variable validation
│   └── cloudinary.ts   # Cloudinary configuration
├── controllers/        # Route handler functions
├── middleware/         # Auth, error handling, file upload
├── models/             # Mongoose schemas and models
├── routes/             # Express route definitions
├── services/           # Business logic layer
├── utils/              # Utility functions (JWT, password, errors)
└── validators/         # Input validation schemas
```

### Frontend Structure
```
frontend/src/
├── App.tsx             # Root component, routing
├── context/            # React Context (Auth, Toast)
├── pages/
│   ├── dashboards/     # Role-specific dashboards
│   ├── tpo/            # TPO management pages
│   ├── student/        # Student-facing pages
│   └── hr/             # HR portal pages
├── components/
│   ├── Layout/         # Dashboard layout, sidebar
│   └── ui/             # Reusable UI components
├── services/           # API call functions
└── types/              # TypeScript type definitions
```

## 5.3 Authentication Flow

```
Client                    Server
  │                          │
  │── POST /api/auth/login ──►│
  │                          │ Verify credentials
  │                          │ Generate Access Token (15m)
  │                          │ Generate Refresh Token (7d)
  │◄── { accessToken,        │
  │      refreshToken } ─────│
  │                          │
  │── API Request            │
  │   Authorization:         │
  │   Bearer <accessToken> ──►│
  │                          │ Verify JWT
  │                          │ Attach user to req
  │◄── Protected Response ───│
  │                          │
  │── POST /api/auth/refresh ►│ (when access token expires)
  │◄── { new accessToken } ──│
```

---

# 6. DATABASE DESIGN

## 6.1 Entity Relationship Overview

The system uses MongoDB (NoSQL) with Mongoose ODM. The following collections are used:

## 6.2 Collections

### Users Collection
```
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (hashed, select: false),
  role: Enum ["tpo", "hr", "student"],
  department: String,
  section: String,
  branch: String,
  cgpa: Number (0–10),
  backlogCount: Number (default: 0),
  resumeUrl: String (Cloudinary URL),
  resumePublicId: String (Cloudinary ID),
  companyId: ObjectId → Company (for HR role),
  refreshTokenHash: String (select: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Companies Collection
```
{
  _id: ObjectId,
  name: String (required),
  website: String,
  contactEmail: String,
  contactPhone: String,
  createdBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

### Drives Collection
```
{
  _id: ObjectId,
  company: ObjectId → Company (required),
  createdBy: ObjectId → User (required),
  title: String (required),
  description: String,
  scheduledAt: Date,
  minCgpa: Number (0–10, default: 0),
  maxBacklogs: Number (default: 0),
  allowedBranches: [String],
  jobRole: String,
  package: String,
  status: Enum ["draft", "open", "closed"],
  sectionAssignments: [{
    department: String,
    sections: [String]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```
{
  _id: ObjectId,
  student: ObjectId → User (required),
  drive: ObjectId → Drive (required),
  status: Enum ["applied", "shortlisted", "offered", "rejected", "withdrawn"],
  createdAt: Date,
  updatedAt: Date
}
Indexes: { student, drive } (unique), { drive }
```

### AuditLogs Collection
```
{
  _id: ObjectId,
  actor: ObjectId → User (required),
  action: String (required),
  entityType: String (required),
  entityId: String,
  metadata: Mixed,
  createdAt: Date
}
Indexes: { createdAt: -1 }, { entityType, entityId }
```

### ProfileEditRequests Collection
```
{
  _id: ObjectId,
  student: ObjectId → User,
  requestedChanges: Mixed,
  status: Enum ["pending", "approved", "rejected"],
  reviewNote: String,
  reviewedBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

---

# 7. MODULE DESCRIPTION

## 7.1 Authentication Module

**Files:** `auth.controller.ts`, `auth.routes.ts`, `jwt.ts`, `password.ts`

Handles user registration, login, token refresh, and logout.

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/register | POST | Student self-registration |
| /api/auth/login | POST | Login for all roles |
| /api/auth/refresh | POST | Refresh access token |
| /api/auth/logout | POST | Invalidate refresh token |
| /api/auth/forgot-password | POST | Send password reset email |
| /api/auth/reset-password | POST | Reset password via token |

**Security Features:**
- Passwords hashed using bcryptjs (salt rounds: 12)
- Access tokens expire in 15 minutes (JWT)
- Refresh tokens expire in 7 days, stored as bcrypt hash
- Token rotation on every refresh

## 7.2 User Management Module

**Files:** `user.controller.ts`, `user.routes.ts`

Allows TPO to create, update, and manage users (students, HR accounts).

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/users | GET | TPO | List all users with filters |
| /api/users/me | GET | All | Get current user profile |
| /api/users | POST | TPO | Create new user |
| /api/users/:id | PUT | TPO | Update user |
| /api/users/:id | DELETE | TPO | Delete user |

## 7.3 Company Management Module

**Files:** `company.controller.ts`, `company.routes.ts`

Manages company records that are linked to placement drives.

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/companies | GET | TPO, HR | List companies |
| /api/companies | POST | TPO | Create company |
| /api/companies/:id | PUT | TPO | Update company |
| /api/companies/:id | DELETE | TPO | Delete company |

## 7.4 Placement Drive Module

**Files:** `drive.controller.ts`, `drive.routes.ts`

Core module for creating and managing placement drives.

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/drives | GET | All | List drives (filtered by role) |
| /api/drives | POST | TPO | Create new drive |
| /api/drives/:id | GET | All | Get drive details |
| /api/drives/:id | PUT | TPO | Update drive |
| /api/drives/:id | DELETE | TPO | Delete drive |
| /api/drives/:id/sections | PUT | TPO, HR | Assign sections to drive |

**Drive Lifecycle:**
```
draft → open → closed
         ↑        │
         └────────┘ (reopen)
```

## 7.5 Application Module

**Files:** `application.controller.ts`, `applicationRoutes.ts`

Manages student applications to placement drives with eligibility enforcement.

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/applications | GET | TPO, HR | List applications |
| /api/applications | POST | Student | Apply to a drive |
| /api/applications/:id | PUT | TPO, HR | Update application status |
| /api/applications/:id/withdraw | PUT | Student | Withdraw application |

**Eligibility Checks (enforced server-side):**
- Drive must be in "open" status
- Student's branch must be in `allowedBranches` (if specified)
- Student's CGPA must be ≥ `minCgpa`
- Student's backlog count must be ≤ `maxBacklogs`
- Student must have uploaded a resume
- Student must have department and section set

## 7.6 Profile Management Module

**Files:** `profile.controller.ts`, `profile.routes.ts`

Students can request profile changes (CGPA, backlogs, etc.) which require TPO approval.

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/profile/edit-request | POST | Student | Submit edit request |
| /api/profile/edit-requests | GET | TPO | List pending requests |
| /api/profile/edit-requests/:id | PUT | TPO | Approve/reject request |
| /api/profile/resume | POST | Student | Upload resume to Cloudinary |

## 7.7 Import/Export Module

**Files:** `import.controller.ts`, `export.controller.ts`

Supports bulk data operations.

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/imports/students | POST | TPO | Bulk import students via CSV |
| /api/exports/students | GET | TPO | Export students to CSV/Excel |
| /api/exports/applications | GET | TPO | Export applications to CSV/Excel |

## 7.8 Statistics Module

**Files:** `stats.controller.ts`, `statsService.ts`

Provides analytics data for dashboards.

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| /api/stats/overview | GET | TPO | Overall placement stats |
| /api/stats/dashboard | GET | TPO | Dashboard summary stats |
| /api/stats/by-department | GET | TPO | Department-wise breakdown |

**Metrics Provided:**
- Total students, TPOs, HR accounts
- Open/total drives count
- Total applications and offered count
- Placement rate (offered / total students × 100)
- Department-wise placement statistics
- Recent past drives

---

# 8. TECHNOLOGY STACK

## 8.1 Frontend

### React.js (v18)
React is a JavaScript library for building user interfaces using a component-based architecture. The application uses React 18 with functional components and hooks throughout.

### TypeScript
TypeScript adds static type checking to JavaScript, improving code quality and developer experience. All frontend and backend code is written in TypeScript.

### Tailwind CSS
A utility-first CSS framework that enables rapid UI development with pre-defined classes. Used for all styling in the application.

### React Router DOM (v6)
Handles client-side routing with protected routes based on user roles. Uses the `<Routes>` and `<Route>` API with nested layouts.

### Vite
A modern build tool that provides fast development server with Hot Module Replacement (HMR) and optimized production builds.

### Recharts
A composable charting library built on React and D3. Used for analytics visualizations in the TPO dashboard.

## 8.2 Backend

### Node.js
A JavaScript runtime built on Chrome's V8 engine. Enables server-side JavaScript execution with non-blocking I/O.

### Express.js (v4)
A minimal and flexible Node.js web application framework. Used to build the RESTful API with middleware support.

### TypeScript (v5)
Provides type safety across the entire backend codebase with interfaces for all models and request/response types.

### Mongoose (v8)
An Object Data Modeling (ODM) library for MongoDB. Provides schema validation, middleware hooks, and query building.

## 8.3 Database

### MongoDB
A NoSQL document database that stores data in flexible, JSON-like BSON documents. Chosen for its schema flexibility and horizontal scalability.

## 8.4 Cloud Services

### Cloudinary
A cloud-based media management platform used for storing and serving student resume files (PDF). Provides secure URLs and public ID management for file deletion.

## 8.5 Security Libraries

| Library | Purpose |
|---------|---------|
| jsonwebtoken | JWT creation and verification |
| bcryptjs | Password and token hashing |
| express-rate-limit | Prevent brute-force attacks |
| express-validator | Input sanitization and validation |
| cors | Cross-Origin Resource Sharing control |

---

# 9. IMPLEMENTATION DETAILS

## 9.1 Role-Based Access Control (RBAC)

The system implements three user roles with distinct permissions:

| Feature | TPO | HR | Student |
|---------|-----|----|---------|
| Create/manage users | ✓ | ✗ | ✗ |
| Create/manage companies | ✓ | ✗ | ✗ |
| Create/manage drives | ✓ | ✗ | ✗ |
| Assign sections to drives | ✓ | ✓ | ✗ |
| View all applications | ✓ | ✓* | ✗ |
| Update application status | ✓ | ✓* | ✗ |
| Apply to drives | ✗ | ✗ | ✓ |
| Withdraw application | ✗ | ✗ | ✓ |
| Upload resume | ✗ | ✗ | ✓ |
| Request profile edit | ✗ | ✗ | ✓ |
| Approve profile edits | ✓ | ✗ | ✗ |
| View analytics | ✓ | ✗ | ✗ |
| Import/export data | ✓ | ✗ | ✗ |

*HR can only see applications for their company's drives

## 9.2 Eligibility Service

The eligibility service (`eligibilityService.ts`) performs server-side validation before allowing a student to apply:

```typescript
// Checks performed:
1. Drive status === "open"
2. Student has department set
3. Student has section set
4. Student has uploaded a resume
5. Student's branch is in drive's allowedBranches (if list is non-empty)
6. Student's CGPA >= drive.minCgpa
7. Student's backlogCount <= drive.maxBacklogs
```

Each failed check returns a human-readable reason, which is sent back to the student.

## 9.3 JWT Authentication Implementation

```
Access Token:  { sub: userId, email, role } — expires 15 minutes
Refresh Token: { sub: userId } — expires 7 days

Refresh token is stored as a bcrypt hash in the database.
On logout, the hash is set to null (token revocation).
On refresh, a new token pair is issued (token rotation).
```

## 9.4 Audit Logging

Every significant action is recorded in the AuditLog collection:

| Action | Trigger |
|--------|---------|
| auth.register | New user registration |
| auth.login | Successful login |
| auth.logout | User logout |
| drive.create | New drive created |
| drive.update | Drive modified |
| application.create | Student applies |
| application.statusChange | Status updated |
| profile.editRequest | Student submits edit request |
| profile.reviewed | TPO approves/rejects request |

## 9.5 Email Notification System

Built using Nodemailer with SMTP configuration. Emails are sent for:

1. **Password Reset** — OTP/link sent to user's email
2. **Application Status Change** — Notifies student when shortlisted, offered, or rejected
3. **Profile Edit Request** — Notifies TPO when a student submits a request
4. **Profile Review Result** — Notifies student when TPO approves or rejects their request

Email sending is gracefully skipped if SMTP is not configured (development mode).

## 9.6 File Upload (Resume)

- Handled by Multer middleware (memory storage)
- Uploaded to Cloudinary as PDF
- Cloudinary `public_id` stored for future deletion
- Old resume is deleted from Cloudinary when a new one is uploaded

## 9.7 Rate Limiting

API rate limiting is applied globally using `express-rate-limit`:
- Prevents brute-force attacks on login endpoints
- Configurable window and max requests via environment variables

## 9.8 Frontend State Management

- **Authentication State:** React Context (`AuthContext`) with localStorage persistence
- **Toast Notifications:** React Context (`ToastContext`) for global notification display
- **Component State:** Local `useState` and `useCallback` hooks
- **API Communication:** Axios with interceptors for token refresh and error handling

---

# 10. TESTING

## 10.1 Manual Testing

The following test scenarios were verified manually:

### Authentication Tests
| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Register with valid data | Account created, 201 response | Pass |
| Login with correct credentials | JWT tokens returned | Pass |
| Login with wrong password | 401 Unauthorized | Pass |
| Access protected route without token | 401 Unauthorized | Pass |
| Access route with wrong role | 403 Forbidden | Pass |
| Refresh token rotation | New token pair issued | Pass |
| Logout invalidates refresh token | Subsequent refresh fails | Pass |

### Drive Management Tests
| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Create drive with valid data | Drive created in draft | Pass |
| Open a draft drive | Status changes to open | Pass |
| Close an open drive | Status changes to closed | Pass |
| Delete drive with applications | Drive and applications deleted | Pass |

### Application Tests
| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Apply to open drive (eligible) | Application created | Pass |
| Apply to closed drive | Eligibility error returned | Pass |
| Apply with low CGPA | Eligibility error returned | Pass |
| Apply without resume | Eligibility error returned | Pass |
| Duplicate application | 409 Conflict | Pass |
| Withdraw application | Status set to withdrawn | Pass |

## 10.2 API Testing

All REST API endpoints were tested using HTTP client tools. Key validations:
- Correct HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)
- Proper JSON response structure `{ success, data }` or `{ success, error }`
- Input validation errors return field-level details

---

# 11. RESULTS

## 11.1 Implemented Features

The following features were successfully implemented and are fully functional:

1. **Multi-role Authentication System** with JWT access/refresh token pair
2. **TPO Dashboard** with live statistics (total students, open drives, placement rate, recent drives)
3. **User Management** — Create, update, delete students and HR accounts with CSV bulk import
4. **Company Management** — Full CRUD for company records
5. **Placement Drive Management** — Create drives with eligibility criteria, manage lifecycle (draft → open → closed)
6. **Section Assignment** — Assign drives to specific departments and sections
7. **Student Drive Portal** — Browse open drives with eligibility status indicators
8. **Application System** — Apply, track status, and withdraw applications
9. **HR Portal** — View and manage applications for company-specific drives
10. **Profile Management** — Resume upload, profile edit request workflow with TPO approval
11. **Analytics Page** — Charts and statistics for placement performance
12. **Email Notifications** — Automated emails for status changes and profile requests
13. **Data Export** — Export students and applications to CSV/Excel
14. **Audit Logging** — Complete trail of all system actions
15. **Password Reset** — Email-based password reset flow

## 11.2 System Performance

- API response time: < 200ms for standard queries
- MongoDB indexes on frequently queried fields (status, company, student+drive)
- Rate limiting prevents API abuse
- Cloudinary CDN ensures fast resume delivery

---

# 12. FUTURE ENHANCEMENTS

1. **AI-Based Shortlisting** — Machine learning model to rank candidates based on profile match score
2. **Resume Parsing** — Automatic extraction of skills and experience from uploaded PDFs
3. **Real-Time Notifications** — WebSocket-based live notifications (socket.io) for instant updates
4. **Advanced Analytics** — Year-over-year placement trends, branch-wise comparison charts
5. **Mobile Application** — React Native app for students to track applications on mobile
6. **Interview Scheduling** — Calendar integration for scheduling interviews within the platform
7. **Offer Letter Management** — Digital offer letter generation and e-signature
8. **External Job Board Integration** — Sync drives with LinkedIn, Naukri, or Internshala
9. **Multi-Institution Support** — SaaS model supporting multiple colleges on one platform
10. **Student Skill Assessment** — Built-in aptitude and coding tests linked to drive applications

---

# 13. CONCLUSION

The ScholarFlow Placement Workflow Management System successfully addresses the core challenges of manual campus placement management. By leveraging the MERN stack with TypeScript, the system delivers:

- A secure, role-based platform with JWT authentication and bcrypt password hashing
- Automated eligibility filtering that eliminates manual errors
- Real-time application tracking for students
- A comprehensive TPO dashboard with analytics and bulk data operations
- An audit trail for accountability and compliance
- Automated email notifications reducing manual communication overhead

The project demonstrates practical application of full-stack web development concepts including RESTful API design, NoSQL database modeling, React component architecture, cloud file storage, and security best practices. The modular codebase is designed for scalability and maintainability, making it suitable for real-world deployment in educational institutions.

---

# 14. REFERENCES

1. MongoDB Documentation — https://www.mongodb.com/docs/
2. Express.js Documentation — https://expressjs.com/
3. React Documentation — https://react.dev/
4. Node.js Documentation — https://nodejs.org/docs/
5. Mongoose ODM Documentation — https://mongoosejs.com/docs/
6. JSON Web Token (RFC 7519) — https://datatracker.ietf.org/doc/html/rfc7519
7. Tailwind CSS Documentation — https://tailwindcss.com/docs/
8. Cloudinary Documentation — https://cloudinary.com/documentation
9. TypeScript Handbook — https://www.typescriptlang.org/docs/
10. Vite Documentation — https://vitejs.dev/guide/
11. bcryptjs — https://github.com/dcodeIO/bcrypt.js
12. Nodemailer Documentation — https://nodemailer.com/about/
13. express-rate-limit — https://github.com/express-rate-limit/express-rate-limit
14. Recharts Documentation — https://recharts.org/en-US/

---

*Report prepared for GTU Semester 8 Internship — Computer Engineering Branch*
*Project: ScholarFlow — Web-Based Placement Workflow Management System*
*Technology: MERN Stack (MongoDB, Express.js, React.js, Node.js) with TypeScript*
