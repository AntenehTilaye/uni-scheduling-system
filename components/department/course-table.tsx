"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Edit, Trash2, Eye, BookOpen } from "lucide-react"
import type { CourseType } from "@prisma/client"

type Course = {
  id: string
  name: string
  code: string
  credits: number
  type: CourseType
  description: string | null
  createdAt: Date
  assignments: {
    id: string
    teacher: { name: string } | null
    assistant: { name: string } | null
    semester: { name: string }
  }[]
}

interface CourseTableProps {
  courses: Course[]
}

const typeColors = {
  THEORY: "bg-blue-100 text-blue-800",
  LAB: "bg-green-100 text-green-800",
  TUTORIAL: "bg-purple-100 text-purple-800",
}

export function CourseTable({ courses }: CourseTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<CourseType | "ALL">("ALL")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "ALL" || course.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CourseType | "ALL")}
          className="px-3 py-2 border rounded-md"
        >
          <option value="ALL">All Types</option>
          <option value="THEORY">Theory</option>
          <option value="LAB">Lab</option>
          <option value="TUTORIAL">Tutorial</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Assignments</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{course.name}</div>
                      {course.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{course.description}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{course.code}</TableCell>
                <TableCell>
                  <Badge className={typeColors[course.type]}>{course.type}</Badge>
                </TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {course.assignments.length > 0 ? (
                      <div className="space-y-1">
                        {course.assignments.slice(0, 2).map((assignment) => (
                          <div key={assignment.id} className="text-xs">
                            <span className="font-medium">{assignment.semester.name}</span>
                            {assignment.teacher && (
                              <span className="text-muted-foreground"> - {assignment.teacher.name}</span>
                            )}
                          </div>
                        ))}
                        {course.assignments.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{course.assignments.length - 2} more</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No assignments</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">No courses found matching your criteria.</div>
      )}
    </div>
  )
}
