import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const roleRoutes: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ["/admin", "/college", "/department", "/teacher", "/assistant", "/dashboard"],
    [UserRole.COLLEGE]: ["/college", "/dashboard"],
    [UserRole.DEPARTMENT]: ["/department", "/dashboard"],
    [UserRole.TEACHER]: ["/teacher", "/dashboard"],
    [UserRole.ASSISTANT]: ["/assistant", "/dashboard"],
  }

  return roleRoutes[userRole]?.some((allowedRoute) => route.startsWith(allowedRoute)) || false
}
