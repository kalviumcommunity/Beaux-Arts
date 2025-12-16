export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const enabled = process.env.FEATURE_ENABLE_EXPERIMENTAL === 'true';
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  return Response.json({
    ok: true,
    hasDb: Boolean(dbUrl),
    enabled,
    // This is safe to echo because it's NEXT_PUBLIC_
    publicApiBase: apiBase ?? null,
  });
}
