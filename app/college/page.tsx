import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import { Clock, Building2, BookOpen, MapPin } from "lucide-react"

async function getCollegeStats(userId: string) {
  const college = await prisma.college.findUnique({
    where: { userId },
    include: {
      departments: true,
      buildings: {
        include: {
          rooms: true,
        },
      },
      timeSlots: true,
    },
  })

  if (!college) {
    throw new Error("College not found")
  }

  const totalRooms = college.buildings.reduce((acc, building) => acc + building.rooms.length, 0)

  return {
    college,
    departments: college.departments.length,
    buildings: college.buildings.length,
    rooms: totalRooms,
    timeSlots: college.timeSlots.length,
  }
}

export default async function CollegeDashboard() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const stats = await getCollegeStats(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">College Dashboard</h1>
        <p className="text-muted-foreground">Welcome to {stats.college.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buildings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.buildings}</div>
            <p className="text-xs text-muted-foreground">Campus buildings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rooms}</div>
            <p className="text-xs text-muted-foreground">Available rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.timeSlots}</div>
            <p className="text-xs text-muted-foreground">Configured slots</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule Overview</CardTitle>
            <CardDescription>Time slots distribution across the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
                const daySlots = stats.college.timeSlots.filter((slot) => slot.dayOfWeek === index + 1)
                return (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day}</span>
                    <span className="text-sm text-muted-foreground">{daySlots.length} slots</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common college management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Manage Time Slots</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Go →</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Add Building</span>
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
