This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Use `.env.local` for your real, local credentials and keep it out of git. Use `.env.example` as the template for required variables.

### Variables and Purpose
- **`DATABASE_URL`**: Server-only. Database connection string for server-side operations.
- **`JWT_SECRET`**: Server-only. Secret for signing/validating tokens.
- **`STRIPE_SECRET_KEY`**: Server-only. Private payment API key.
- **`NEXT_PUBLIC_API_BASE_URL`**: Client-safe. Base URL for browser API calls.
- **`NEXT_PUBLIC_ANALYTICS_KEY`**: Client-safe. Public analytics key.
- **`FEATURE_ENABLE_EXPERIMENTAL`**: Server-only flag for feature toggles.

### Client vs Server Access
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
- All other variables are available only on the server (Route Handlers, Server Components, API routes, server utilities).

### Setup
1. Copy the template and fill values:
	 ```bash
	 cp .env.example .env.local
	 ```
2. Start the dev server. Next.js will load `.env.local` automatically.
3. For production, set environment variables in your hosting provider (e.g., Vercel project settings). Do not commit secrets.

### Safe Usage Examples

Server-side (Server Component, Route Handler, or server utility):
```ts
// app/api/health/route.ts (server-only context)
export async function GET() {
	const dbUrl = process.env.DATABASE_URL; // server-side only
	const enabled = process.env.FEATURE_ENABLE_EXPERIMENTAL === 'true';
	return Response.json({ ok: true, enabled, hasDb: Boolean(dbUrl) });
}
```

Client-side (Client Component):
```tsx
"use client";
// app/components/ApiBaseInfo.tsx
export default function ApiBaseInfo() {
	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // safe for client
	return <small>API base: {apiUrl}</small>;
}
```

### Common Pitfalls Avoided
- Secrets are never placed in variables without the `NEXT_PUBLIC_` prefix when used in client code.
- Avoid reading server-only envs inside Client Components or React hooks.
- Understand build vs runtime: changing envs may require a restart/rebuild.
- `.env.local` is git-ignored; only `.env.example` is tracked.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
