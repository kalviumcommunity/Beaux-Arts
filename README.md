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




## Linting & Formatting

This project uses ESLint and Prettier to keep code quality high and maintain a consistent coding style.

What we use and where:

- **ESLint:** configured in `eslint.config.mjs` using `eslint-config-next` (core-web-vitals preset) and `eslint-config-next/typescript`. These give Next.js and TypeScript specific rules and performance-focused best practices.
- **Prettier:** configured in `.prettierrc` to keep formatting consistent across editors and environments.
- **Integration:** `eslint-config-prettier` and `eslint-plugin-prettier` are included to avoid rule conflicts between ESLint and Prettier.

Why these choices matter:

- `eslint-config-next` enforces Next.js best practices and accessibility/performance rules (e.g., image usage, link semantics).
- TypeScript ESLint rules help catch type-related mistakes and enforce safe patterns early.
- Prettier ensures a single source of truth for formatting (no style bikeshedding in PRs).
- Running automated fixes on staged files prevents malformed commits and keeps the repo clean.

Quick commands

- Run ESLint across the app:

```bash
npm run lint
# or
npx eslint src --ext .ts,.tsx,.js,.jsx
```

- Check Prettier formatting:

```bash
npx prettier --check "src/**/*.{ts,tsx,js,jsx,css}"
```

Recommended `lint-staged` setup (add to top-level `package.json`):

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"]
}
```

Add a Husky pre-commit hook to run `lint-staged` automatically when committing:

```bash
cd /Users/admin/Desktop/Beaux-Arts
npx husky add .husky/pre-commit "npx --no-install lint-staged"
```

Linting in action (example logs)

- Prettier check output:

```
Checking formatting...
All matched files use Prettier code style!
```



I

---

Updated: December 15, 2025
