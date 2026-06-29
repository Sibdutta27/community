# Community — Product Requirements Document (as-built)

| | |
|---|---|
| **Status** | Draft (as-built) |
| **Mode** | as-built |
| **Date** | 2026-06-29 |
| **Author** | Generated via `/create-prd as-built`, confirmed with product owner |
| **Related** | [`docs/architecture/backend.md`](../architecture/backend.md), [`frontend.md`](../architecture/frontend.md), [`admin-panel.md`](../architecture/admin-panel.md), [`docs/data-model.md`](../data-model.md), [`docs/design-system.md`](../design-system.md) |

> This is a reverse-documented ("as-built") PRD describing the product as it exists
> in the codebase today. *How it works* is grounded in the code; *why it exists and
> who it serves* was confirmed with the product owner. Architecture specifics live in
> the linked docs and are not duplicated here.

## 1. Problem

An Indigenous nation needs a trustworthy, auditable way for prospective members to
**apply for official citizenship/enrollment** and for enrollment staff to **verify
lineage and supporting documents** before conferring membership. Paper- or
spreadsheet-based enrollment is hard to audit, slow to review, exposes sensitive
genealogical and personal data without clear consent, and gives applicants no
visibility into their status. The community also wants a single place to offer member
**services** and **events** and to engage the broader community.

## 2. Goals & success metrics

- Let prospective members complete a structured, multi-step enrollment application
  online, save progress, and submit when ready.
- Give enrollment staff a review workflow to approve/reject applications with their
  documents and lineage in one place.
- Collect personal and genealogical data only **after** explicit, versioned consent.
- Offer members and the community services and events to register for.
- **Success looks like:** applicants can self-serve an enrollment from draft to
  decision; staff can review and decide from the admin panel; every personal-data
  capture is preceded by a recorded consent acceptance.
- **Non-goals:** payments/billing (see §8); see §9 for items deferred to confirmation.

## 3. Users / personas

- **Prospective member (applicant)** — an individual seeking citizenship/enrollment in
  the nation. Registers an account, accepts consent, completes the 4-step enrollment,
  uploads documents, and tracks status. Uses the **member frontend** (`CommunityFrontend`).
- **Member** — an applicant whose enrollment is approved; continues to use the member
  frontend for profile, services, and events.
- **Enrollment officer / administrator** — community staff who review applications,
  verify documents and lineage, make approve/reject decisions, and manage consents,
  cultural connections, services, and events. Uses the **admin panel**
  (`communityAdminPanel`).
- **Public visitor** — anyone browsing public/marketing pages (about, community,
  yucayeke, services, contact) before signing up.

## 4. Requirements (user stories)

> Acceptance criteria use **WHEN `<condition>` THEN the system shall `<response>`**.

### FR-1 — Account registration & authentication
As a prospective member, I want to register and sign in, so that I can start and
return to my enrollment securely.
- WHEN a visitor registers with a valid email and password THEN the system shall
  create a `User` (role member) and issue a JWT (`{ sub, email, role, publicId, name }`,
  1h expiry).
- WHEN a member signs in with valid credentials THEN the system shall set the
  `community_auth_token` cookie and grant access to protected routes.
- WHEN an unauthenticated user requests a protected route (e.g. `/dashboard`,
  `/my-profile`) THEN the system shall redirect them to sign-in.
- WHEN an administrator signs in via the admin login THEN the system shall return an
  access token stored by the admin panel and authorize admin-only endpoints.

### FR-2 — Consent before data capture
As the nation, I want explicit versioned consent before any personal/genealogical data
is written, so that collection is lawful and policy-compliant.
- WHEN a member attempts a document or enrollment write without an accepted active
  consent THEN the system shall block it (`ConsentAcceptedGuard`).
- WHEN a member accepts the active consent THEN the system shall record an
  `EnrollmentConsent` acceptance tied to the active `Consent` template/version.
- WHEN an administrator publishes a new consent version THEN the system shall treat it
  as the active template for subsequent acceptances.

### FR-3 — Multi-step enrollment with saved progress
As a prospective member, I want to complete enrollment in steps and save as I go, so
that I don't lose work and can finish later.
- WHEN a member begins enrollment THEN the system shall create an `Enrollment` in
  `DRAFT` status linked to their `User`.
