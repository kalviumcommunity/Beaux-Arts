export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-slate-900">Welcome to Beaux Arts</h1>
        <p className="mb-4 text-xl text-slate-600 leading-relaxed">
          This is a modern Next.js 13+ application with App Router, authentication, and dynamic routing.
        </p>
        <p className="text-xl text-slate-600 leading-relaxed">
          Navigate using the links in the navbar to explore the application.
        </p>
      </div>
    </div>
  );
}
