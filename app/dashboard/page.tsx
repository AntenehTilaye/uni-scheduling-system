import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case UserRole.ADMIN:
      redirect("/admin")
    case UserRole.COLLEGE:
      redirect("/college")
    case UserRole.DEPARTMENT:
      redirect("/department")
    case UserRole.TEACHER:
      redirect("/teacher")
    case UserRole.ASSISTANT:
      redirect("/assistant")
    default:
      redirect("/auth/signin")
  }
}
