import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-5xl font-bold text-red-600">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Page Not Found</h2>
        <p className="mb-8 text-slate-600 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-slate-800"
        >
          ← Go back to home
        </Link>
      </div>
    </div>
  );
}
