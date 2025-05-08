import type { DynamicTag as DynamicTagType } from "@/types/categories"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface DynamicTagProps {
  tag: DynamicTagType
}

export function DynamicTag({ tag }: DynamicTagProps) {
  const IconComponent = tag.icon
    ? (Icons as Record<string, LucideIcon>)[tag.icon.charAt(0).toUpperCase() + tag.icon.slice(1)]
    : undefined

  return (
    <div
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: tag.backgroundColor,
        color: tag.textColor,
      }}
    >
      {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
      {tag.name}
    </div>
  )
}
