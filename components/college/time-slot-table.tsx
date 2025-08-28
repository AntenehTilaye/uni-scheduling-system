"use client"

import { CardContent } from "@/components/ui/card"

import { CardDescription } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Edit, Trash2, Clock } from "lucide-react"

type TimeSlot = {
  id: string
  name: string
  startTime: string
  endTime: string
  dayOfWeek: number
  createdAt: Date
}

interface TimeSlotTableProps {
  timeSlots: TimeSlot[]
}

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const dayColors = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-green-100 text-green-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-purple-100 text-purple-800",
  5: "bg-red-100 text-red-800",
  6: "bg-orange-100 text-orange-800",
  7: "bg-gray-100 text-gray-800",
}

export function TimeSlotTable({ timeSlots }: TimeSlotTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dayFilter, setDayFilter] = useState<number | "ALL">("ALL")

  const filteredTimeSlots = timeSlots.filter((slot) => {
    const matchesSearch = slot.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDay = dayFilter === "ALL" || slot.dayOfWeek === dayFilter
    return matchesSearch && matchesDay
  })

  // Group time slots by day for better visualization
  const groupedSlots = filteredTimeSlots.reduce(
    (acc, slot) => {
      const day = slot.dayOfWeek
      if (!acc[day]) acc[day] = []
      acc[day].push(slot)
      return acc
    },
    {} as Record<number, TimeSlot[]>,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search time slots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value === "ALL" ? "ALL" : Number.parseInt(e.target.value))}
          className="px-3 py-2 border rounded-md"
        >
          <option value="ALL">All Days</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
          <option value="7">Sunday</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimeSlots.map((slot) => {
              const duration = calculateDuration(slot.startTime, slot.endTime)
              return (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{slot.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={dayColors[slot.dayOfWeek as keyof typeof dayColors]}>
                      {dayNames[slot.dayOfWeek]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatTime(slot.startTime)}</TableCell>
                  <TableCell>{formatTime(slot.endTime)}</TableCell>
                  <TableCell>{duration}</TableCell>
                  <TableCell>{new Date(slot.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredTimeSlots.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">No time slots found matching your criteria.</div>
      )}

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>Time slots organized by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedSlots).map(([day, slots]) => (
              <div key={day} className="space-y-2">
                <h4 className="font-medium text-sm">{dayNames[Number.parseInt(day)]}</h4>
                <div className="space-y-1">
                  {slots.map((slot) => (
                    <div key={slot.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{slot.name}</div>
                      <div className="text-muted-foreground">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function calculateDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(":").map(Number)
  const [endHours, endMinutes] = endTime.split(":").map(Number)

  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes

  const durationMinutes = endTotalMinutes - startTotalMinutes
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
