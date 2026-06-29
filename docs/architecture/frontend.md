# Frontend Architecture — CommunityFrontend

Next.js 16 App Router + React 19. See [`../design-system.md`](../design-system.md) for the visual
language and [`../../CommunityFrontend/CLAUDE.md`](../../CommunityFrontend/CLAUDE.md) for the quick reference.

## Routing

Route groups under `src/app/`:

- **`(public)`** — `/`, `about`, `community`, `contact`, `services`, `yucayeke`, plus policy pages
  (cookie/privacy/terms, enrollment). Wrapped in `SiteShell` (PublicNavbar + PublicFooter).
- **`(auth)`** — `sign-in`, `sign-up`.
- **`(protected)`** — `dashboard`, `enrollment/step-1..4`, `my-profile`, `profile`.
- **`api/`** — Next route handlers acting as a BFF (auth, enrollment, events, services, documents,
  profile, consent) that forward to the NestJS backend.

`middleware.ts` (`src/middleware.ts`):
- Protects `/dashboard`, `/my-profile` → redirect to `/sign-in?next=…` if no
  `community_auth_token` cookie.
- Redirects authed users away from `/sign-in`, `/sign-up` → `DEFAULT_POST_LOGIN_PATH`.
- `matcher: ["/dashboard/:path*", "/my-profile/:path*", "/sign-in", "/sign-up"]`.

## Data layer

- `services/http/client.ts` — axios `apiClient` (base `NEXT_PUBLIC_API_BASE_URL`, 300s timeout,
  JSON default headers); `apiConnector<T>()` generic request helper; `getApiErrorMessage()`.
- `services/http/apis.ts` — `endpoints` object grouping all paths (ACCOUNT, AUTH, CONSENT,
  ENROLLMENT, EVENTS, SERVICES, PROFILE, DOCUMENT).
- `services/http/fetcher.ts` — `requestJson` / `requestMultipart` (native fetch wrappers used by
  client code calling the Next `/api/*` routes).
- **TanStack Query** configured in `providers/app-providers.tsx`
  (`refetchOnWindowFocus: false`, `retry: 1`, mutations `retry: 0`). Per-feature hooks in
  `features/*/lib/*-queries.ts` & `*-mutations.ts` with typed query-key objects
  (e.g. `profileQueryKeys.info`).

## Forms

Zod schema + helpers per feature in `features/*/lib/*-form.ts`. Example
(`enrollment-step-one-form.ts`): nested schema (legalName, birthInfo, gender, contact,
current/mailing address, emergencyContact, additionalInfo) with shared validators
(`requiredString`, `requiredDateString`, `createRequiredSelectionSchema`), an
`infer`-ed `FormValues` type, `get…DefaultValues()` (prefill), and `map…FormToPayload()`
(outbound). UI via shadcn `Form/FormField/FormItem/FormLabel/FormControl/FormMessage`.

## Auth

- JWT in `community_auth_token` cookie. Decode helpers + types (`AuthUser`,
  `AuthLoginRequest`, `AuthSessionResponse`) in `src/lib/auth.ts`.
- Server session: `src/lib/auth-session.ts` — `getSessionUser()` (`React.cache`),
  `getRequiredSessionUser()` (redirects to sign-in).
- Login flow: form → `/api/auth/login` → `{ accessToken }` → cookie set → middleware unlocks
  protected routes.

## Build / run

`npm run dev | build | start | typecheck | lint | format`. Env: `NEXT_PUBLIC_API_BASE_URL`
(validated in `src/config/env.ts`). `next.config.ts` sets `allowedDevOrigins`.
