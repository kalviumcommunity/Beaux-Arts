# Beaux-Arts

Beaux-Arts is an online marketplace to help tribal and rural artists sell their work directly to buyers, reducing exploitation by middlemen and helping artists retain more value.

## Problem statement & Solution Overview

Traditional and tribal art is disappearing because the people who hold this knowledge are forced to leave it for survival, and middlemen capture most of the value when they do try to sell. Tribal and rural artists often earn very little because middlemen capture most of the value and buyers cannot easily discover authentic work or pay artists directly.

We built a website (marketplace) where local artists can list artworks and buyers can purchase directly. The platform charges a small fixed fee (4%) to sustain the service while keeping most proceeds with the artist.

## Folder structure

- `beauxarts/` — frontend app source and configuration.
  - `app/` — Next.js App Router pages and server components (layout, global CSS, top-level pages, and `api/` routes).
  - `components/` — Reusable React components (cards, forms, nav, modals).
  - `lib/` — Utilities, client wrappers, and shared helpers (API clients, validation, constants).
  - `public/` — Static assets (images, icons, favicon).
  - `next.config.ts`, `tsconfig.json`, `package.json` — Next and TypeScript config and scripts.
- Root files — top-level README, contribution notes, and tooling configuration.

If your tree differs (e.g., API backend in another folder or a separate service), extend this section accordingly.

## Setup (Development)

Prerequisites: Node.js (LTS) and npm or pnpm installed.

1. Install dependencies

```bash
npm install
# or
pnpm install
```

2. Local development

```bash
npm run dev
# or
pnpm dev
```

3. Build for production

```bash
npm run build
npm run start
```

If you connect to a database or external services, create a `.env.local` with the required environment variables (e.g. `DATABASE_URL`, `NEXT_PUBLIC_API_URL`) before running.







## Next steps

- Convert this repo into a full Next.js app (if not already): add or confirm `package.json` scripts (`dev`, `build`, `start`), install Next dependencies, and scaffold app pages.
- Want me to help convert this repository into a Next.js app in-place (no extra folder)? I can add the required files and update `package.json` for you — say "Yes, convert" and I'll proceed.



---

Updated: December 15, 2025
