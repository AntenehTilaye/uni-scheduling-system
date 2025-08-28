"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, Trash2 } from "lucide-react"

type Semester = {
  id: string
  name: string
  isActive: boolean
}

type Schedule = {
  id: string
  courseAssignment: {
    course: {
      name: string
      code: string
      type: string
    }
    teacher: {
      name: string
    } | null
    section: {
      name: string
    } | null
  }
  timeSlot: {
    name: string
    startTime: string
    endTime: string
    dayOfWeek: number
  }
  room: {
    name: string
    code: string
    building: {
      name: string
    }
  }
}

interface ScheduleViewerProps {
  semesters: Semester[]
}

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const typeColors = {
  THEORY: "bg-blue-100 text-blue-800",
  LAB: "bg-green-100 text-green-800",
  TUTORIAL: "bg-purple-100 text-purple-800",
}

export function ScheduleViewer({ semesters }: ScheduleViewerProps) {
  const [selectedSemester, setSelectedSemester] = useState("")
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSchedules = async (semesterId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/schedules?semesterId=${semesterId}`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSemester) {
      fetchSchedules(selectedSemester)
    }
  }, [selectedSemester])

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/admin/schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSchedules(schedules.filter((s) => s.id !== scheduleId))
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Semester</label>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger>
            <SelectValue placeholder="Choose semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name} {semester.isActive && <Badge className="ml-2">Active</Badge>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSemester && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{schedules.length} schedules found</div>
            <Button variant="outline" size="sm" onClick={() => fetchSchedules(selectedSemester)} disabled={isLoading}>
              <Calendar className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {schedules.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.courseAssignment.course.name}</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {schedule.courseAssignment.course.code}
                            </span>
                            <Badge
                              className={typeColors[schedule.courseAssignment.course.type as keyof typeof typeColors]}
                            >
                              {schedule.courseAssignment.course.type}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.courseAssignment.teacher?.name || "Not assigned"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{dayNames[schedule.timeSlot.dayOfWeek]}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(schedule.timeSlot.startTime)} - {formatTime(schedule.timeSlot.endTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.room.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.room.building.name} - {schedule.room.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.courseAssignment.section?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-8 text-muted-foreground">No schedules found for this semester.</div>
            )
          )}
        </div>
      )}
    </div>
  )
}
