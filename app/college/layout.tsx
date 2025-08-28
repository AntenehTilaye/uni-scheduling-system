import type React from "react"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { CollegeSidebar } from "@/components/college/college-sidebar"

export default async function CollegeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole([UserRole.COLLEGE, UserRole.ADMIN])

  return (
    <div className="flex h-screen bg-background">
      <CollegeSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
