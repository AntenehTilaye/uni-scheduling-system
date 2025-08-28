import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TimeSlotTable } from "@/components/college/time-slot-table"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-utils"
import Link from "next/link"

async function getTimeSlots(userId: string) {
  const college = await prisma.college.findUnique({
    where: { userId },
    include: {
      timeSlots: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  })

  if (!college) {
    throw new Error("College not found")
  }

  return college.timeSlots
}

export default async function TimeSlotsPage() {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not found")

  const timeSlots = await getTimeSlots(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Time Slots</h1>
          <p className="text-muted-foreground">Manage your college's time slots for scheduling</p>
        </div>
        <Button asChild>
          <Link href="/college/time-slots/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Time Slot
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Time Slots</CardTitle>
          <CardDescription>Configure when classes can be scheduled throughout the week</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSlotTable timeSlots={timeSlots} />
        </CardContent>
      </Card>
    </div>
  )
}
