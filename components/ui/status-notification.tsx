"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusType = "success" | "error" | "warning" | "info"

interface StatusNotificationProps {
  type: StatusType
  title: string
  message: string
  duration?: number
  onClose?: () => void
  className?: string
}

export function StatusNotification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
}: StatusNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const backgrounds = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }

  const titleColors = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  }

  const messageColors = {
    success: "text-green-700",
    error: "text-red-700",
    warning: "text-yellow-700",
    info: "text-blue-700",
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-md rounded-lg border p-4 shadow-lg animate-slide-in-up",
        backgrounds[type],
        className,
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 flex-1">
          <h3 className={cn("text-sm font-medium", titleColors[type])}>{title}</h3>
          <div className={cn("mt-1 text-sm", messageColors[type])}>{message}</div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={handleClose}
          >
            <span className="sr-only">Cerrar</span>
            <X className={cn("h-5 w-5", titleColors[type])} />
          </button>
        </div>
      </div>
    </div>
  )
}
