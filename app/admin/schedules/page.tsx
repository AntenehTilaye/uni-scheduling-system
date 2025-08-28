import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduleGenerator } from "@/components/admin/schedule-generator"
import { ScheduleViewer } from "@/components/admin/schedule-viewer"
import { prisma } from "@/lib/prisma"
import { Calendar, Play } from "lucide-react"

async function getSemesters() {
  return await prisma.semester.findMany({
    orderBy: { startDate: "desc" },
  })
}

async function getScheduleStats() {
  const currentSemester = await prisma.semester.findFirst({
    where: { isActive: true },
  })

  if (!currentSemester) {
    return { totalSchedules: 0, totalAssignments: 0, scheduledPercentage: 0 }
  }

  const [totalSchedules, totalAssignments] = await Promise.all([
    prisma.schedule.count({
      where: { semesterId: currentSemester.id },
    }),
    prisma.courseAssignment.count({
      where: { semesterId: currentSemester.id },
    }),
  ])

  const scheduledPercentage = totalAssignments > 0 ? Math.round((totalSchedules / totalAssignments) * 100) : 0

  return { totalSchedules, totalAssignments, scheduledPercentage }
}

export default async function SchedulesPage() {
  const [semesters, stats] = await Promise.all([getSemesters(), getScheduleStats()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground">Generate and manage university schedules</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Assignments</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Need scheduling</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledPercentage}%</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Generator</CardTitle>
            <CardDescription>Generate schedules automatically using AI-powered optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleGenerator semesters={semesters} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Viewer</CardTitle>
            <CardDescription>View and manage existing schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleViewer semesters={semesters} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
