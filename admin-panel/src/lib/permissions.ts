/**
 * Backend permission strings. Use these to guard UI and match API guards.
 * Format: resource.action (e.g. products.read, products.write)
 */
export const PERMISSIONS = {
  brands: { read: "brands.read", write: "brands.write" },
  categories: { read: "categories.read", write: "categories.write" },
  products: { read: "products.read", write: "products.write" },
  variants: { read: "variants.read", write: "variants.write" },
  inventory: { read: "inventory.read", adjust: "inventory.adjust" },
  media: { read: "media.read", write: "media.write" },
  users: { read: "users.read", write: "users.write" },
  roles: { read: "roles.read", write: "roles.write" },
  permissions: { read: "permissions.read" },
  reviews: { read: "reviews.read", moderate: "reviews.moderate" },
  settings: { read: "settings.read", manage: "settings.manage" },
  audit_logs: { read: "audit_logs.read" },
} as const;

export function hasPermission(
  userPermissions: string[] | undefined,
  permission: string
): boolean {
  // No permissions from backend (e.g. /auth/me not populated yet) → allow (API will enforce)
  if (!userPermissions || !Array.isArray(userPermissions)) return true;
  if (userPermissions.includes("super_admin") || userPermissions.includes("*")) return true;
  return userPermissions.includes(permission);
}

export function canRead(userPermissions: string[] | undefined, resource: keyof typeof PERMISSIONS): boolean {
  const perms = PERMISSIONS[resource];
  if (!perms || !("read" in perms)) return true;
  return hasPermission(userPermissions, (perms as { read: string }).read);
}

export function canWrite(userPermissions: string[] | undefined, resource: keyof typeof PERMISSIONS): boolean {
  const perms = PERMISSIONS[resource];
  if (!perms) return false;
  const writeKey = "write" in perms ? "write" : "manage" in perms ? "manage" : "adjust";
  return hasPermission(userPermissions, (perms as Record<string, string>)[writeKey]);
}
