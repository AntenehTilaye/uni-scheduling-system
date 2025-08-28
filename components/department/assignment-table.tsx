"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Edit, Trash2, Eye, UserCheck } from "lucide-react"

type Assignment = {
  id: string
  createdAt: Date
  course: {
    name: string
    code: string
    type: string
  }
  semester: {
    name: string
  }
  section: {
    name: string
    batch: {
      name: string
      program: {
        name: string
      }
    }
  } | null
  group: {
    name: string
  } | null
  teacher: {
    name: string
    email: string
  } | null
  assistant: {
    name: string
    email: string
  } | null
}

interface AssignmentTableProps {
  assignments: Assignment[]
}

export function AssignmentTable({ assignments }: AssignmentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.semester.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Section/Group</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Assistant</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{assignment.course.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.course.code} • {assignment.course.type}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{assignment.semester.name}</Badge>
                </TableCell>
                <TableCell>
                  {assignment.section ? (
                    <div className="text-sm">
                      <div className="font-medium">{assignment.section.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.section.batch.program.name} - {assignment.section.batch.name}
                      </div>
                    </div>
                  ) : assignment.group ? (
                    <div className="text-sm">
                      <div className="font-medium">Group {assignment.group.name}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {assignment.teacher ? (
                    <div className="text-sm">
                      <div className="font-medium">{assignment.teacher.name}</div>
                      <div className="text-xs text-muted-foreground">{assignment.teacher.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {assignment.assistant ? (
                    <div className="text-sm">
                      <div className="font-medium">{assignment.assistant.name}</div>
                      <div className="text-xs text-muted-foreground">{assignment.assistant.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{new Date(assignment.createdAt).toLocaleDateString()}</TableCell>
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

      {filteredAssignments.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">No assignments found matching your criteria.</div>
      )}
    </div>
  )
}
