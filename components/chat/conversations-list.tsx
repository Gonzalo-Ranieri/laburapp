"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Conversation {
  id: string
  type: string
  title?: string
  lastActivity: string
  otherUser?: {
    id: string
    name: string
    image: string
    isOnline: boolean
    lastSeen: string
  }
  lastMessage?: {
    id: string
    content: string
    senderId: string
    createdAt: string
    readBy: string[]
  }
  unreadCount: number
}

interface ConversationsListProps {
  currentUserId: string
  onSelectConversation?: (conversation: Conversation) => void
}

export function ConversationsList({ currentUserId, onSelectConversation }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/conversations")

      if (!response.ok) {
        throw new Error("Error al cargar conversaciones")
      }

      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      conversation.otherUser?.name.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchLower)
    )
  })

  const formatLastActivity = (dateString: string) => {
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

  const handleConversationClick = (conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation)
    } else {
      router.push(`/chat/${conversation.id}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Conversaciones</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nueva
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron conversaciones" : "No tienes conversaciones aún"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage
                        src={conversation.otherUser?.image || "/placeholder.svg"}
                        alt={conversation.otherUser?.name || "Usuario"}
                      />
                      <AvatarFallback>{conversation.otherUser?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    {conversation.otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{conversation.otherUser?.name || "Usuario"}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{formatLastActivity(conversation.lastActivity)}</span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage ? (
                        <>
                          {conversation.lastMessage.senderId === currentUserId && "Tú: "}
                          {conversation.lastMessage.content}
                        </>
                      ) : (
                        "Conversación iniciada"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
