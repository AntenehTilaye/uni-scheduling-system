import type React from "react"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { DepartmentSidebar } from "@/components/department/department-sidebar"

export default async function DepartmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole([UserRole.DEPARTMENT, UserRole.ADMIN])

  return (
    <div className="flex h-screen bg-background">
      <DepartmentSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
