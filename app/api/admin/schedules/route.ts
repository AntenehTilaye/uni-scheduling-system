import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get("semesterId")

    if (!semesterId) {
      return NextResponse.json({ error: "Semester ID is required" }, { status: 400 })
    }

    const schedules = await prisma.schedule.findMany({
      where: { semesterId },
      include: {
        courseAssignment: {
          include: {
            course: true,
            teacher: true,
            section: true,
          },
        },
        timeSlot: true,
        room: {
          include: {
            building: true,
          },
        },
      },
      orderBy: [{ timeSlot: { dayOfWeek: "asc" } }, { timeSlot: { startTime: "asc" } }],
    })

    return NextResponse.json(schedules)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}
