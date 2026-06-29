# communityAdminPanel — admin dashboard

Vite 6 + React 19 (**JS, not TS**), MUI v9 + Emotion, react-router-dom v7, TanStack Query, axios,
react-hook-form + Zod, react-data-table-component, react-toastify. Full map:
[`../docs/architecture/admin-panel.md`](../docs/architecture/admin-panel.md).

> ⚠️ This app has its **own dark purple/blue design system** — distinct from CommunityFrontend.
> Do not import or mirror the frontend's tokens/components here.

## Layout

```
src/
  api/            # client.js (axios) + per-resource *.api.js (auth, user, enrollment,
                  #   event, eventCat, service, serviceCat, consent, culturalConnection, account)
  routes/         # AppRoutes.jsx, ProtectedRoutes.jsx
  layouts/        # AdminLayout (Sidebar + Navbar + <Outlet/>)
  pages/          # Login, Users, Enrollments, Services, Events, Consents,
                  #   CulturalConnections, ServiceCategories, EventCategories, Dashboard
  components/     # Navbar, Sidebar, StatCard, ui/Table (rdt wrapper), ui/Checkbox
  hooks/          # useDebounceState, useDebouncedFunction, useSearch, useThrottle
  utils/  styles/style.css  main.jsx
```

Vite aliases: `@`, `@components`, `@pages`, `@hooks`, `@utils`, `@assets`, `@theme`.

## Conventions

- **Routing:** `routes/AppRoutes.jsx`; everything except `/login` is wrapped in
  `ProtectedRoutes.jsx` (checks `localStorage.token`, else redirect `/login`). Resource pages
  follow `list / create / edit/:id`.
- **Auth:** login → `/auth/admin-login` → `accessToken` saved to `localStorage` as `token`.
  `api/client.js` axios interceptor adds `Authorization: Bearer <token>` and on **401** clears the
  token + redirects to `/login`. Base URL `VITE_API_URL`.
- **Data:** per-resource `*.api.js` functions wrapped in TanStack Query hooks; invalidate with
  `queryClient.invalidateQueries()` after mutations.
- **Forms:** react-hook-form + `zodResolver`; `register()` for simple inputs, `Controller` for MUI
  Select etc. Toasts via `react-toastify` (`toast.success/error`).
- **Tables:** custom wrapper in `components/ui/Table/` around `react-data-table-component` —
  server-side pagination, selectable rows, debounced search (`useDebounceState`, ~1000ms),
  skeleton loading. Dark-theme styles in `components/ui/Table/styles.js`.
- **Styling:** MUI defaults + **inline `sx`** + per-component CSS Modules (`*.module.css`).
  No custom MUI `ThemeProvider` — colors are applied ad hoc (sidebar `#12001f`, navbar `#111827`,
  accent purple `#7c3aed → #c084fc`, bg `#f6f3ff`). Sanitize any HTML with `dompurify`.

## Run

```bash
npm run dev       # vite
npm run build
npm run preview
npm run lint
```

Env: `VITE_API_URL` (default `http://localhost:3000`). Copy `.env.copy → .env`.
