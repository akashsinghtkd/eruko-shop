"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { canRead, PERMISSIONS } from "@/lib/permissions";

type PermKey = keyof typeof PERMISSIONS;

const navSections: Array<
  | { label: string; href: string; permission?: PermKey }
  | { label: string; items: Array<{ label: string; href: string; permission?: PermKey }> }
> = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Catalog",
    items: [
      { label: "Brands", href: "/catalog/brands", permission: "brands" },
      { label: "Categories", href: "/catalog/categories", permission: "categories" },
      { label: "Products", href: "/catalog/products", permission: "products" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Inventory", href: "/inventory", permission: "inventory" },
      { label: "Warehouses", href: "/inventory/warehouses", permission: "inventory" },
    ],
  },
  { label: "Media", href: "/media", permission: "media" },
  {
    label: "Users & Roles",
    items: [
      { label: "Users", href: "/users", permission: "users" },
      { label: "Roles", href: "/users/roles", permission: "roles" },
    ],
  },
  { label: "Reviews", href: "/reviews", permission: "reviews" },
  { label: "Settings", href: "/settings", permission: "settings" },
  { label: "Audit Logs", href: "/audit-logs", permission: "audit_logs" },
];

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "bg-slate-600 text-white"
          : "text-slate-300 hover:bg-slate-600/70 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const permissions = useAuth().user?.permissions;

  const showItem = (permission?: PermKey) => {
    if (!permission) return true;
    return canRead(permissions, permission);
  };

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-56 border-r border-slate-700 bg-slate-800">
      <div className="flex h-14 items-center border-b border-slate-700 px-4">
        <Link href="/dashboard" className="text-lg font-semibold text-white">
          Admin Panel
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navSections.map((section) =>
          "href" in section ? (
            showItem(section.permission) ? (
              <NavLink
                key={section.href}
                href={section.href}
                active={pathname === section.href}
              >
                {section.label}
              </NavLink>
            ) : null
          ) : (() => {
              const visibleItems = section.items.filter((item) => showItem(item.permission));
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label}>
                  <p className="mb-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        active={pathname === item.href}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })()
        )}
      </nav>
    </aside>
  );
}
