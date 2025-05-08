import type { ProviderBadge as ProviderBadgeType } from "@/types/categories"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProviderBadgeProps {
  badge: ProviderBadgeType
  size?: "sm" | "md" | "lg"
}

export function ProviderBadge({ badge, size = "md" }: ProviderBadgeProps) {
  const IconComponent =
    (Icons as Record<string, LucideIcon>)[badge.icon.charAt(0).toUpperCase() + badge.icon.slice(1)] || Icons.Award

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-1">
            <IconComponent className={`${sizeClasses[size]} text-emerald-600`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{badge.name}</p>
            <p className="text-xs text-gray-500">{badge.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
