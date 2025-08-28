import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeSlotForm } from "@/components/college/time-slot-form"

export default function NewTimeSlotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Time Slot</h1>
        <p className="text-muted-foreground">Create a new time slot for scheduling classes</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Time Slot Details</CardTitle>
          <CardDescription>Configure when classes can be scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSlotForm />
        </CardContent>
      </Card>
    </div>
  )
}
