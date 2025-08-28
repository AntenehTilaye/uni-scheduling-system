"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, AlertCircle, Clock } from "lucide-react"

type Semester = {
  id: string
  name: string
  isActive: boolean
}

interface ScheduleGeneratorProps {
  semesters: Semester[]
}

interface GenerationResult {
  success: boolean
  schedulesCreated: number
  conflicts: string[]
  unscheduled: string[]
  message: string
}

export function ScheduleGenerator({ semesters }: ScheduleGeneratorProps) {
  const [selectedSemester, setSelectedSemester] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const handleGenerate = async () => {
    if (!selectedSemester) return

    setIsGenerating(true)
    setProgress(0)
    setResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/admin/schedules/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semesterId: selectedSemester,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          schedulesCreated: data.schedulesCreated,
          conflicts: data.conflicts || [],
          unscheduled: data.unscheduled || [],
          message: data.message,
        })
      } else {
        setResult({
          success: false,
          schedulesCreated: 0,
          conflicts: [data.error || "Failed to generate schedules"],
          unscheduled: [],
          message: "Generation failed",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        schedulesCreated: 0,
        conflicts: ["Network error occurred"],
        unscheduled: [],
        message: "Generation failed",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Semester</label>
        <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={isGenerating}>
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

      {isGenerating && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating schedules...</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <Button onClick={handleGenerate} disabled={!selectedSemester || isGenerating} className="w-full">
        <Play className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating..." : "Generate Schedules"}
      </Button>

      {result && (
        <div className="space-y-4">
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </div>
          </Alert>

          {result.success && (
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Schedules Created:</strong> {result.schedulesCreated}
              </div>
              {result.unscheduled.length > 0 && (
                <div className="text-sm">
                  <strong>Unscheduled:</strong> {result.unscheduled.length} assignments
                </div>
              )}
            </div>
          )}

          {result.conflicts.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Issues:</div>
              <div className="space-y-1">
                {result.conflicts.slice(0, 5).map((conflict, index) => (
                  <div key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {conflict}
                  </div>
                ))}
                {result.conflicts.length > 5 && (
                  <div className="text-xs text-muted-foreground">+{result.conflicts.length - 5} more issues</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
