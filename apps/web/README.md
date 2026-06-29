# CommunityFrontendWeb

Frontend project for a community platform built with Next.js.

## Developer

- Bikash Santra
- Kolkata
- santrabikash921@gmail.com
- https://www.linkedin.com/in/bikash-santra-886901217

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Axios
- TanStack Query
- React Hook Form + Zod
- Husky + lint-staged
- Commitlint

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment file

Create `.env.local` and copy from `.env.example`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### 3. Run development server

```bash
pnpm dev
```

App runs on `http://localhost:3000`.

### 4. Build production app

```bash
pnpm build
pnpm start
```

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`

## Project Structure

```text
src
├─ app
├─ components
├─ config
├─ constants
├─ features
├─ hooks
├─ lib
├─ providers
├─ services
├─ styles
└─ types
public
├─ icons
└─ images
```

## Assets

- `public/images` for images and illustrations
- `public/icons` for custom icons and logos
