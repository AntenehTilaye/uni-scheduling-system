import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSemesterSchedule } from "@/lib/scheduler"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { semesterId } = body

    if (!semesterId) {
      return NextResponse.json({ error: "Semester ID is required" }, { status: 400 })
    }

    // Verify semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    })

    if (!semester) {
      return NextResponse.json({ error: "Semester not found" }, { status: 404 })
    }

    // Generate schedules
    const result = await generateSemesterSchedule(semesterId)

    // Save successful schedules to database
    const scheduleData = result.schedules.map((schedule) => ({
      courseAssignmentId: schedule.assignmentId,
      timeSlotId: schedule.timeSlotId,
      roomId: schedule.roomId,
      semesterId: semesterId,
    }))

    if (scheduleData.length > 0) {
      await prisma.schedule.createMany({
        data: scheduleData,
        skipDuplicates: true,
      })
    }

    return NextResponse.json({
      success: true,
      schedulesCreated: scheduleData.length,
      conflicts: result.conflicts,
      unscheduled: result.unscheduled,
      message: `Successfully generated ${scheduleData.length} schedules`,
    })
  } catch (error) {
    console.error("Schedule generation error:", error)
    return NextResponse.json({ error: "Failed to generate schedules" }, { status: 500 })
  }
}
