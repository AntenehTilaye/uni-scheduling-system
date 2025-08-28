import { prisma } from "./prisma"
import type { CourseAssignment, TimeSlot, Room, Preference, Schedule } from "@prisma/client"

interface SchedulingContext {
  assignments: (CourseAssignment & {
    course: { name: string; code: string; type: string; credits: number }
    teacher: { id: string; name: string } | null
    assistant: { id: string; name: string } | null
    section: { name: string; strength: number } | null
    group: { name: string; size: number } | null
  })[]
  timeSlots: TimeSlot[]
  rooms: (Room & { building: { name: string } })[]
  preferences: (Preference & {
    timeSlot: TimeSlot | null
    room: Room | null
  })[]
  existingSchedules: Schedule[]
}

interface ScheduleCandidate {
  assignmentId: string
  timeSlotId: string
  roomId: string
  score: number
  conflicts: string[]
}

export class UniversityScheduler {
  private context: SchedulingContext

  constructor(context: SchedulingContext) {
    this.context = context
  }

  /**
   * Generate schedules for all unscheduled course assignments
   */
  async generateSchedules(): Promise<{
    schedules: ScheduleCandidate[]
    conflicts: string[]
    unscheduled: string[]
  }> {
    const schedules: ScheduleCandidate[] = []
    const conflicts: string[] = []
    const unscheduled: string[] = []

    // Get assignments that need scheduling
    const unscheduledAssignments = this.context.assignments.filter(
      (assignment) => !this.context.existingSchedules.some((schedule) => schedule.courseAssignmentId === assignment.id),
    )

    // Sort assignments by priority (theory courses first, then labs, then tutorials)
    const sortedAssignments = this.sortAssignmentsByPriority(unscheduledAssignments)

    for (const assignment of sortedAssignments) {
      const candidates = this.generateCandidatesForAssignment(assignment)
      const bestCandidate = this.selectBestCandidate(candidates, schedules)

      if (bestCandidate) {
        schedules.push(bestCandidate)
      } else {
        unscheduled.push(assignment.id)
        conflicts.push(`Could not schedule ${assignment.course.name} (${assignment.course.code})`)
      }
    }

    return { schedules, conflicts, unscheduled }
  }

  /**
   * Sort assignments by scheduling priority
   */
  private sortAssignmentsByPriority(assignments: SchedulingContext["assignments"]): SchedulingContext["assignments"] {
    return assignments.sort((a, b) => {
      // Priority order: THEORY > LAB > TUTORIAL
      const typeOrder = { THEORY: 1, LAB: 2, TUTORIAL: 3 }
      const aPriority = typeOrder[a.course.type as keyof typeof typeOrder] || 4
      const bPriority = typeOrder[b.course.type as keyof typeof typeOrder] || 4

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      // Secondary sort by credits (higher credits first)
      return b.course.credits - a.course.credits
    })
  }

  /**
   * Generate all possible scheduling candidates for an assignment
   */
  private generateCandidatesForAssignment(assignment: SchedulingContext["assignments"][0]): ScheduleCandidate[] {
    const candidates: ScheduleCandidate[] = []

    for (const timeSlot of this.context.timeSlots) {
      for (const room of this.context.rooms) {
        // Check basic feasibility
        if (!this.isRoomSuitableForCourse(room, assignment)) {
          continue
        }

        const conflicts = this.checkConflicts(assignment, timeSlot, room)
        const score = this.calculateScore(assignment, timeSlot, room)

        candidates.push({
          assignmentId: assignment.id,
          timeSlotId: timeSlot.id,
          roomId: room.id,
          score,
          conflicts,
        })
      }
    }

    return candidates.sort((a, b) => b.score - a.score)
  }

  /**
   * Check if a room is suitable for a course
   */
  private isRoomSuitableForCourse(
    room: Room & { building: { name: string } },
    assignment: SchedulingContext["assignments"][0],
  ): boolean {
    // Check capacity
    const requiredCapacity = assignment.section?.strength || assignment.group?.size || 30
    if (room.capacity < requiredCapacity) {
      return false
    }

    // Check room type compatibility
    if (assignment.course.type === "LAB" && room.type && !room.type.toLowerCase().includes("lab")) {
      return false
    }

    return true
  }

  /**
   * Check for scheduling conflicts
   */
  private checkConflicts(assignment: SchedulingContext["assignments"][0], timeSlot: TimeSlot, room: Room): string[] {
    const conflicts: string[] = []

    // Check if teacher is already scheduled at this time
    if (assignment.teacherId) {
      const teacherConflict = this.context.existingSchedules.find(
        (schedule) =>
          schedule.timeSlotId === timeSlot.id &&
          this.context.assignments.find(
            (a) => a.id === schedule.courseAssignmentId && a.teacherId === assignment.teacherId,
          ),
      )

      if (teacherConflict) {
        conflicts.push("Teacher already scheduled at this time")
      }
    }

    // Check if assistant is already scheduled at this time
    if (assignment.assistantId) {
      const assistantConflict = this.context.existingSchedules.find(
        (schedule) =>
          schedule.timeSlotId === timeSlot.id &&
          this.context.assignments.find(
            (a) => a.id === schedule.courseAssignmentId && a.assistantId === assignment.assistantId,
          ),
      )

      if (assistantConflict) {
        conflicts.push("Assistant already scheduled at this time")
      }
    }

    // Check if room is already booked
    const roomConflict = this.context.existingSchedules.find(
      (schedule) => schedule.timeSlotId === timeSlot.id && schedule.roomId === room.id,
    )

    if (roomConflict) {
      conflicts.push("Room already booked at this time")
    }

    return conflicts
  }

