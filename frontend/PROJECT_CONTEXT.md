# PROJECT TITLE: Web-Based Placement Workflow Management System

## PROJECT OVERVIEW:
This project is a web-based Placement Management System (PMS) built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The system is designed to streamline and digitize the campus placement process for educational institutions. It replaces manual workflows such as spreadsheets and email communication with a centralized, role-based platform.

## OBJECTIVE:
To build a scalable, secure, and role-based system that allows seamless interaction between Admins, Training & Placement Officers (TPOs), Placement Coordinators, and Students.

## TECH STACK:

* Frontend: React.js with Tailwind CSS
* Backend: Node.js with Express.js
* Database: MongoDB
* Authentication: JWT (JSON Web Token)
* API Communication: REST APIs using Axios

## USER ROLES AND PERMISSIONS:

1. **Admin**:
* Create and manage users (Students, TPOs, Coordinators)
* Full system access

2. **Student**:
* Register and login
* View available placement drives
* Apply for jobs
* Track application status

3. **Training & Placement Officer (TPO)**:
* Create and manage placement drives
* Assign drives to departments
* Manage drive lifecycle (open, close, shortlist)

4. **Placement Coordinator**:
* Assign companies to specific sections
* Manage student-company allocation

## CORE FEATURES:

* Role-Based Authentication and Authorization (RBAC)
* Company and Placement Drive Management
* Student Registration and Profile Management
* Application Tracking System (Applied, Shortlisted, Selected, Rejected)
* Eligibility Filtering (based on CGPA, backlogs, department, etc.)
* Section-wise and Department-wise Allocation
* Bulk Data Upload via CSV
* Data Export for reporting and analysis
* Audit Logging for tracking system actions
* Real-time updates and dashboard views

## DATABASE DESIGN (MongoDB Collections):

* **Users**: name, email, password (hashed), role, department, section, cgpa, backlog
* **Companies**: name, package, eligibility (minCGPA, maxBacklogs)
* **Drives**: companyId, department, section, date, status
* **Applications**: studentId, driveId, status (applied, shortlisted, rejected, selected)
* **AuditLogs**: userId, action, timestamp

## SYSTEM ARCHITECTURE:

* Frontend (React): Handles UI and role-based dashboards
* Backend (Node + Express): Handles API logic and authentication
* Database (MongoDB): Stores all system data

## ARCHITECTURE TYPE:
Three-tier architecture:

1. Presentation Layer (Frontend)
2. Application Layer (Backend)
3. Data Layer (Database)

## WORKFLOW:

1. Admin creates users
2. TPO creates placement drives
3. Coordinator assigns drives to sections
4. Students apply to drives
5. System filters eligible candidates
6. TPO shortlists candidates
7. Final selection and offer generation

## SECURITY:

* JWT-based authentication
* Password hashing using bcrypt
* Role-based access control
* Input validation and sanitization

## EXPECTED OUTPUT:

* A fully functional web application
* Separate dashboards for each role
* Secure login system
* Real-time placement tracking
* Clean and responsive UI

## FUTURE ENHANCEMENTS:

* Resume upload and parsing
* AI-based candidate shortlisting
* Analytics dashboard with charts
* Email/SMS notifications
* Integration with external job platforms

## INSTRUCTIONS FOR AI:

* Generate full-stack MERN code for this system
* Follow modular and scalable architecture
* Implement role-based authentication
* Create RESTful APIs
* Design responsive frontend UI
* Ensure clean code and best practices
