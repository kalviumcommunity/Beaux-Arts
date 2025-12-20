import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beaux Arts",
  description: "Beaux Arts Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <nav className="sticky top-0 z-50 bg-slate-900 shadow-md">
          <div className="mx-auto max-w-5xl px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Beaux Arts</h1>
              <ul className="flex gap-8">
                <li>
                  <Link
                    href="/"
                    className="text-white transition-colors duration-200 hover:text-slate-300 font-medium"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-white transition-colors duration-200 hover:text-slate-300 font-medium"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-white transition-colors duration-200 hover:text-slate-300 font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users/1"
                    className="text-white transition-colors duration-200 hover:text-slate-300 font-medium"
                  >
                    User 1
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
      </body>
    </html>
  );
}