- WHEN a member completes step 1–4 (basic/contact/addresses → … → maternal lineage +
  cultural connections → documents) THEN the system shall persist each step's data
  (including `Address` CURRENT/MAILING, `Contact`, `EmergencyContact`,
  `MaternalLineage`, `EnrollmentCulturalConnection`).
- WHEN a member submits a complete enrollment THEN the system shall set status to
  `SUBMITTED` and make it available for staff review.
- WHILE an enrollment is `DRAFT` the system shall allow the member to edit it.

### FR-4 — Document upload & management
As a prospective member, I want to upload supporting documents, so that staff can
verify my eligibility.
- WHEN a member uploads a file of an allowed type (JPEG, PNG, WebP, PDF) within the
  size limit (10MB) THEN the system shall store it in S3/MinIO and create a `Document`
  (status `PENDING`).
- WHEN a member uploads a single-file type (e.g. PROFILE_PICTURE, BIRTH_CERTIFICATE)
  THEN the system shall upsert (replace) the prior file of that type.
- WHEN a member uploads a multi-file type (e.g. FAMILY_PHOTO, ADDITIONAL_EVIDENCE)
  THEN the system shall append the new file.
- IF an upload's storage or DB step fails THEN the system shall not leave orphaned
  files (transactional S3 + DB handling).

### FR-5 — Staff review & enrollment decision
As an enrollment officer, I want to review submitted enrollments with their documents
and lineage, so that I can approve or reject membership.
- WHEN an officer opens the enrollments list THEN the system shall allow filtering by
  status (e.g. SUBMITTED) and opening an enrollment detail view.
- WHEN an officer approves an enrollment THEN the system shall set status to `APPROVED`.
- WHEN an officer rejects an enrollment THEN the system shall set status to `REJECTED`.
- WHEN an officer reviews a document THEN the system shall allow setting its status
  (PENDING/APPROVED/REJECTED).

### FR-6 — Member profile & dashboard
As a member, I want a profile and dashboard, so that I can see my status and manage my
information and documents.
- WHEN a member opens the dashboard THEN the system shall show their enrollment status
  and relevant next steps.
- WHEN a member updates profile info or uploads a profile photo THEN the system shall
  persist it to their `User`/profile and documents.

### FR-7 — Services (catalog + registration)
As a member/community member, I want to browse and register for services, so that I can
access community programs.
- WHEN a visitor/member views services THEN the system shall list services by
  `ServiceCategory`.
- WHEN a member registers for a service THEN the system shall create a
  `ServiceRegistration`.
- WHEN an administrator creates/edits a service or category THEN the system shall
  persist it and reflect it in the catalog.

### FR-8 — Events (catalog + registration)
As a member/community member, I want to browse and register for events, so that I can
attend community gatherings.
- WHEN a member registers for an event THEN the system shall create an
  `EventRegistration`.
- WHEN an administrator creates/edits an event or category THEN the system shall
  persist it and reflect it in the listings.

### FR-9 — Administration of reference data
As an administrator, I want to manage users, consents, and cultural connections, so
that the platform's reference data stays correct.
- WHEN an administrator manages cultural connections THEN the system shall support
  create/edit/list used by enrollment.
- WHEN an administrator manages users THEN the system shall support listing and editing.

### Non-functional requirements
- **NFR-1 (Auth & roles)** — JWT-based; members authenticate via httpOnly cookie,
  admins via bearer token; admin endpoints are guarded (`AdminAuthGuard`); tokens
  expire after 1h.
- **NFR-2 (Privacy/compliance)** — No personal/genealogical write occurs without a
  recorded active-consent acceptance (legal + governance driven).
- **NFR-3 (File safety)** — Enforced allowed types and 10MB limit; transactional
  storage; admin-rendered HTML is sanitized (DOMPurify).
- **NFR-4 (Backend is source of truth)** — Both frontends consume the same NestJS REST
  API; the member frontend proxies via BFF route handlers.
- **NFR-5 (Two design systems)** — The member frontend (warm, earthy; Tailwind v4 +
  shadcn) and the admin panel (dark MUI theme) are deliberately distinct and must not
  cross-pollinate.

## 5. Solution overview

Three applications over one REST API:
- **Member frontend** (`CommunityFrontend`, Next.js 16): public/marketing pages, auth,
  consent, the 4-step enrollment flow, document upload, dashboard, profile, services,
  and events. Talks to the backend through its own BFF route handlers.
