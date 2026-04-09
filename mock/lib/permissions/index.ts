import { navigationByRole, roleProfiles } from "@/lib/mocks/navigation";
import { NavItem, UserRole } from "@/lib/types";

export function getRoleNavigation(role: UserRole): NavItem[] {
  return navigationByRole[role];
}

export function getRoleProfile(role: UserRole) {
  return roleProfiles[role];
}

export function getRoleHome(role: UserRole) {
  return roleProfiles[role].homeHref;
}

export function canAccessPath(role: UserRole, pathname: string) {
  const allowedPrefix = `/${role}`;
  return pathname.startsWith(allowedPrefix);
}
