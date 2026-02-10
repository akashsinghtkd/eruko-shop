"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/lib/auth/AuthContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-56">
        <TopBar user={user} onLogout={logout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