- **Admin panel** (`communityAdminPanel`, Vite + React + MUI): staff review of
  enrollments (with status filters and approve/reject), plus management of users,
  consents, cultural connections, services, and events.
- **Backend API** (`CommunityBackend`, NestJS 11 + Prisma 7, Postgres, S3/MinIO): the
  single source of truth — auth, enrollment, documents, consent, services, events,
  account/profile, and admin modules, with JWT and consent guards.

Core flow: register → accept consent → complete 4-step enrollment → upload documents →
submit → staff review → approve/reject. Members and the community also register for
services and events.

## 6. Design / technical plan (as-built)

- **Domain model** — see [`docs/data-model.md`](../data-model.md): `User`,
  `Enrollment` (lifecycle `DRAFT→SUBMITTED→APPROVED/REJECTED`), `Address`, `Contact`,
  `EmergencyContact`, `Document`, `Consent`/`EnrollmentConsent`, `MaternalLineage`,
  `CulturalConnection`/`EnrollmentCulturalConnection`,
  `Service`/`ServiceCategory`/`ServiceRegistration`,
  `Event`/`EventCategory`/`EventRegistration`.
- **Backend** — see [`docs/architecture/backend.md`](../architecture/backend.md):
  feature modules (auth, user, enrollment, document, consent, service, event, account,
  profile, admin) + guards (`JwtAuthGuard`, `AdminAuthGuard`, `ConsentAcceptedGuard`,
  `ActivityGuard`); files in S3/MinIO.
- **Member frontend** — see [`docs/architecture/frontend.md`](../architecture/frontend.md):
  App Router route groups `(public)`/`(auth)`/`(protected)`, BFF handlers under
  `app/api`, TanStack Query data layer, react-hook-form + Zod forms, cookie auth via
  middleware.
- **Admin panel** — see [`docs/architecture/admin-panel.md`](../architecture/admin-panel.md):
  React Router protected routes, per-resource API + TanStack Query, data-table with
  server-side pagination, localStorage token + 401 interceptor.

## 7. Implementation plan (vertical slices)

> As-built, the product already exists. These slices describe how the same product
> would be (re)built incrementally — useful as a model for future features and for
> onboarding. Each cuts data → API → UI and is independently demoable.

1. **Auth slice** — register/login, JWT issue, cookie/bearer storage, protected-route
   redirect. *Demo:* sign up, sign in, hit a protected page.
2. **Consent gate slice** — active consent template, acceptance record, guard on
   personal-data writes. *Demo:* writes blocked until consent accepted.
3. **Enrollment draft slice** — create/edit DRAFT enrollment across the 4 steps with
   saved progress. *Demo:* fill step 1, leave, return, continue.
4. **Documents slice** — typed upload to S3, single vs multi-file rules, listing.
   *Demo:* upload a birth certificate (replaces) and family photos (appends).
5. **Submit + review slice** — submit DRAFT→SUBMITTED; admin list/filter/detail;
   approve/reject. *Demo:* submit as member, decide as officer.
6. **Profile/dashboard slice** — status + profile edits + profile photo.
7. **Services slice** — catalog by category + member registration + admin CRUD.
8. **Events slice** — listings by category + member registration + admin CRUD.

## 8. Out of scope / non-goals

- **Payments / billing** — services and events have no payment/checkout; intentionally
  out of scope.
- **Cross-pollinating the two design systems** — explicitly disallowed (see NFR-5).

## 9. Open questions

- **Notifications** — is email/push notification (e.g. on status change, event
  reminders) in scope, planned, or intentionally absent? Not confirmed; treat as TBD.
- **Service/Event access gating** — confirmed as a *mixture*: some are member
  benefits/gatherings and some are broader community engagement not strictly gated to
  enrollment. Exact rules per service/event type to be specified if/when enforced.
- **Roadmap surfaces** — a **PWA** and a **mobile app** are planned (driving the
  monorepo restructure); their feature scope is not yet defined.

## Appendix
- Architecture: [`backend.md`](../architecture/backend.md),
  [`frontend.md`](../architecture/frontend.md),
  [`admin-panel.md`](../architecture/admin-panel.md)
- Data model: [`data-model.md`](../data-model.md)
- Design system: [`design-system.md`](../design-system.md)
