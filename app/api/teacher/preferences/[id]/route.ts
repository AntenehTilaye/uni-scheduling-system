import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify the preference belongs to the current user
    const preference = await prisma.preference.findUnique({
      where: { id: params.id },
    })

    if (!preference || preference.userId !== session.user.id) {
      return NextResponse.json({ error: "Preference not found" }, { status: 404 })
    }

    await prisma.preference.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete preference" }, { status: 500 })
  }
}
