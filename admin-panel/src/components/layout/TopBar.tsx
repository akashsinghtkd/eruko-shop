"use client";

import Link from "next/link";

interface TopBarProps {
  user?: { email?: string; id?: string } | null;
  onLogout?: () => void;
}

export function TopBar({ user, onLogout }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">E-commerce Admin</span>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-slate-600">{user.email}</span>
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Logout
              </Link>
            )}
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
