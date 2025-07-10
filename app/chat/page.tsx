"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function ChatListPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const conversations = [
    {
      id: "carlos-rodriguez",
      name: "Carlos Rodríguez",
      service: "Electricista",
      lastMessage: "Para los 3 enchufes serían unos $4,500 y la revisión del tablero $2,000...",
      timestamp: new Date(Date.now() - 300000), // 5 minutos
      unread: 2,
      online: true,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "maria-gonzalez",
      name: "María González",
      service: "Plomera",
      lastMessage: "Perfecto, entonces nos vemos mañana a las 10:00",
      timestamp: new Date(Date.now() - 3600000), // 1 hora
      unread: 0,
      online: false,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "ana-martinez",
      name: "Ana Martínez",
      service: "Limpieza",
      lastMessage: "Gracias por la excelente reseña! 😊",
      timestamp: new Date(Date.now() - 86400000), // 1 día
      unread: 0,
      online: true,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "roberto-sanchez",
      name: "Roberto Sánchez",
      service: "Carpintero",
      lastMessage: "Te envío las fotos del trabajo terminado",
      timestamp: new Date(Date.now() - 172800000), // 2 días
      unread: 1,
      online: false,
      image: "/placeholder.svg?height=50&width=50",
    },
  ]

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.service.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()

    if (diff < 3600000) {
      // Menos de 1 hora
      return `${Math.floor(diff / 60000)}m`
    } else if (diff < 86400000) {
      // Menos de 1 día
      return `${Math.floor(diff / 3600000)}h`
    } else if (diff < 604800000) {
      // Menos de 1 semana
      return `${Math.floor(diff / 86400000)}d`
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Mensajes
          </h1>
          <p className="text-muted-foreground">Conversaciones con profesionales</p>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de conversaciones */}
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "No se encontraron conversaciones" : "No tienes mensajes"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Cuando contactes con profesionales, tus conversaciones aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Link key={conversation.id} href={`/chat/${conversation.id}`}>
                <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.image || "/placeholder.svg"} alt={conversation.name} />
                          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{conversation.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(conversation.timestamp)}
                            </span>
                            {conversation.unread > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                              >
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{conversation.service}</p>
                        <p
                          className={`text-sm truncate ${conversation.unread > 0 ? "font-medium" : "text-muted-foreground"}`}
                        >
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
