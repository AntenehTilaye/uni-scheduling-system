import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CollegeTable } from "@/components/admin/college-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

async function getColleges() {
  return await prisma.college.findMany({
    include: {
      user: true,
      departments: {
        select: {
          id: true,
        },
      },
      buildings: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function CollegesPage() {
  const colleges = await getColleges()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colleges</h1>
          <p className="text-muted-foreground">Manage colleges and their information</p>
        </div>
        <Button asChild>
          <Link href="/admin/colleges/new">
            <Plus className="mr-2 h-4 w-4" />
            Add College
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Colleges</CardTitle>
          <CardDescription>A list of all colleges in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <CollegeTable colleges={colleges} />
        </CardContent>
      </Card>
    </div>
  )
}
