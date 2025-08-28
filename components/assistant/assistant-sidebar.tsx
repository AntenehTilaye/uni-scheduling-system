"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Heart, Clock, MapPin, Calendar, Settings, LogOut, BarChart3, BookOpen } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/assistant",
    icon: BarChart3,
  },
  {
    title: "My Courses",
    href: "/assistant/courses",
    icon: BookOpen,
  },
  {
    title: "Preferences",
    href: "/assistant/preferences",
    icon: Heart,
  },
  {
    title: "Time Preferences",
    href: "/assistant/preferences/time",
    icon: Clock,
  },
  {
    title: "Room Preferences",
    href: "/assistant/preferences/rooms",
    icon: MapPin,
  },
  {
    title: "My Schedule",
    href: "/assistant/schedule",
    icon: Calendar,
  },
  {
    title: "Settings",
    href: "/assistant/settings",
    icon: Settings,
  },
]

export function AssistantSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Assistant Panel</h2>
        <p className="text-sm text-muted-foreground">Preferences & Schedule</p>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-secondary")}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
