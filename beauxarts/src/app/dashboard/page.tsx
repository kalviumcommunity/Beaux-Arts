export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-4xl font-bold text-slate-900">Dashboard</h1>
        <div className="mb-6 inline-flex items-center rounded-lg bg-emerald-50 px-4 py-2 text-emerald-700 font-semibold">
          🔒 Protected Route
        </div>
        <p className="mb-8 text-lg text-slate-600 leading-relaxed">
          This page is only accessible to authenticated users. You have successfully logged in!
        </p>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <p className="mb-3 text-slate-700">
            <span className="font-semibold">Authentication Status:</span> <span className="text-emerald-600">✓ Verified</span>
          </p>
          <p className="text-slate-700">
            <span className="font-semibold">Access Level:</span> <span className="text-blue-600">Full Dashboard Access</span>
          </p>
        </div>
      </div>
    </div>
  );
}
