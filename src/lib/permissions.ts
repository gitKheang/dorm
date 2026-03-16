import type { UserRole } from "@/types/domain";

export function hasRoleAccess(role: UserRole | null | undefined, allowedRoles: UserRole[]) {
  if (!role) return false;
  return allowedRoles.includes(role);
}
