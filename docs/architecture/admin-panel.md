# Admin Panel Architecture — apps/admin

Vite 6 + React 19 (plain **JS/JSX**), MUI v9. See
[`../../apps/admin/CLAUDE.md`](../../apps/admin/CLAUDE.md) for the quick reference.

## Layout (`src/`)

| Path | Responsibility |
|------|----------------|
| `main.jsx` | Entry; `BrowserRouter`, `QueryClientProvider`, `ToastContainer` |
| `api/client.js` | axios instance (base `VITE_API_URL`); request interceptor adds bearer, response interceptor redirects on 401 |
| `api/*.api.js` | per-resource calls: auth, user, enrollment, event, eventCat, service, serviceCat, consent, culturalConnection, account |
| `routes/AppRoutes.jsx` | route table |
| `routes/ProtectedRoutes.jsx` | localStorage `token` guard |
| `layouts/AdminLayout/` | Sidebar + Navbar + `<Outlet/>` |
| `pages/` | Login, Users, Enrollments, Services, Events, Consents, CulturalConnections, ServiceCategories, EventCategories, Dashboard |
| `components/` | Navbar, Sidebar, StatCard, `ui/Table` (rdt wrapper), `ui/Checkbox` |
| `hooks/` | useDebounceState, useDebouncedFunction, useSearch, useThrottle |

Vite aliases: `@`, `@components`, `@pages`, `@hooks`, `@utils`, `@assets`, `@theme`.

## Routing

`/login` is public; everything else is under `ProtectedRoutes` → `AdminLayout`. Index `/`
redirects to `/users`. Resource pages follow `list / create / edit/:id`:

- `/users`, `/enrollments/{all,submitted,approved,rejected,approval/:id}`
- `/cultural-connections`, `/consents`, `/services`, `/service-categories`,
  `/events`, `/event-categories` (each with create + edit/:id).

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

## Styling

MUI v9 (`@mui/material` + `@mui/icons-material`) with Emotion. **No custom `ThemeProvider`** —
styling is MUI defaults + inline `sx` + per-component CSS Modules + global `styles/style.css`.
Palette (applied ad hoc): sidebar `#12001f`, navbar `#111827`, accent `#7c3aed → #c084fc`, bg
`#f6f3ff`, text `#1b1033`. HTML sanitized with `dompurify`.

## Build / run

`npm run dev | build | preview | lint`. Env: `VITE_API_URL` (default `http://localhost:3000`).
