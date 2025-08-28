import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.DEPARTMENT && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const department = await prisma.department.findUnique({
      where: { userId: session.user.id },
      include: {
        courses: {
          include: {
            assignments: {
              include: {
                teacher: true,
                assistant: true,
                semester: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json(department.courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== UserRole.DEPARTMENT && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const department = await prisma.department.findUnique({
      where: { userId: session.user.id },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, code, credits, type, description } = body

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    })

    if (existingCourse) {
      return NextResponse.json({ error: "Course code already exists" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        type,
        description,
        departmentId: department.id,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
