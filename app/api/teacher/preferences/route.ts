import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== UserRole.TEACHER &&
        session.user.role !== UserRole.ASSISTANT &&
        session.user.role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const preferences = await prisma.preference.findMany({
      where: { userId: session.user.id },
      include: {
        timeSlot: true,
        room: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== UserRole.TEACHER &&
        session.user.role !== UserRole.ASSISTANT &&
        session.user.role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, level, timeSlotId, roomId, description } = body

    // Check if preference already exists
    const existingPreference = await prisma.preference.findFirst({
      where: {
        userId: session.user.id,
        type,
        ...(timeSlotId && { timeSlotId }),
        ...(roomId && { roomId }),
      },
    })

    if (existingPreference) {
      // Update existing preference
      const updatedPreference = await prisma.preference.update({
        where: { id: existingPreference.id },
        data: {
          level,
          description,
        },
        include: {
          timeSlot: true,
          room: true,
        },
      })
      return NextResponse.json(updatedPreference)
    } else {
      // Create new preference
      const preference = await prisma.preference.create({
        data: {
          type,
          level,
          description,
          userId: session.user.id,
          ...(timeSlotId && { timeSlotId }),
          ...(roomId && { roomId }),
        },
        include: {
          timeSlot: true,
          room: true,
        },
      })
      return NextResponse.json(preference, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to save preference" }, { status: 500 })
  }
}
