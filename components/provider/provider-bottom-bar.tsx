"use client"

import Link from "next/link"
import { Home, Map, User, ClipboardList } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ProviderBottomBar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { href: "/provider-dashboard", label: "Inicio", icon: Home },
    { href: "/provider-requests", label: "Solicitudes", icon: ClipboardList },
    { href: "/provider-map", label: "Mapa", icon: Map },
    { href: "/provider-profile", label: "Perfil", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-safe-area md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive(item.href) && "text-primary")} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
