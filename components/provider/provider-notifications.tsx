"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export function ProviderNotifications({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Nueva solicitud de servicio",
      description: "Has recibido una nueva solicitud de servicio en tu área.",
      time: "Hace 5 minutos",
      read: false,
    },
    {
      id: "2",
      title: "Pago recibido",
      description: "Has recibido un pago por el servicio #12345.",
      time: "Hace 2 horas",
      read: true,
    },
    {
      id: "3",
      title: "Nueva reseña",
      description: "Un cliente ha dejado una reseña de 5 estrellas.",
      time: "Ayer",
      read: true,
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useAuth()

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".notifications-panel") && !target.closest(".notifications-trigger")) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="relative notifications-trigger"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-80 shadow-lg notifications-panel">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificaciones</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </Button>
              )}
            </div>
            <CardDescription>
              {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : "No hay notificaciones nuevas"}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg p-3 ${
                      notification.read ? "bg-gray-50" : "bg-emerald-50 border-l-4 border-emerald-500"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{notification.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500">No hay notificaciones</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
