import type React from "react"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole([UserRole.TEACHER, UserRole.ADMIN])

  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
