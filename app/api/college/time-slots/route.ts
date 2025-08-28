import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.COLLEGE && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const college = await prisma.college.findUnique({
      where: { userId: session.user.id },
      include: {
        timeSlots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    })

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    return NextResponse.json(college.timeSlots)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.COLLEGE && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const college = await prisma.college.findUnique({
      where: { userId: session.user.id },
    })

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, startTime, endTime, dayOfWeek } = body

    // Check for overlapping time slots
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        collegeId: college.id,
        dayOfWeek,
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
    })

    if (existingSlot) {
      return NextResponse.json({ error: "Time slot overlaps with existing slot" }, { status: 400 })
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        name,
        startTime,
        endTime,
        dayOfWeek,
        collegeId: college.id,
      },
    })

    return NextResponse.json(timeSlot, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create time slot" }, { status: 500 })
  }
}
