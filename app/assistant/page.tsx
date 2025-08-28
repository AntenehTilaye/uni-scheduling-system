import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import { BookOpen, Heart, Clock, Calendar } from "lucide-react"

async function getAssistantStats(userId: string) {
  // Get current semester
  const currentSemester = await prisma.semester.findFirst({
    where: { isActive: true },
  })

  // Get assistant's course assignments
  const courseAssignments = currentSemester
    ? await prisma.courseAssignment.findMany({
        where: {
          assistantId: userId,
          semesterId: currentSemester.id,
        },
        include: {
          course: true,
          teacher: true,
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
        },
      })
    : []

  // Get assistant's preferences
  const preferences = await prisma.preference.findMany({
    where: { userId },
    include: {
      timeSlot: true,
      room: true,
    },
  })

  return {
    courseAssignments: courseAssignments.length,
    preferences: preferences.length,
    timePreferences: preferences.filter((p) => p.type === "TIME_SLOT").length,
    roomPreferences: preferences.filter((p) => p.type === "ROOM").length,
    recentAssignments: courseAssignments.slice(0, 3),
  }
}

export default async function AssistantDashboard() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const stats = await getAssistantStats(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assistant Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assisting Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseAssignments}</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferences</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.preferences}</div>
            <p className="text-xs text-muted-foreground">Total preferences set</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.timePreferences}</div>
            <p className="text-xs text-muted-foreground">Time preferences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Prefs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roomPreferences}</div>
            <p className="text-xs text-muted-foreground">Room preferences</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Course Assignments</CardTitle>
            <CardDescription>Courses you're assisting with this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentAssignments.length > 0 ? (
                stats.recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center space-x-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{assignment.course.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.course.code} • {assignment.course.type}
                        {assignment.teacher && <span> • with {assignment.teacher.name}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No course assignments for current semester</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Set Time Preferences</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Room Preferences</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">View My Schedule</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
