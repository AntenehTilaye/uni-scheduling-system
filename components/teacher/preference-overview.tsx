"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, MapPin, Trash2 } from "lucide-react"
import type { PreferenceType, PreferenceLevel } from "@prisma/client"

type Preference = {
  id: string
  type: PreferenceType
  level: PreferenceLevel
  description: string | null
  timeSlot: {
    name: string
    startTime: string
    endTime: string
    dayOfWeek: number
  } | null
  room: {
    name: string
    code: string
    type: string | null
  } | null
}

interface PreferenceOverviewProps {
  preferences: Preference[]
}

const levelColors = {
  PREFERRED: "bg-green-100 text-green-800",
  ACCEPTABLE: "bg-yellow-100 text-yellow-800",
  NOT_PREFERRED: "bg-red-100 text-red-800",
}

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function PreferenceOverview({ preferences }: PreferenceOverviewProps) {
  const handleDelete = async (preferenceId: string) => {
    try {
      const response = await fetch(`/api/teacher/preferences/${preferenceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to delete preference:", error)
    }
  }

  if (preferences.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No preferences set yet.</p>
        <p className="text-sm">Start by setting your time and room preferences to help with scheduling.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preferences.map((preference) => (
            <TableRow key={preference.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {preference.type === "TIME_SLOT" ? (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">{preference.type.replace("_", " ")}</span>
                </div>
              </TableCell>
              <TableCell>
                {preference.timeSlot ? (
                  <div>
                    <div className="font-medium">{preference.timeSlot.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {dayNames[preference.timeSlot.dayOfWeek]} • {formatTime(preference.timeSlot.startTime)} -{" "}
                      {formatTime(preference.timeSlot.endTime)}
                    </div>
                  </div>
                ) : preference.room ? (
                  <div>
                    <div className="font-medium">{preference.room.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {preference.room.code}
                      {preference.room.type && ` • ${preference.room.type}`}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={levelColors[preference.level]}>{preference.level.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{preference.description || "-"}</span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(preference.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
