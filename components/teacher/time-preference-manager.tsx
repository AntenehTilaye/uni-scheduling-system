"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Save } from "lucide-react"
import type { PreferenceLevel } from "@prisma/client"

type TimeSlot = {
  id: string
  name: string
  startTime: string
  endTime: string
  dayOfWeek: number
  college: {
    name: string
  }
}

type Preference = {
  id: string
  level: PreferenceLevel
  description: string | null
  timeSlot: {
    id: string
  } | null
}

interface TimePreferenceManagerProps {
  timeSlots: TimeSlot[]
  preferences: Preference[]
}

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const levelColors = {
  PREFERRED: "bg-green-100 text-green-800",
  ACCEPTABLE: "bg-yellow-100 text-yellow-800",
  NOT_PREFERRED: "bg-red-100 text-red-800",
}

export function TimePreferenceManager({ timeSlots, preferences }: TimePreferenceManagerProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<PreferenceLevel | "">("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Create a map of existing preferences
  const preferenceMap = new Map(
    preferences.map((pref) => [pref.timeSlot?.id, { level: pref.level, description: pref.description }]),
  )

  // Group time slots by day
  const groupedTimeSlots = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = []
      acc[slot.dayOfWeek].push(slot)
      return acc
    },
    {} as Record<number, TimeSlot[]>,
  )

  const handleSavePreference = async () => {
    if (!selectedTimeSlot || !selectedLevel) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/teacher/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "TIME_SLOT",
          level: selectedLevel,
          timeSlotId: selectedTimeSlot,
          description: description || null,
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to save preference:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Add New Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Time Preference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot</label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.name} - {dayNames[slot.dayOfWeek]} ({formatTime(slot.startTime)} -{" "}
                      {formatTime(slot.endTime)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preference Level</label>
              <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as PreferenceLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREFERRED">Preferred</SelectItem>
                  <SelectItem value="ACCEPTABLE">Acceptable</SelectItem>
                  <SelectItem value="NOT_PREFERRED">Not Preferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Morning person"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSavePreference} disabled={!selectedTimeSlot || !selectedLevel || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedTimeSlots).map(([day, slots]) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="text-lg">{dayNames[Number.parseInt(day)]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {slots.map((slot) => {
                  const preference = preferenceMap.get(slot.id)
                  return (
                    <div key={slot.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{slot.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </div>
                      </div>
                      {preference ? (
                        <Badge className={levelColors[preference.level]}>{preference.level.replace("_", " ")}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No preference</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
