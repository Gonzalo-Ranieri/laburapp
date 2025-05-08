import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "default" | "provider"
}

export function Logo({ size = "md", className, variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("font-bold", sizeClasses[size], className)}>
      <span className="text-primary">Labur</span>
      <span className="text-foreground">App</span>
      {variant === "provider" && <span className="ml-1 text-muted-foreground text-sm">Pro</span>}
    </div>
  )
}
