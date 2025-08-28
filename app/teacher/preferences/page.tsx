import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PreferenceOverview } from "@/components/teacher/preference-overview"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import Link from "next/link"
import { Clock, MapPin, Plus } from "lucide-react"

async function getPreferences(userId: string) {
  const preferences = await prisma.preference.findMany({
    where: { userId },
    include: {
      timeSlot: true,
      room: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return preferences
}

export default async function PreferencesPage() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const preferences = await getPreferences(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Preferences</h1>
          <p className="text-muted-foreground">Manage your teaching preferences for better scheduling</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Time Preferences</span>
            </CardTitle>
            <CardDescription>Set your preferred time slots for teaching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {preferences.filter((p) => p.type === "TIME_SLOT").length} time preferences set
              </div>
              <Button asChild className="w-full">
                <Link href="/teacher/preferences/time">
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Time Preferences
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Room Preferences</span>
            </CardTitle>
            <CardDescription>Set your preferred rooms and room types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {preferences.filter((p) => p.type === "ROOM").length} room preferences set
              </div>
              <Button asChild className="w-full">
                <Link href="/teacher/preferences/rooms">
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Room Preferences
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Preferences</CardTitle>
          <CardDescription>Overview of all your current preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceOverview preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  )
}
