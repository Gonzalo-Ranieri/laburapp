"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  CheckCheck,
  Settings,
  MessageSquare,
  CreditCard,
  Star,
  Briefcase,
  AlertCircle,
  Gift,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  readAt: string | null
  createdAt: string
}

interface NotificationCenterProps {
  userId: string
  compact?: boolean
}

const notificationIcons = {
  REQUEST: Briefcase,
  PAYMENT: CreditCard,
  REVIEW: Star,
  CHAT: MessageSquare,
  SYSTEM: AlertCircle,
  PROMOTION: Gift,
}

const notificationColors = {
  REQUEST: "text-blue-600",
  PAYMENT: "text-green-600",
  REVIEW: "text-yellow-600",
  CHAT: "text-purple-600",
  SYSTEM: "text-red-600",
  PROMOTION: "text-pink-600",
}

export function NotificationCenter({ userId, compact = false }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    pages: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [activeTab, pagination.offset])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      let url = `/api/notifications?limit=${pagination.limit}&offset=${pagination.offset}`

      if (activeTab !== "all") {
        if (activeTab === "unread") {
          url += "&unreadOnly=true"
        } else {
          url += `&type=${activeTab.toUpperCase()}`
        }
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Error al cargar notificaciones")
      }

      const data = await response.json()
      setNotifications(data.notifications)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }))
      setUnreadCount(data.pagination.unread)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (!response.ok) {
        throw new Error("Error al marcar como leída")
      }

      // Actualizar estado local
      setNotifications(
        notifications.map((notif) =>
          notificationIds.includes(notif.id) ? { ...notif, read: true, readAt: new Date().toISOString() } : notif,
        ),
      )

      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (!response.ok) {
        throw new Error("Error al marcar todas como leídas")
      }

      // Actualizar estado local
      setNotifications(
        notifications.map((notif) => ({
          ...notif,
          read: true,
          readAt: new Date().toISOString(),
        })),
      )

      setUnreadCount(0)

      toast({
        title: "Éxito",
        description: "Todas las notificaciones han sido marcadas como leídas",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas",
        variant: "destructive",
      })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      markAsRead([notification.id])
    }

    // Navegar según el tipo de notificación
    const { type, data } = notification

    switch (type) {
      case "REQUEST":
        if (data.requestId) {
          window.location.href = `/requests/${data.requestId}`
        }
        break
      case "PAYMENT":
        if (data.paymentId) {
          window.location.href = `/payments/${data.paymentId}`
        }
        break
      case "REVIEW":
        if (data.reviewId) {
          window.location.href = `/reviews/${data.reviewId}`
        }
        break
      case "CHAT":
        if (data.conversationId) {
          window.location.href = `/chat/${data.conversationId}`
        }
        break
      default:
        // Para notificaciones del sistema, no navegar
        break
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Hace unos minutos"
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`
    } else {
      return date.toLocaleDateString()
    }
  }

  const renderNotification = (notification: Notification) => {
    const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell
    const iconColor = notificationColors[notification.type as keyof typeof notificationColors] || "text-gray-600"

    return (
      <div
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
          !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full bg-gray-100 ${iconColor}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}>
                {notification.title}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificaciones</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones</p>
              </div>
            ) : (
              <div>{notifications.slice(0, 5).map(renderNotification)}</div>
            )}
          </ScrollArea>
          {notifications.length > 5 && (
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/notifications")}>
                Ver todas las notificaciones
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>Notificaciones</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/settings#notifications")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pb-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">No leídas</TabsTrigger>
              <TabsTrigger value="request">Servicios</TabsTrigger>
              <TabsTrigger value="payment">Pagos</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes notificaciones en esta categoría</p>
              </div>
            ) : (
              <div>{notifications.map(renderNotification)}</div>
            )}
          </TabsContent>
        </Tabs>

        {pagination.pages > 1 && (
          <div className="p-4 border-t flex justify-center">
            <Button
              variant="outline"
              onClick={() => setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
            >
              Cargar más
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
