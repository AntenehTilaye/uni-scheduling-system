import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AssignmentTable } from "@/components/department/assignment-table"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import Link from "next/link"

async function getCourseAssignments(userId: string) {
  const department = await prisma.department.findUnique({
    where: { userId },
  })

  if (!department) {
    throw new Error("Department not found")
  }

  const assignments = await prisma.courseAssignment.findMany({
    where: {
      course: {
        departmentId: department.id,
      },
    },
    include: {
      course: true,
      semester: true,
      section: {
        include: {
          batch: {
            include: {
              program: true,
            },
          },
        },
      },
      group: true,
      teacher: true,
      assistant: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return assignments
}

export default async function AssignmentsPage() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const assignments = await getCourseAssignments(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Assignments</h1>
          <p className="text-muted-foreground">Manage course assignments and instructor allocations</p>
        </div>
        <Button asChild>
          <Link href="/department/assignments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Course Assignments</CardTitle>
          <CardDescription>Course assignments with teacher and section details</CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentTable assignments={assignments} />
        </CardContent>
      </Card>
    </div>
  )
}
