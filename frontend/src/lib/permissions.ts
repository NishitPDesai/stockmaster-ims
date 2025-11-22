import { User } from "@/types";

export type Permission =
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "operations.create"
  | "operations.edit"
  | "operations.delete"
  | "operations.validate"
  | "operations.complete"
  | "operations.cancel"
  | "warehouses.create"
  | "warehouses.edit"
  | "warehouses.delete"
  | "locations.create"
  | "locations.edit"
  | "locations.delete"
  | "settings.access"
  | "reports.view"
  | "users.manage";

const rolePermissions: Record<string, Permission[]> = {
  MANAGER: [
    "products.create",
    "products.edit",
    "products.delete",
    "operations.create",
    "operations.edit",
    "operations.delete",
    "operations.validate",
    "operations.complete",
    "operations.cancel",
    "warehouses.create",
    "warehouses.edit",
    "warehouses.delete",
    "locations.create",
    "locations.edit",
    "locations.delete",
    "settings.access",
    "reports.view",
    "users.manage",
  ],
  STAFF: [
    "products.create",
    "products.edit",
    "operations.create",
    "operations.edit",
    "operations.validate",
    "operations.complete",
    "warehouses.create",
    "warehouses.edit",
    "locations.create",
    "locations.edit",
    "reports.view",
  ],
};

export function hasPermission(
  user: User | null,
  permission: Permission
): boolean {
  if (!user || !user.role) return false;
  const permissions = rolePermissions[user.role] || [];
  return permissions.includes(permission);
}

export function canDelete(
  user: User | null,
  entity: "product" | "operation" | "warehouse" | "location"
): boolean {
  return hasPermission(user, `${entity}s.delete` as Permission);
}

export function canEdit(
  user: User | null,
  entity: "product" | "operation" | "warehouse" | "location"
): boolean {
  return hasPermission(user, `${entity}s.edit` as Permission);
}

export function canAccessSettings(user: User | null): boolean {
  return hasPermission(user, "settings.access");
}
