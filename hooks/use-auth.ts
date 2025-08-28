"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    role: session?.user?.role,
    hasRole: (allowedRoles: UserRole[]) => {
      if (!session?.user?.role) return false
      return allowedRoles.includes(session.user.role)
    },
    isAdmin: session?.user?.role === UserRole.ADMIN,
    isCollege: session?.user?.role === UserRole.COLLEGE,
    isDepartment: session?.user?.role === UserRole.DEPARTMENT,
    isTeacher: session?.user?.role === UserRole.TEACHER,
    isAssistant: session?.user?.role === UserRole.ASSISTANT,
  }
}
