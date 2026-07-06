# apps/admin — admin dashboard

Vite 6 + React 19 (**JS, not TS**), MUI v9 + Emotion, react-router-dom v7, TanStack Query, axios,
react-hook-form + Zod, react-data-table-component, react-toastify. Full map:
[`../../docs/architecture/admin-panel.md`](../../docs/architecture/admin-panel.md).

> ⚠️ This app shares the **azul-flag palette** with apps/web but keeps its own
> **deep-azul-chrome-over-light-content** structure (MUI-driven). Do not import or mirror
> apps/web's tokens/components here. See [`../../docs/design-system-admin.md`](../../docs/design-system-admin.md).

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
  Central MUI theme in `src/theme/theme.js` (azul primary `#0a56a8`, celeste `#4ea6dc`, flag-red
  error `#c42032`, light bg `#f6f8fa`) + `--admin-*` CSS vars in `styles/style.css` (chrome
  `#0a2540`). Prefer `color="primary|secondary|error"` / `var(--admin-*)` over hardcoded hexes.
  Sanitize any HTML with `dompurify`.

## Run

```bash
pnpm dev       # vite
pnpm build
pnpm preview
pnpm lint
```

Env: `VITE_API_URL` (default `http://localhost:3000`). Copy `.env.copy → .env`.