  /**
   * Calculate scheduling score based on preferences and constraints
   */
  private calculateScore(assignment: SchedulingContext["assignments"][0], timeSlot: TimeSlot, room: Room): number {
    let score = 100 // Base score

    // Teacher time preferences
    if (assignment.teacherId) {
      const teacherTimePrefs = this.context.preferences.filter(
        (p) => p.userId === assignment.teacherId && p.type === "TIME_SLOT" && p.timeSlotId === timeSlot.id,
      )

      for (const pref of teacherTimePrefs) {
        switch (pref.level) {
          case "PREFERRED":
            score += 50
            break
          case "ACCEPTABLE":
            score += 10
            break
          case "NOT_PREFERRED":
            score -= 30
            break
        }
      }

      // Teacher room preferences
      const teacherRoomPrefs = this.context.preferences.filter(
        (p) => p.userId === assignment.teacherId && p.type === "ROOM" && p.roomId === room.id,
      )

      for (const pref of teacherRoomPrefs) {
        switch (pref.level) {
          case "PREFERRED":
            score += 30
            break
          case "ACCEPTABLE":
            score += 5
            break
          case "NOT_PREFERRED":
            score -= 20
            break
        }
      }
    }

    // Assistant preferences (weighted less than teacher)
    if (assignment.assistantId) {
      const assistantTimePrefs = this.context.preferences.filter(
        (p) => p.userId === assignment.assistantId && p.type === "TIME_SLOT" && p.timeSlotId === timeSlot.id,
      )

      for (const pref of assistantTimePrefs) {
        switch (pref.level) {
          case "PREFERRED":
            score += 20
            break
          case "ACCEPTABLE":
            score += 5
            break
          case "NOT_PREFERRED":
            score -= 15
            break
        }
      }
    }

    // Room utilization bonus (prefer rooms that are closer to optimal capacity)
    const requiredCapacity = assignment.section?.strength || assignment.group?.size || 30
    const utilizationRatio = requiredCapacity / room.capacity
    if (utilizationRatio >= 0.7 && utilizationRatio <= 0.9) {
      score += 20 // Good utilization
    } else if (utilizationRatio < 0.5) {
      score -= 10 // Underutilized
    }

    // Time slot preferences (general)
    // Prefer morning slots for theory, afternoon for labs
    const hour = Number.parseInt(timeSlot.startTime.split(":")[0])
    if (assignment.course.type === "THEORY" && hour >= 8 && hour <= 11) {
      score += 15
    } else if (assignment.course.type === "LAB" && hour >= 13 && hour <= 17) {
      score += 15
    }

    return score
  }

  /**
   * Select the best candidate that doesn't conflict with existing schedules
   */
  private selectBestCandidate(
    candidates: ScheduleCandidate[],
    existingSchedules: ScheduleCandidate[],
  ): ScheduleCandidate | null {
    for (const candidate of candidates) {
      // Check conflicts with existing schedules in this generation
      const hasConflict = existingSchedules.some(
        (existing) =>
          (existing.timeSlotId === candidate.timeSlotId && existing.roomId === candidate.roomId) ||
          this.hasInstructorConflict(candidate, existing),
      )

      if (!hasConflict && candidate.conflicts.length === 0) {
        return candidate
      }
    }

    return null
  }

  /**
   * Check if two candidates have instructor conflicts
   */
  private hasInstructorConflict(candidate1: ScheduleCandidate, candidate2: ScheduleCandidate): boolean {
    if (candidate1.timeSlotId !== candidate2.timeSlotId) {
      return false
    }

    const assignment1 = this.context.assignments.find((a) => a.id === candidate1.assignmentId)
    const assignment2 = this.context.assignments.find((a) => a.id === candidate2.assignmentId)

    if (!assignment1 || !assignment2) {
      return false
    }

    // Check teacher conflict
    if (assignment1.teacherId && assignment1.teacherId === assignment2.teacherId) {
      return true
    }

    // Check assistant conflict
    if (assignment1.assistantId && assignment1.assistantId === assignment2.assistantId) {
      return true
    }

    return false
  }
}

/**
 * Main function to generate schedules for a semester
 */
export async function generateSemesterSchedule(semesterId: string) {
  // Fetch all required data
  const [assignments, timeSlots, rooms, preferences, existingSchedules] = await Promise.all([
    prisma.courseAssignment.findMany({
      where: { semesterId },
      include: {
        course: true,
        teacher: true,
        assistant: true,
        section: true,
        group: true,
      },
    }),
    prisma.timeSlot.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.room.findMany({
      include: {
        building: true,
      },
    }),
    prisma.preference.findMany({
      include: {
        timeSlot: true,
        room: true,
      },
    }),
    prisma.schedule.findMany({
      where: { semesterId },
    }),
  ])

  const context: SchedulingContext = {
    assignments,
    timeSlots,
    rooms,
    preferences,
    existingSchedules,
  }

  const scheduler = new UniversityScheduler(context)
  return await scheduler.generateSchedules()
}
