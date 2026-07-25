# AI Enterprise Management Platform — Implementation Specification

> **Source of Truth for UI/UX:** `design.md` (design system name: "Synthetix Enterprise"). Every layout, page, component, color, typography rule, spacing rule, and interaction pattern described in `design.md` is authoritative and must be implemented exactly as specified. This document defines the *engineering* specification for building the full-stack application around that design system. Where this document is silent on a visual detail, defer to `design.md`.

---

## 1. Project Overview

### 1.1 Purpose
The AI Enterprise Management Platform is a unified, AI-augmented operations hub for organizations that need to manage people, projects, clients, communication, and knowledge in one system. It combines traditional enterprise-management functionality (teams, projects, tasks, clients) with AI-native features (AI-assisted summaries, AI-generated content flagged via the design system's "AI Specifics" component pattern, and AI-driven insights on the dashboard).

### 1.2 Target Users
- **Executives / Decision-makers:** Need high-level KPIs, health signals, and trend visibility with minimal navigation depth.
- **Technical leads / Managers:** Need dense, structured views of projects, tasks, and team activity, with fast filtering and search.
- **Individual contributors (employees):** Need a focused, low-friction view of their own tasks, messages, and notifications.
- **Clients (external, limited-access role):** Need visibility into the projects and deliverables relevant to them, without access to internal operational data.
- **System administrators:** Need full control over users, roles, permissions, and audit trails.

### 1.3 Business Goals
- Reduce tool fragmentation by consolidating project management, team communication, client management, and reporting into a single platform.
- Provide leadership with real-time, trustworthy operational visibility (the "composed power" emotional goal from `design.md`).
- Support secure, auditable multi-tenant-style access via RBAC so the same platform can serve teams of varying sizes and permission needs.
- Be extensible enough to serve as a long-lived internal tool, not a one-off prototype.

### 1.4 Major Features
1. Authentication & account management (including Google OAuth)
2. Role-Based Access Control (Admin, Manager, Employee, Client roles at minimum)
3. Team and employee management
4. Client management
5. Project and task management (boards, lists, statuses, assignments)
6. Real-time messaging (channels + direct messages)
7. Notifications (in-app + email)
8. Meetings (scheduling, participants, notes)
9. Document management (upload, categorize, share, version reference)
10. Comments and attachments across entities (projects, tasks, documents)
11. Executive dashboard with KPIs, charts, and AI-generated insights
12. Audit logs and activity logs for compliance and traceability
13. Global search and filtering across major entities

### 1.5 Overall Architecture
A **monorepo** containing a Next.js (App Router) frontend and an Express.js backend API, sharing a common TypeScript types/validation package. PostgreSQL (hosted on Neon) is the system of record, accessed through Prisma ORM. Redis provides caching and pub/sub support for real-time features. Socket.IO (backed by Redis adapter) handles real-time messaging and notifications. File storage (Cloudinary or S3) handles attachments, avatars, and documents. The system is deployed as three independently deployable units: frontend (Vercel), backend (Railway or Render), and database (Neon), tied together with GitHub Actions CI/CD. No containerization is required; all services run as native Node.js processes or managed cloud services.

```
┌────────────┐      HTTPS/REST      ┌──────────────┐      Prisma      ┌────────────┐
│  Next.js   │ ───────────────────► │  Express.js  │ ───────────────► │ PostgreSQL │
│  (Vercel)  │ ◄─────────────────── │  (Railway/   │ ◄─────────────── │  (Neon)    │
│            │      WebSocket       │   Render)    │                  └────────────┘
└────────────┘ ◄─────────────────── └──────┬───────┘
                    Socket.IO              │
                                            ├──► Redis (cache, pub/sub, sessions)
                                            ├──► Cloudinary/S3 (file storage)
                                            └──► Nodemailer/SMTP (email)
```

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Next.js (App Router) + React + TypeScript | Server components for data-heavy pages, client components for interactive widgets |
| Styling | Tailwind CSS | Configured with design tokens extracted from `design.md` (colors, radii, spacing, typography) |
| Component library | shadcn/ui | Themed to match `design.md`; used as the base for buttons, dialogs, inputs, tables |
| Forms | React Hook Form + Zod | Shared Zod schemas between client and server via `packages/shared` |
| Server/client state | TanStack Query | All server data fetching, caching, and mutation state |
| Animation | Framer Motion | Micro-interactions, modal/drawer transitions, glassmorphism reveal effects |
| Charts | Recharts | Dashboard KPIs, trend lines, distribution charts |
| Backend framework | Node.js + Express.js + TypeScript | REST API, layered architecture (routes → controllers → services → repositories) |
| Database | PostgreSQL (Neon, serverless Postgres) | Hosted, connection pooling via Neon's pooled connection string |
| ORM | Prisma | Schema-first modeling, migrations, type-safe query client |
| Authentication | JWT (access + refresh tokens), Google OAuth 2.0 | RBAC middleware enforced at the route layer |
| Realtime | Socket.IO (with Redis adapter for horizontal scaling) | Messaging, live notifications, presence |
| Caching | Redis | Session/refresh-token blocklist, rate-limit counters, hot-read caching |
| File storage | Cloudinary or AWS S3 (pluggable via storage adapter interface) | Avatars, attachments, documents |
| Email | Nodemailer (SMTP, e.g. via provider such as Resend/SendGrid SMTP) | Verification, password reset, notification digests |
| Deployment | Vercel (web), Railway or Render (server), Neon (DB), GitHub Actions (CI/CD) | No Docker/Docker Compose required anywhere in the stack |

**Local development constraint:** All services must run directly via `npm`/`pnpm`/`yarn` scripts and `.env` files. No Docker, Docker Compose, or container orchestration may be required to run the project locally.

---

## 3. Folder Structure

```
ai-enterprise-platform/
├── apps/
│   ├── web/                      # Next.js frontend application
│   │   ├── app/                  # App Router pages, layouts, route groups
│   │   ├── components/           # UI components (shadcn/ui-based, design-system themed)
│   │   ├── features/             # Feature-scoped modules (projects, tasks, clients, etc.)
│   │   ├── lib/                  # API client, query hooks, auth helpers, socket client
│   │   ├── styles/                # Tailwind config, global CSS, design tokens
│   │   └── public/               # Static assets
│   └── server/                   # Express.js backend application
│       ├── src/
│       │   ├── routes/           # Express route definitions
│       │   ├── controllers/      # Request/response handling
│       │   ├── services/         # Business logic
│       │   ├── repositories/     # Prisma-based data access layer
│       │   ├── middlewares/      # Auth, RBAC, error handling, rate limiting, validation
│       │   ├── sockets/          # Socket.IO event handlers/namespaces
│       │   ├── jobs/             # Scheduled/background jobs (e.g. digest emails)
│       │   └── config/           # Env config, third-party client setup
│       └── prisma/               # Prisma schema, migrations, seed scripts (server-scoped)
├── packages/
│   └── shared/                   # Shared TypeScript types, Zod schemas, constants, RBAC definitions
├── prisma/                       # Canonical Prisma schema (single source of truth, referenced by server)
├── docs/                         # Architecture docs, ADRs, API reference, onboarding guide
├── tests/                        # Cross-cutting E2E test suites (Playwright)
├── scripts/                      # Dev/setup scripts (db seed, env check, etc.)
└── .github/
    └── workflows/                # CI/CD pipeline definitions
```

**Purpose of each top-level directory:**
- `apps/web` — the entire user-facing application, organized by feature for maintainability.
- `apps/server` — the entire API and real-time backend, organized in a layered architecture to keep business logic testable and independent of Express-specific concerns.
- `packages/shared` — a single source of truth for types and validation schemas so frontend and backend never drift out of sync.
- `prisma` — the canonical database schema; `apps/server` references this via a workspace path.
- `docs` — living documentation for onboarding, architecture decisions, and API contracts.
- `tests` — end-to-end tests that exercise the system as a whole, separate from unit/integration tests colocated within each app.
- `scripts` — one-off or repeatable developer scripts that don't belong in either app.
- `.github/workflows` — CI (lint, typecheck, test, build) and CD (deploy) pipelines.

---

## 4. Database Design

All entities are modeled as Prisma models backed by PostgreSQL on Neon. Below is the logical entity list with relationships, key constraints, and indexing guidance. (No SQL/Prisma code is included per output requirements — this describes the schema at a specification level.)

### 4.1 Core Entities

**User**
- Fields: id (UUID, PK), email (unique, indexed), passwordHash (nullable for OAuth-only accounts), firstName, lastName, avatarUrl, isEmailVerified, googleId (nullable, unique), status (active/suspended/invited), createdAt, updatedAt.
- Relationships: many-to-many with Role (via UserRole join), one-to-many with Task (as assignee), one-to-many with Comment, one-to-many with Notification, one-to-many with AuditLog (as actor).
- Constraints: email unique; at least one of passwordHash/googleId must be present.

**Role**
- Fields: id, name (e.g. Admin, Manager, Employee, Client), description.
- Relationships: many-to-many with User, many-to-many with Permission (via RolePermission).

**Permission**
- Fields: id, key (e.g. `project:create`, `client:view`), description.
- Relationships: many-to-many with Role.

**Team**
- Fields: id, name, description, createdAt.
- Relationships: many-to-many with User (via TeamMember, with a `role within team` attribute e.g. Lead/Member), one-to-many with Project.

**Employee** (extends User with organizational metadata)
- Fields: id, userId (FK, unique), jobTitle, department, managerId (self-referencing FK to Employee), hireDate.
- Relationships: one-to-one with User, self-referential many-to-one for reporting structure.

**Client**
- Fields: id, companyName, primaryContactName, primaryContactEmail, phone, status (active/inactive/prospect), createdAt.
- Relationships: one-to-many with Project.

**Project**
- Fields: id, name, description, status (planning/active/on-hold/completed/archived), priority, startDate, dueDate, teamId (FK), clientId (nullable FK), createdById (FK to User), createdAt, updatedAt.
- Relationships: many-to-one with Team, many-to-one with Client (nullable), one-to-many with Task, one-to-many with Document, one-to-many with Comment, one-to-many with AttachmentLink.
- Indexes: on `status`, `teamId`, `clientId`, `dueDate`.

**Task**
- Fields: id, title, description, status (todo/in-progress/in-review/done), priority, projectId (FK), assigneeId (nullable FK to User), createdById (FK), dueDate, createdAt, updatedAt.
- Relationships: many-to-one with Project, many-to-one with User (assignee), one-to-many with Comment, one-to-many with Attachment.
- Indexes: on `projectId`, `assigneeId`, `status`, `dueDate`.

**Comment**
- Fields: id, body, authorId (FK), commentableType (enum: Project/Task/Document), commentableId (polymorphic reference), createdAt, editedAt (nullable).
- Relationships: many-to-one with User.
- Indexes: composite on (`commentableType`, `commentableId`).

**Attachment**
- Fields: id, fileName, fileUrl, mimeType, sizeBytes, uploadedById (FK), attachableType (enum: Project/Task/Document/Message), attachableId, createdAt.
- Indexes: composite on (`attachableType`, `attachableId`).

**Document**
- Fields: id, title, description, category, currentFileUrl, projectId (nullable FK), uploadedById (FK), createdAt, updatedAt.
- Relationships: many-to-one with Project (nullable, for standalone documents), one-to-many with Comment (via commentable polymorphism), one-to-many with Attachment (for revision history, optional).

**Channel**
- Fields: id, name, type (public/private/direct), teamId (nullable FK), createdById (FK), createdAt.
- Relationships: many-to-many with User (via ChannelMember), one-to-many with Message.

**Message**
- Fields: id, channelId (FK), authorId (FK), body, createdAt, editedAt (nullable), deletedAt (nullable, soft delete).
- Relationships: many-to-one with Channel, many-to-one with User, one-to-many with Attachment.
- Indexes: on (`channelId`, `createdAt`) for efficient pagination.

**Meeting**
- Fields: id, title, description, startTime, endTime, location (or meeting link), organizerId (FK), projectId (nullable FK), createdAt.
- Relationships: many-to-many with User (via MeetingParticipant), many-to-one with Project (nullable).

**Notification**
- Fields: id, userId (FK), type (enum), title, body, isRead, relatedEntityType, relatedEntityId, createdAt.
- Indexes: on (`userId`, `isRead`, `createdAt`).

**AuditLog**
- Fields: id, actorId (FK to User), action (e.g. `user.role.updated`), targetType, targetId, metadata (JSON), createdAt.
- Purpose: records security-sensitive and administrative actions (role changes, permission changes, deletions).
- Indexes: on (`targetType`, `targetId`), on `createdAt`.

**ActivityLog**
- Fields: id, actorId (FK), action (e.g. `task.status.changed`), entityType, entityId, metadata (JSON), createdAt.
- Purpose: records general user activity for activity feeds (distinct from AuditLog, which is for compliance/security).
- Indexes: on (`entityType`, `entityId`), on `createdAt`.

**RefreshToken**
- Fields: id, userId (FK), tokenHash, expiresAt, revokedAt (nullable), createdByIp, createdAt.
- Purpose: supports refresh token rotation and revocation.
- Indexes: on `userId`, on `tokenHash` (unique).

### 4.2 General Schema Rules
- Every model uses UUID primary keys.
- Every model includes `createdAt`; mutable models include `updatedAt`.
- Foreign keys use `ON DELETE RESTRICT` by default for auditability, except join tables and soft-deletable children (e.g. Comments, Attachments), which may cascade.
- Soft deletion (`deletedAt`) is used for Messages, Documents, and Projects to preserve audit trail integrity; hard deletion is reserved for GDPR-style data removal requests, handled through a dedicated admin-only workflow.
- All polymorphic relationships (Comment, Attachment) use a `(type, id)` pair rather than nullable FK columns per type, with indexes on the composite pair.

---

## 5. Authentication & Authorization

### 5.1 Flows
- **Signup:** Email + password (with strength validation) or Google OAuth. Creates a `User` with `isEmailVerified: false` for email/password signups; sends a verification email. Google signups are auto-verified.
- **Login:** Validates credentials, issues a short-lived JWT access token (e.g. 15 min) and a long-lived refresh token (e.g. 7–30 days), the latter stored as an httpOnly, secure, sameSite cookie. A hashed copy of the refresh token is persisted in `RefreshToken` for revocation and rotation tracking.
- **Google Login:** OAuth 2.0 Authorization Code flow. On callback, find-or-create the `User` by `googleId`/email, then issue tokens identically to standard login.
- **Forgot Password:** Generates a single-use, time-limited reset token (hashed, stored server-side or as a signed JWT with short expiry), emails a reset link.
- **Reset Password:** Validates the reset token, updates `passwordHash`, invalidates all existing refresh tokens for that user (forces re-login on all devices).
- **Email Verification:** Signed, expiring verification link emailed on signup; verifying sets `isEmailVerified: true`.
- **Session Management:** Access tokens are stateless and short-lived. Refresh tokens are rotated on every use (old token revoked, new one issued) to detect token theft; reuse of a revoked refresh token revokes the entire token family for that user as a security response.

### 5.2 RBAC
- Roles: **Admin**, **Manager**, **Employee**, **Client** (extensible via the Role/Permission tables described in Section 4).
- Permissions are granular (`project:create`, `project:delete`, `client:view`, `user:manage-roles`, etc.) and attached to roles, not directly to users, to keep authorization data normalized and auditable.
- **Protected Routes:** Enforced both client-side (route guards redirecting unauthenticated/unauthorized users) and server-side (Express middleware validating JWT + required permission(s) per route). Server-side enforcement is the source of truth; client-side checks are a UX convenience only.
- Every permission-denied attempt on a sensitive action is written to `AuditLog`.

---

## 6. Feature Specifications

For each page implied by `design.md`'s component and layout system, the following applies. `design.md` defines the *visual and interaction* language (Premium Enterprise Minimalist, glassmorphism nav/modals, tonal layering, Indigo/Emerald color roles, Geist/Inter/JetBrains Mono typography). This section defines the *functional* contract per page area.

### 6.1 Authentication Pages (Login, Signup, Forgot/Reset Password, Verify Email)
- **Purpose:** Secure entry point to the platform.
- **Interactions:** Form submission with inline validation; "Continue with Google" button; links between login/signup/forgot-password.
- **API:** `POST /auth/login`, `POST /auth/signup`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/google`, `GET /auth/google/callback`, `POST /auth/verify-email`.
- **DB interactions:** Reads/writes to `User`, `RefreshToken`.
- **Validation:** Zod schemas for email format, password complexity (min length, character classes), matching confirm-password field.
- **Permissions:** Public (unauthenticated) routes.
- **States:** Loading (button spinner per `design.md` button styling), empty (n/a), error (inline field errors + toast for server errors), success (redirect to dashboard or a "check your email" confirmation screen).

### 6.2 Dashboard (Home)
- **Purpose:** Executive-level overview — the primary "composed power" screen.
- **Interactions:** Date-range filter, drill-down clicks from KPI cards into filtered list views, hover states on charts (Recharts tooltips styled per design tokens).
- **API:** `GET /dashboard/summary`, `GET /dashboard/charts?range=`.
- **DB interactions:** Aggregation queries across Project, Task, Notification, ActivityLog (read-optimized; consider cached/materialized aggregation refreshed on a schedule for larger datasets).
- **Validation:** Query param validation for date ranges.
- **Permissions:** Visible to all authenticated roles, but KPI scope narrows for Employee/Client roles (e.g. Client sees only their own project's KPIs).
- **States:** Skeleton loaders for cards/charts while loading; explicit empty state ("No project activity yet") when a workspace is new; error state with retry action.

### 6.3 Projects (List + Detail)
- **Purpose:** Central hub for project tracking.
- **Interactions:** Create/edit/archive project (modal, using the glassmorphism modal pattern from `design.md`), filter by status/team/client, search, sort, pagination.
- **API:** `GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id`.
- **DB interactions:** Project CRUD, joins with Team/Client for list display.
- **Validation:** Required name, valid date ranges (dueDate ≥ startDate), valid status enum.
- **Permissions:** Create/edit/delete restricted to Admin/Manager; Employee has read access to assigned projects; Client has read access to their own projects only.
- **States:** List skeleton rows, empty state ("No projects yet — create your first project"), error toast on failed mutation, success toast + optimistic update on save.

### 6.4 Project Detail (Tasks Board/List, Comments, Attachments, Documents)
- **Purpose:** Working surface for a single project.
- **Interactions:** Drag-and-drop or dropdown status change for tasks, inline task creation, comment threads, file upload (Cloudinary/S3), tab navigation between Tasks/Comments/Documents/Activity.
- **API:** `GET /projects/:id/tasks`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`, `GET/POST /comments`, `GET/POST /attachments`.
- **DB interactions:** Task CRUD scoped to project; polymorphic Comment/Attachment writes.
- **Validation:** Task title required, valid assignee (must be a project team member), valid status transitions.
- **Permissions:** Task edit/assign restricted to Admin/Manager/assignee-self (for status updates); Client role is read-only within their project.
- **States:** Per-column skeletons, empty column state, drag-in-progress visual feedback, error rollback on failed status update (optimistic UI).

### 6.5 Tasks (My Tasks / Global Task View)
- **Purpose:** Personal, cross-project task focus view for Employees.
- **Interactions:** Filter by status/due date/priority, mark complete, quick-open linked project.
- **API:** `GET /tasks/mine`, `PATCH /tasks/:id`.
- **DB interactions:** Query Task filtered by `assigneeId = currentUser`.
- **Permissions:** Each user sees only their own assigned tasks by default; Managers/Admins can view team-wide task views.
- **States:** Empty state ("You're all caught up"), overdue-task visual emphasis using the design's error/warning color tokens.

### 6.6 Teams & Employees
- **Purpose:** Organizational structure management.
- **Interactions:** Add/remove team members, assign manager, edit job title/department, invite new employee (triggers email invite flow).
- **API:** `GET /teams`, `POST /teams`, `PATCH /teams/:id`, `GET /employees`, `POST /employees/invite`, `PATCH /employees/:id`.
- **DB interactions:** Team, TeamMember, Employee CRUD.
- **Validation:** Unique team names within an org scope; valid manager reference (no self-reference cycles).
- **Permissions:** Admin/Manager only for mutations; all authenticated users can view the org directory (read-only).
- **States:** Directory list skeleton, empty state for new teams, invite-sent confirmation toast.

### 6.7 Clients
- **Purpose:** CRM-lite client record management.
- **Interactions:** Create/edit client, link to projects, view client's project history.
- **API:** `GET /clients`, `POST /clients`, `GET /clients/:id`, `PATCH /clients/:id`.
- **DB interactions:** Client CRUD, joined Project list per client.
- **Validation:** Required company name, valid email format for primary contact.
- **Permissions:** Admin/Manager full access; Client role can view/edit only their own record's non-sensitive fields.
- **States:** Standard list/detail loading, empty, error, success states as above.

### 6.8 Messaging (Channels + Direct Messages)
- **Purpose:** Real-time team communication.
- **Interactions:** Send/edit/delete message, create channel, join/leave channel, typing indicators, presence indicators, file attachment in-message.
- **API:** `GET /channels`, `POST /channels`, `GET /channels/:id/messages` (paginated), `POST /messages` (also emitted over Socket.IO), `PATCH/DELETE /messages/:id`.
- **Realtime events:** `message:new`, `message:updated`, `message:deleted`, `presence:update`, `typing:start`/`typing:stop`.
- **DB interactions:** Channel, ChannelMember, Message CRUD.
- **Permissions:** Channel visibility governed by membership; private channels require explicit invite; Admins can view org-wide channel list for moderation.
- **States:** Message list skeleton, empty channel state, optimistic send with pending/failed indicator, reconnect banner if socket disconnects.

### 6.9 Notifications
- **Purpose:** Central alerting for mentions, assignments, deadlines, and system events.
- **Interactions:** Mark read/unread, mark all read, click-through to source entity, notification preference toggles (email vs in-app).
- **API:** `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `GET/PATCH /notifications/preferences`.
- **Realtime events:** `notification:new` pushed via Socket.IO in addition to REST polling fallback.
- **DB interactions:** Notification CRUD scoped to `userId`.
- **Permissions:** Users only ever see their own notifications.
- **States:** Unread-count badge, empty state ("No notifications"), grouped-by-date list.

### 6.10 Meetings
- **Purpose:** Scheduling and tracking meetings tied to projects or standalone.
- **Interactions:** Create meeting, invite participants, RSVP, add notes post-meeting, calendar view + list view toggle.
- **API:** `GET /meetings`, `POST /meetings`, `PATCH /meetings/:id`, `POST /meetings/:id/rsvp`.
- **DB interactions:** Meeting, MeetingParticipant CRUD.
- **Validation:** endTime must be after startTime; participant list must reference valid users.
- **Permissions:** Organizer/Admin can edit; participants can RSVP; Clients can view meetings tied to their projects only.
- **States:** Calendar loading skeleton, empty-day state, conflict warning when double-booking is detected.

### 6.11 Documents
- **Purpose:** Central document repository, optionally scoped to a project.
- **Interactions:** Upload, categorize, preview (where supported), download, comment, delete (soft).
- **API:** `GET /documents`, `POST /documents`, `GET /documents/:id`, `DELETE /documents/:id`.
- **DB interactions:** Document CRUD, Attachment linkage for storage provider metadata.
- **Validation:** File type/size validation before upload (client and server), required title/category.
- **Permissions:** Upload/delete restricted to Admin/Manager/uploader; view access follows project visibility rules.
- **States:** Upload progress indicator, empty state, virus/type-rejection error messaging, success confirmation.

### 6.12 Admin Console (Users, Roles, Permissions, Audit Log)
- **Purpose:** Platform administration and compliance oversight.
- **Interactions:** Assign/revoke roles, edit permission sets, suspend/reactivate users, search/filter audit log.
- **API:** `GET/PATCH /admin/users`, `GET/POST/PATCH /admin/roles`, `GET /admin/audit-logs`.
- **DB interactions:** User, Role, Permission, UserRole, RolePermission, AuditLog reads/writes.
- **Permissions:** Admin role only; every mutation here writes an `AuditLog` entry.
- **States:** Paginated tables with skeleton loading, empty state for filtered audit queries, confirmation dialogs (glassmorphism modal) before destructive actions (e.g. suspending a user).

### 6.13 Settings & Profile
- **Purpose:** Personal account management.
- **Interactions:** Edit profile info/avatar, change password, manage notification preferences, view active sessions/revoke refresh tokens, connect/disconnect Google account.
- **API:** `GET/PATCH /users/me`, `POST /users/me/avatar`, `PATCH /users/me/password`, `GET/DELETE /users/me/sessions`.
- **Permissions:** Self-service; users can only ever modify their own account.
- **States:** Save-confirmation toast, avatar-upload progress, session-revoked confirmation.

> **Note on completeness:** No page implied by `design.md`'s component library (navigation, cards, lists, chips, AI-processing indicators) is omitted above. If `design.md` is extended with additional page mockups, this section must be extended in kind before implementation begins.

---

## 7. REST API Specification

All endpoints are prefixed with `/api/v1`. Unless noted, all authenticated endpoints require a valid `Authorization: Bearer <accessToken>` header (or the httpOnly refresh cookie for token-refresh calls), and are additionally checked against RBAC permissions.

### 7.1 Auth
| Method | URL | Body | Auth |
|---|---|---|---|
| POST | `/auth/signup` | `{ email, password, firstName, lastName }` | Public |
| POST | `/auth/login` | `{ email, password }` | Public |
| POST | `/auth/refresh` | (refresh cookie) | Public (cookie-based) |
| POST | `/auth/logout` | — | Authenticated |
| GET | `/auth/google` | — | Public |
| GET | `/auth/google/callback` | — | Public |
| POST | `/auth/forgot-password` | `{ email }` | Public |
| POST | `/auth/reset-password` | `{ token, newPassword }` | Public |
| POST | `/auth/verify-email` | `{ token }` | Public |

*Validation:* Zod schemas enforce email format, password policy (min 8 chars, upper/lower/number), and required fields. *Errors:* `400` validation errors with field-level messages, `401` invalid credentials, `409` duplicate email. *Response:* `{ user, accessToken }` on login/signup with refresh token set as httpOnly cookie.

### 7.2 Users & Profile
| Method | URL | Auth |
|---|---|---|
| GET | `/users/me` | Authenticated |
| PATCH | `/users/me` | Authenticated |
| POST | `/users/me/avatar` | Authenticated |
| PATCH | `/users/me/password` | Authenticated |
| GET | `/users/me/sessions` | Authenticated |
| DELETE | `/users/me/sessions/:id` | Authenticated |

### 7.3 Admin
| Method | URL | Auth |
|---|---|---|
| GET | `/admin/users` | Admin |
| PATCH | `/admin/users/:id` | Admin |
| GET | `/admin/roles` | Admin |
| POST | `/admin/roles` | Admin |
| PATCH | `/admin/roles/:id` | Admin |
| GET | `/admin/audit-logs` | Admin |

### 7.4 Teams & Employees
| Method | URL | Auth |
|---|---|---|
| GET | `/teams` | Authenticated |
| POST | `/teams` | Admin/Manager |
| PATCH | `/teams/:id` | Admin/Manager |
| GET | `/employees` | Authenticated |
| POST | `/employees/invite` | Admin/Manager |
| PATCH | `/employees/:id` | Admin/Manager |

### 7.5 Clients
| Method | URL | Auth |
|---|---|---|
| GET | `/clients` | Admin/Manager (own record for Client role) |
| POST | `/clients` | Admin/Manager |
| GET | `/clients/:id` | Scoped by role |
| PATCH | `/clients/:id` | Admin/Manager (limited fields for Client role) |

### 7.6 Projects & Tasks
| Method | URL | Auth |
|---|---|---|
| GET | `/projects` | Authenticated (scoped) |
| POST | `/projects` | Admin/Manager |
| GET | `/projects/:id` | Scoped by membership |
| PATCH | `/projects/:id` | Admin/Manager |
| DELETE | `/projects/:id` | Admin |
| GET | `/projects/:id/tasks` | Scoped by membership |
| POST | `/tasks` | Admin/Manager |
| PATCH | `/tasks/:id` | Assignee or Admin/Manager |
| DELETE | `/tasks/:id` | Admin/Manager |

### 7.7 Comments & Attachments (polymorphic)
| Method | URL | Auth |
|---|---|---|
| GET | `/comments?type=&id=` | Scoped by parent entity access |
| POST | `/comments` | Scoped by parent entity access |
| DELETE | `/comments/:id` | Author or Admin |
| POST | `/attachments` | Scoped by parent entity access |
| DELETE | `/attachments/:id` | Uploader or Admin |

### 7.8 Messaging
| Method | URL | Auth |
|---|---|---|
| GET | `/channels` | Authenticated (own channels) |
| POST | `/channels` | Authenticated |
| GET | `/channels/:id/messages` | Channel member |
| POST | `/messages` | Channel member |
| PATCH | `/messages/:id` | Author |
| DELETE | `/messages/:id` | Author or Admin |

### 7.9 Notifications
| Method | URL | Auth |
|---|---|---|
| GET | `/notifications` | Authenticated (own) |
| PATCH | `/notifications/:id/read` | Authenticated (own) |
| PATCH | `/notifications/read-all` | Authenticated (own) |
| GET/PATCH | `/notifications/preferences` | Authenticated (own) |

### 7.10 Meetings
| Method | URL | Auth |
|---|---|---|
| GET | `/meetings` | Authenticated (scoped) |
| POST | `/meetings` | Authenticated |
| PATCH | `/meetings/:id` | Organizer or Admin |
| POST | `/meetings/:id/rsvp` | Invited participant |

### 7.11 Documents
| Method | URL | Auth |
|---|---|---|
| GET | `/documents` | Scoped by project/visibility |
| POST | `/documents` | Admin/Manager/uploader-eligible roles |
| GET | `/documents/:id` | Scoped |
| DELETE | `/documents/:id` | Uploader or Admin |

### 7.12 Dashboard
| Method | URL | Auth |
|---|---|---|
| GET | `/dashboard/summary` | Authenticated (scoped) |
| GET | `/dashboard/charts` | Authenticated (scoped) |

**Common error response shape (all endpoints):**
```
{ "error": { "code": "STRING_CODE", "message": "Human readable", "fields": { "field": "reason" } } }
```
Standard HTTP codes: `400` validation, `401` unauthenticated, `403` unauthorized (permission denied), `404` not found, `409` conflict, `429` rate-limited, `500` server error.

---

## 8. UI Components

All components are built as themed shadcn/ui primitives extended with the tokens defined in `design.md` (colors, typography scale, radii, spacing, elevation). Components must not hardcode colors/spacing — always reference the design token layer (Tailwind theme extension mapped 1:1 to `design.md`'s `colors`, `typography`, `rounded`, and `spacing` blocks).

- **Buttons:** Primary (Indigo→Blue gradient per `design.md`), Secondary, Ghost, Destructive (error tokens), Icon-only. All variants support loading and disabled states.
- **Forms:** Text input, textarea, select, combobox, date picker, checkbox, radio group, switch — all wired to React Hook Form + Zod resolvers, with `label-md` JetBrains Mono labels per the design spec.
- **Tables:** Sortable headers, row selection, sticky header, high-density row style with 1px dividers per `design.md`'s "Lists" component rules.
- **Charts:** Recharts wrappers (line, bar, area, donut) themed with Primary/Secondary/Tertiary color tokens.
- **Cards:** Base card per `design.md`'s signature component spec (1px border, 16px radius, top-light inner border "milled" look).
- **Dialogs/Modals:** Glassmorphism per `design.md` Level 2 elevation spec (semi-transparent surface, 20px backdrop blur).
- **Toasts:** Success/error/info variants using the design's semantic color tokens (Emerald for success, Error tokens for failure).
- **Skeleton loaders:** Shimmer placeholders matching each component's real footprint (cards, table rows, chart areas).
- **Pagination:** Numbered + prev/next, used across all list views (Projects, Tasks, Clients, Documents, Audit Log).
- **Search:** Global search bar (pill-shaped per `design.md` shape rules) with debounced query and scoped/cross-entity modes.
- **Filters:** Dropdown/multi-select filter chips using the Chips/Badges component spec.
- **Breadcrumbs:** Used on all detail pages (e.g. Projects → [Project Name] → Tasks).
- **Sidebar:** Primary navigation, glassmorphism per the design's global-nav rule, collapsible on smaller viewports.
- **Navbar:** Top bar with global search, notification bell (unread badge), profile menu.
- **AI indicator:** Sparkle icon + thin animated gradient border wrapper component, applied to any element rendering AI-generated content (per `design.md`'s "AI Specifics" rule), used e.g. on dashboard insight cards and AI-summarized comment threads.

---

## 9. Dashboard

The dashboard is the platform's flagship screen and must fully reflect the KPIs, charts, and layout implied by `design.md`'s brand goal of "composed power" over complex data.

**KPI Cards (top row):**
- Active Projects (count + trend delta)
- Open Tasks (count, broken down by overdue vs on-track)
- Team Utilization / Active Employees
- Client Satisfaction / Active Clients (if applicable to org)

**Charts:**
- Project status distribution (donut chart — Primary/Secondary/Tertiary token colors)
- Task completion trend over time (line/area chart, last 30/90 days, selectable range)
- Team workload distribution (bar chart, tasks per team member)
- Upcoming deadlines (compact list widget, sorted ascending by due date, color-coded by urgency using error/warning tokens)

**AI Insights Panel:**
- A dedicated card using the "AI Specifics" component treatment (Sparkle icon, animated gradient border) surfacing generated summaries such as "3 projects are at risk of missing deadline" — sourced from backend aggregation/heuristics (or a pluggable AI-summary service) and clearly marked as AI-generated content, never presented as ground truth without a way to drill into the underlying data.

**Recent Activity Feed:** Real-time-updating list (via Socket.IO) driven by `ActivityLog`, using the high-density list component style.

All widgets independently support loading, empty, and error states so a partial dashboard failure never blocks the rest of the page from rendering.

---

## 10. Validation Rules

All validation is defined once as Zod schemas in `packages/shared` and consumed by both the Next.js forms (via `@hookform/resolvers/zod`) and the Express backend (as request middleware), guaranteeing the frontend and backend can never diverge on validation rules.

Representative rules by entity:
- **User:** email — valid email format, required; password — min 8 chars, at least one uppercase, one lowercase, one digit; firstName/lastName — required, max 60 chars.
- **Project:** name — required, 3–120 chars; startDate/dueDate — valid dates, dueDate ≥ startDate; status — must be one of the defined enum values.
- **Task:** title — required, 3–200 chars; assigneeId — must reference a user who is a member of the task's project team; dueDate — optional, must be a valid date if present.
- **Client:** companyName — required; primaryContactEmail — valid email format.
- **Comment:** body — required, 1–5000 chars, sanitized against XSS before storage/render.
- **Message:** body — required unless attachment present, max 10,000 chars.
- **Attachment/Document upload:** file size — enforced max (e.g. 25MB), MIME type — allow-list enforced both client-side (immediate feedback) and server-side (authoritative check).
- **Meeting:** endTime — must be after startTime; participant list — must be non-empty and reference valid users.

Every mutation endpoint validates input server-side regardless of client-side validation state — client validation is UX only, never a security boundary.

---

## 11. Security

- **Password hashing:** bcrypt with a cost factor tuned for the deployment environment (e.g. 12), never store plaintext passwords, never log password fields.
- **Helmet:** Applied globally on the Express app for secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.).
- **CORS:** Locked to the known frontend origin(s); credentials enabled only for that allow-listed origin.
- **Rate limiting:** Applied per-IP and per-account on sensitive endpoints (login, signup, password reset, refresh) via Redis-backed counters; general API rate limiting applied more loosely across all endpoints.
- **Input sanitization:** All rich-text/comment/message bodies sanitized server-side before storage and again on render (defense in depth) to prevent stored XSS.
- **SQL injection prevention:** Enforced structurally by using Prisma's parameterized query builder exclusively — no raw string-concatenated SQL.
- **XSS protection:** Output encoding on render, CSP headers, sanitization library on any user-generated HTML/rich text.
- **CSRF strategy:** Since auth uses Bearer tokens for API calls and an httpOnly refresh cookie only for the token-refresh endpoint, CSRF risk is minimized; the refresh endpoint additionally uses `SameSite=Strict` (or `Lax` if cross-subdomain refresh is required) plus double-submit or origin-check protection.
- **Secure cookies:** `httpOnly`, `secure`, `sameSite` flags set on the refresh-token cookie at all times in production.
- **File upload validation:** Server-side MIME-type and size validation, virus-scanning hook point (pluggable), storage of files outside of any statically served directory, signed/short-lived URLs for private document access.
- **Environment variables:** All secrets (DB connection strings, JWT secrets, OAuth client secrets, storage keys, SMTP credentials) loaded exclusively from environment variables, never committed to source control; `.env.example` files document required variables without real values.
- **Secrets management:** Production secrets managed via the hosting platform's secret store (Vercel/Railway/Render environment variable management); rotate JWT signing secrets and OAuth credentials on a defined schedule.

---

## 12. Performance

- **Lazy loading:** Route-level code splitting is inherent to Next.js App Router; heavy client components (charts, rich editors) additionally use `dynamic()` imports with loading fallbacks.
- **Code splitting:** Feature-scoped bundles so unrelated features (e.g. Admin console) are not shipped to non-admin users' initial bundle.
- **Pagination:** All list endpoints (Projects, Tasks, Clients, Messages, Documents, Audit Logs) are cursor- or offset-paginated server-side; the client never fetches unbounded lists.
- **Infinite scrolling:** Applied where appropriate to high-frequency content (Messages, Activity Feed, Notifications) using TanStack Query's infinite query support.
- **Caching:** TanStack Query caches and dedupes client-side reads; Redis caches expensive/aggregate server-side reads (e.g. dashboard summaries) with a short TTL and explicit invalidation on writes.
- **Image optimization:** Next.js `<Image>` component for all raster assets; uploaded images processed/transformed via Cloudinary transformations (or S3 + a CDN/image-processing layer) rather than served at original resolution.
- **API optimization:** Response payloads shaped per-endpoint (no over-fetching); N+1 query patterns avoided via Prisma `include`/`select` tuning.
- **Database indexing:** As specified per-entity in Section 4; all foreign keys and frequently filtered/sorted columns are indexed.
- **Query optimization:** Aggregation-heavy dashboard queries are either precomputed on a schedule or scoped tightly with indexed filters; slow-query logging enabled in production to catch regressions.

---

## 13. Accessibility

- Full keyboard navigation across all interactive elements (menus, modals, tables, forms); visible focus states styled consistently with the design system's ring/glow treatment described for input focus states.
- Semantic HTML throughout (`nav`, `main`, `header`, `button`, `table`, proper heading hierarchy matching the `display`/`headline`/`body` typographic scale from `design.md`).
- ARIA roles/labels on custom components (custom dropdowns, drag-and-drop task boards, toasts as `role="status"`/`role="alert"`).
- Color contrast validated against WCAG AA for both the dark (default) and mirrored light mode described in `design.md`, particularly for text-on-surface and chip/badge combinations.
- Motion (Framer Motion transitions) respects `prefers-reduced-motion`.
- All images/icons have appropriate `alt` text or `aria-hidden` when purely decorative.
- Form errors are announced to assistive technology (associated via `aria-describedby`) in addition to visual inline styling.

---

## 14. Testing

- **Unit tests:** Business logic in `services/` (backend) and pure utility functions (frontend) tested with Jest/Vitest; target high coverage on validation, RBAC permission resolution, and token handling logic.
- **Integration tests:** Backend route-level tests exercising controller → service → repository → test database (a dedicated Neon branch or local test schema) for each feature module.
- **API tests:** Contract-level tests verifying request/response shapes, status codes, and error formats against Section 7's specification.
- **Component tests:** React Testing Library tests for key interactive components (forms, task board, message composer) verifying accessible roles and interaction behavior, not implementation details.
- **End-to-end tests:** Playwright suites in `tests/` covering critical user journeys — signup/login, create project → create task → assign → complete, send a message, upload a document, admin role change — run against a staging-like environment in CI.
- **CI gating:** All test suites run in GitHub Actions on every PR; merges blocked on failing tests, lint errors, or type errors.

---

## 15. DevOps

- **Local development (no Docker):** Node.js (LTS) installed directly on the developer machine; package manager of choice (npm/pnpm/yarn) with workspace support for the monorepo; `.env` files per app (`apps/web/.env.local`, `apps/server/.env`) populated from `.env.example` templates; PostgreSQL provided by a Neon development branch (no local Postgres install required); Redis provided by a lightweight managed free-tier instance (e.g. Upstash) for local development, avoiding any local service installation.
- **CI/CD (GitHub Actions):**
  - `ci.yml`: on every PR — install dependencies, lint, typecheck, run unit/integration tests, build both apps.
  - `deploy-web.yml`: on merge to main — trigger Vercel deployment (or rely on Vercel's native GitHub integration).
  - `deploy-server.yml`: on merge to main — trigger Railway/Render deployment via their GitHub integration or CLI-based deploy step.
  - `migrate.yml`: run Prisma migrations against the Neon production branch as a controlled, manually-approved step (never auto-applied without review).
- **Production deployment:** Frontend on Vercel (automatic preview deployments per PR, production deployment on merge to main); backend on Railway or Render as a persistent Node.js service (with the Socket.IO server requiring sticky sessions or a Redis adapter for multi-instance scaling); database on Neon with separate branches for development/staging/production.
- **Logging:** Structured JSON logging (e.g. via `pino`) in the backend, shipped to the hosting platform's log viewer at minimum, with a clear path to a dedicated log aggregator later.
- **Monitoring:** Uptime/health-check endpoint (`GET /health`) polled by the hosting platform; basic performance monitoring via the hosting platform's built-in metrics.
- **Error reporting:** Integrated error-tracking (e.g. Sentry) on both frontend and backend to capture unhandled exceptions with source-mapped stack traces.
- **Database provisioning:** Neon branches mirror the environment model (dev/staging/production); migrations applied via Prisma Migrate, never via manual schema edits.

---

## 16. Coding Standards

- **TypeScript:** `strict` mode enabled across all packages; no implicit `any`; shared types sourced from `packages/shared` rather than duplicated.
- **ESLint:** Shared config across `apps/web` and `apps/server`, extended per-app only where necessary (e.g. React-specific rules for web, Node-specific rules for server).
- **Prettier:** Single shared configuration enforced via a pre-commit hook (e.g. Husky + lint-staged) so formatting is never a PR discussion point.
- **Naming conventions:** PascalCase for components/types, camelCase for variables/functions, kebab-case for file names (except React component files, which match the component's PascalCase name), SCREAMING_SNAKE_CASE for constants/env keys.
- **Reusable architecture:** UI components are presentation-only where possible; data-fetching and mutation logic lives in custom hooks (`useProjects`, `useCreateTask`, etc.) built on TanStack Query, keeping components thin.
- **Clean code principles:** Small, single-responsibility functions; early returns over deep nesting; explicit over implicit; no magic numbers/strings (use named constants/enums, especially for role names, status enums, and permission keys).
- **Error handling strategy:** Centralized Express error-handling middleware translating thrown errors (including a custom `AppError` class carrying HTTP status + error code) into the standard error response shape from Section 7; frontend uses a shared API-client error normalizer feeding TanStack Query's error states and a global toast handler for unexpected failures.

---

## 17. Instructions for AI Coding Agent

- Follow the attached `design.md` exactly for all visual design decisions — colors, typography, spacing, radii, elevation, and component styling. Do not introduce colors, fonts, or spacing values not derived from its token definitions.
- Do not invent or remove pages, features, or entities beyond what is specified in this document and implied by `design.md`, without explicitly noting the deviation and rationale in `docs/`.
- Build the application feature by feature, in a logical dependency order: (1) monorepo scaffolding and shared package, (2) database schema and migrations, (3) authentication and RBAC, (4) core entities (Teams/Employees/Clients/Projects/Tasks), (5) collaboration features (Comments/Attachments/Documents), (6) realtime features (Messaging/Notifications), (7) Meetings, (8) Dashboard, (9) Admin console, (10) polish (accessibility, performance, testing, CI/CD).
- Use production-quality code at every step — no placeholder logic left unimplemented, no TODOs left unresolved in a "final" deliverable unless explicitly flagged as a documented follow-up.
- Keep components reusable and composable; avoid one-off, page-specific components where a shared, parameterized component would serve multiple pages.
- Keep business logic separate from UI — no direct database or complex business-rule logic inside React components; no HTTP/Express-specific concerns inside service-layer business logic.
- Write maintainable, scalable code that a new engineer could onboard onto using only `docs/` and inline documentation.
- Add comments only where they improve clarity (non-obvious business rules, security-sensitive logic, workarounds) — do not narrate obvious code.
- Generate comprehensive documentation in `docs/` covering architecture decisions, setup instructions, API reference, and RBAC permission matrix.
- Ensure all layouts are fully responsive per `design.md`'s mobile (4-column) and desktop (12-column) grid specifications.
- Prioritize security, performance, and accessibility as first-class concerns at every implementation step, not as a final pass — apply Sections 11–13 of this document continuously throughout development.
