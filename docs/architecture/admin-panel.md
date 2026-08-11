# Admin Panel Architecture — apps/admin

Vite 6 + React 19 (plain **JS/JSX**), MUI v9. See
[`../../apps/admin/CLAUDE.md`](../../apps/admin/CLAUDE.md) for the quick reference.

## Layout (`src/`)

| Path                         | Responsibility                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.jsx`                   | Entry; `BrowserRouter`, `QueryClientProvider`, `ToastContainer`                                                                                                           |
| `api/client.js`              | axios instance (base `VITE_API_URL`); request interceptor adds bearer, response interceptor redirects on 401                                                              |
| `api/*.api.js`               | per-resource calls: auth, user, enrollment, event, eventCat, service, serviceCat, consent, culturalConnection, account                                                    |
| `routes/AppRoutes.jsx`       | route table                                                                                                                                                               |
| `routes/ProtectedRoutes.jsx` | localStorage `token` guard                                                                                                                                                |
| `layouts/AdminLayout/`       | Sidebar + Navbar + `<Outlet/>`                                                                                                                                            |
| `pages/`                     | Login, Users, Enrollments, Services (+ ServiceRegistrations), Events (+ EventRegistrations), Consents, CulturalConnections, ServiceCategories, EventCategories, Dashboard |
| `components/`                | Navbar, Sidebar, StatCard, `SectionNav` (+ `ViewToggle`), `Registrants/RegistrantsTable`, `ui/Table` (rdt wrapper), `ui/Checkbox`                                         |
| `hooks/`                     | useDebounceState, useDebouncedFunction, useSearch, useThrottle                                                                                                            |
| `utils/`                     | `downloadFile.util.js` — `downloadTextFile` + `filenameSlug` (CORS hides `Content-Disposition`, so the client names the CSV)                                              |

Vite aliases: `@`, `@components`, `@pages`, `@hooks`, `@utils`, `@assets`, `@theme`.

## Routing

`/login` is public; everything else is under `ProtectedRoutes` → `AdminLayout`. Index `/`
redirects to `/users`. Resource pages follow `list / create / edit/:id`:

- `/users`, `/enrollments/{all,submitted,approved,rejected,approval/:id}`
- `/cultural-connections`, `/consents`, `/services`, `/service-categories`,
  `/events`, `/event-categories` (each with create + edit/:id).
- `/feedback` (triage queue, filterable by status) + `/feedback/:id` (read-only detail with a
  status control — feedback is member-authored, so there is no create/edit).
- `/events/:id/registrations`, `/services/:id/registrations` — registrant rosters (read-only:
  paginated table + debounced search + CSV export, all via `components/Registrants`).
- `/events` renders **Calendar (default) or List**, selected by `?view=calendar|list`.

## Section nav & calendar

`components/SectionNav/` is the shared chrome: a slender flush bar with underline-style active
markers (the member navbar paradigm rebuilt natively in MUI). `SectionNav` links routes,
`ViewToggle` switches a local value; the item lists live next to their surface
(`pages/Events/sections.js`, `pages/Services/sections.js`), so a surface's categories are reachable
from the same bar as the surface itself — the Sidebar's "Service Directory" / "Event Directory"
submenus were flattened to single **Programs** / **Events** entries (`alsoActiveOn` keeps the rail
lit on the categories tab). Services read as "Programs" in copy only; routes are unchanged.

`pages/Events/components/EventCalendar/` + `pages/Events/calendar.util.js` build the month grid from
native `Date` math over CSS grid — **no calendar dependency**. It reads `GET /admin/event/calendar`
(unpaginated, so a day cell shows all of its events). Click a day → `/events/create?date=YYYY-MM-DD`
(CreateEvent prefills the start), an event → its edit page. Each chip shows its registration count
as plain text (a control nested in a `<button>` would be invalid); the roster is one hop further, via
the **Registrants** button on the event's edit page.

## Auth

Login → `loginAdmin()` → `/auth/admin-login` → `accessToken` stored in `localStorage.token` →
redirect `/users`. `ProtectedRoutes.jsx` checks the token; axios 401 interceptor clears it and
redirects to `/login`.

## Data / forms / tables

- **Query:** TanStack Query v5 over `api/*.api.js` functions. Mutations invalidate via
  `queryClient.invalidateQueries()`. Examples: `useUsers(params)`, `useRoleCounts()`,
  `useRoleChange()`, `useUser(id)`.
- **Forms:** react-hook-form + `zodResolver`; `register()` + `Controller`; errors via
  `errors.field?.message`; `react-toastify` on success/error.
- **Tables:** `components/ui/Table/` wraps `react-data-table-component` — server-side pagination,
  selectable rows (custom Checkbox), real-time filters, debounced search (~1000ms), skeleton
  loading. Column defs: `[{ name, cell(row) }]`. Dark-theme styles in
  `components/ui/Table/styles.js`.
- **Lists:** ServiceList has a Status filter + status chips (`pages/Services/serviceStatus.util.js`
  — ACTIVE/INACTIVE/CLOSED labels + colours); both it and EventList link to Registrants and render
  cells as typography (the disabled `TextareaAutosize` cells are gone).

## Styling

MUI v9 (`@mui/material` + `@mui/icons-material`) with Emotion. **No custom `ThemeProvider`** —
styling is MUI defaults + inline `sx` + per-component CSS Modules + global `styles/style.css`.
Palette (applied ad hoc): sidebar `#12001f`, navbar `#111827`, accent `#7c3aed → #c084fc`, bg
`#f6f3ff`, text `#1b1033`. HTML sanitized with `dompurify`.

## Build / run

`npm run dev | build | preview | lint`. Env: `VITE_API_URL` (default `http://localhost:3000`).
