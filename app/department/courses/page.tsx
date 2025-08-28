import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CourseTable } from "@/components/department/course-table"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import Link from "next/link"

async function getCourses(userId: string) {
  const department = await prisma.department.findUnique({
    where: { userId },
    include: {
      courses: {
        include: {
          assignments: {
            include: {
              teacher: true,
              assistant: true,
              semester: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!department) {
    throw new Error("Department not found")
  }

  return department.courses
}

export default async function CoursesPage() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const courses = await getCourses(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your department's courses</p>
        </div>
        <Button asChild>
          <Link href="/department/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>A list of all courses offered by your department</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseTable courses={courses} />
        </CardContent>
      </Card>
    </div>
  )
}
