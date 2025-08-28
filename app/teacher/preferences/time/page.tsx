import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimePreferenceManager } from "@/components/teacher/time-preference-manager"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"

async function getTimeSlots() {
  // Get all time slots from all colleges for now
  // In a real app, you might want to filter by the teacher's college
  const timeSlots = await prisma.timeSlot.findMany({
    include: {
      college: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })

  return timeSlots
}

async function getTimePreferences(userId: string) {
  const preferences = await prisma.preference.findMany({
    where: {
      userId,
      type: "TIME_SLOT",
    },
    include: {
      timeSlot: true,
    },
  })

  return preferences
}

export default async function TimePreferencesPage() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const [timeSlots, preferences] = await Promise.all([getTimeSlots(), getTimePreferences(user.id)])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Time Preferences</h1>
        <p className="text-muted-foreground">Set your preferred time slots for teaching</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Time Slot Preferences</CardTitle>
          <CardDescription>
            Select your preference level for each time slot. This helps the scheduling system assign you classes at
            times that work best for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimePreferenceManager timeSlots={timeSlots} preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  )
}
