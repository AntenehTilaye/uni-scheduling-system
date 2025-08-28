import type React from "react"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { AssistantSidebar } from "@/components/assistant/assistant-sidebar"

export default async function AssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole([UserRole.ASSISTANT, UserRole.ADMIN])

  return (
    <div className="flex h-screen bg-background">
      <AssistantSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
