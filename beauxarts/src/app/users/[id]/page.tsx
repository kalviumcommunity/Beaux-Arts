import Link from "next/link";

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock user data
  const mockUsers: Record<string, string> = {
    "1": "Alice Johnson",
    "2": "Bob Smith",
    "3": "Charlie Brown",
    "4": "Diana Prince",
  };

  const userName =
    mockUsers[id] || `User ${id}`;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">User {id}</span>
        </nav>

        {/* User Card */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-8 text-4xl font-bold text-slate-900">User Profile</h1>

          {/* User ID */}
          <div className="mb-6 rounded-lg bg-slate-50 p-6 border border-slate-200">
            <p className="text-sm font-semibold uppercase text-slate-600 mb-2">User ID</p>
            <p className="text-3xl font-bold text-slate-900">{id}</p>
          </div>

          {/* User Name */}
          <div className="mb-6 rounded-lg bg-slate-50 p-6 border border-slate-200">
            <p className="text-sm font-semibold uppercase text-slate-600 mb-2">Name</p>
            <p className="text-3xl font-bold text-slate-900">{userName}</p>
          </div>

          {/* Info Message */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-slate-700">
              ✓ This is a dynamic route example using [id] parameter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
