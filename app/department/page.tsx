import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import { BookOpen, Users, GraduationCap, UserCheck } from "lucide-react"

async function getDepartmentStats(userId: string) {
  const department = await prisma.department.findUnique({
    where: { userId },
    include: {
      courses: true,
      programs: {
        include: {
          batches: {
            include: {
              sections: true,
            },
          },
        },
      },
    },
  })

  if (!department) {
    throw new Error("Department not found")
  }

  // Get course assignments for current semester
  const currentSemester = await prisma.semester.findFirst({
    where: { isActive: true },
  })

  const courseAssignments = currentSemester
    ? await prisma.courseAssignment.findMany({
        where: {
          semesterId: currentSemester.id,
          course: {
            departmentId: department.id,
          },
        },
        include: {
          teacher: true,
          assistant: true,
        },
      })
    : []

  // Get teachers assigned to department courses
  const teacherIds = courseAssignments.map((ca) => ca.teacherId).filter(Boolean) as string[]
  const teachers = await prisma.user.findMany({
    where: {
      id: { in: teacherIds },
      role: "TEACHER",
    },
  })

  const totalSections = department.programs.reduce(
    (acc, program) => acc + program.batches.reduce((batchAcc, batch) => batchAcc + batch.sections.length, 0),
    0,
  )

  return {
    department,
    courses: department.courses.length,
    programs: department.programs.length,
    sections: totalSections,
    courseAssignments: courseAssignments.length,
    teachers: teachers.length,
  }
}

export default async function DepartmentDashboard() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const stats = await getDepartmentStats(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Department Dashboard</h1>
        <p className="text-muted-foreground">Welcome to {stats.department.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">Department courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.programs}</div>
            <p className="text-xs text-muted-foreground">Academic programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sections}</div>
            <p className="text-xs text-muted-foreground">Student sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseAssignments}</div>
            <p className="text-xs text-muted-foreground">Course assignments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Distribution</CardTitle>
            <CardDescription>Courses by type in your department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theory Courses</span>
                <span className="text-sm text-muted-foreground">
                  {stats.department.courses.filter((c) => c.type === "THEORY").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lab Courses</span>
                <span className="text-sm text-muted-foreground">
                  {stats.department.courses.filter((c) => c.type === "LAB").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tutorial Courses</span>
                <span className="text-sm text-muted-foreground">
                  {stats.department.courses.filter((c) => c.type === "TUTORIAL").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common department management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Add New Course</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Assign Teachers</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">View Schedules</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
