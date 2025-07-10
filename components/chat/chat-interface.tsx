"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { io, type Socket } from "socket.io-client"

interface Message {
  id: string
  content: string
  attachments: string[]
  readBy: string[]
  createdAt: string
  sender: {
    id: string
    name: string
    image: string
  }
}

interface ChatUser {
  id: string
  name: string
  image: string
  isOnline: boolean
  lastSeen: string
}

interface ChatInterfaceProps {
  conversationId: string
  otherUser: ChatUser
  currentUserId: string
}

export function ChatInterface({ conversationId, otherUser, currentUserId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  useEffect(() => {
    // Inicializar WebSocket
    const token = localStorage.getItem("auth_token")
    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      path: "/api/socket",
      auth: { token },
    })

    newSocket.on("connect", () => {
      console.log("Conectado al chat")
      setSocket(newSocket)
    })

    newSocket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    })

    newSocket.on("user_typing", (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setOtherUserTyping(data.isTyping)
      }
    })

    newSocket.on("messages_read", (data: { conversationId: string; userId: string; messageId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            readBy: msg.readBy.includes(data.userId) ? msg.readBy : [...msg.readBy, data.userId],
          })),
        )
      }
    })

    newSocket.on("error", (error: { message: string }) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    })

    return () => {
      newSocket.disconnect()
    }
  }, [conversationId, currentUserId, toast])

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages`)

      if (!response.ok) {
        throw new Error("Error al cargar mensajes")
      }

      const data = await response.json()
      setMessages(data.messages)

      // Marcar mensajes como leídos
      if (data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1]
        markAsRead(lastMessage.id)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return

    socket.emit("send_message", {
      conversationId,
      content: newMessage.trim(),
    })

    setNewMessage("")
    stopTyping()
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    if (!socket) return

    if (!isTyping) {
      setIsTyping(true)
      socket.emit("typing", { conversationId, isTyping: true })
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Establecer nuevo timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }

  const stopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false)
      socket.emit("typing", { conversationId, isTyping: false })
    }
  }

  const markAsRead = (messageId: string) => {
    if (socket) {
      socket.emit("mark_read", { conversationId, messageId })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isMessageRead = (message: Message) => {
    return message.sender.id === currentUserId || message.readBy.includes(otherUser.id)
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header del chat */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={otherUser.image || "/placeholder.svg"} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUser.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {otherUser.isOnline ? (
                  <Badge variant="secondary" className="text-green-600">
                    En línea
                  </Badge>
                ) : (
                  `Visto por última vez ${new Date(otherUser.lastSeen).toLocaleString()}`
                )}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Área de mensajes */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${message.sender.id === currentUserId ? "order-2" : "order-1"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.sender.id === currentUserId ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{message.content}</p>
                      {message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <img
                              key={index}
                              src={attachment || "/placeholder.svg"}
                              alt={`Adjunto ${index + 1}`}
                              className="max-w-full h-auto rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-gray-500 ${
                        message.sender.id === currentUserId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {message.sender.id === currentUserId && (
                        <span className="ml-2">{isMessageRead(message) ? "✓✓" : "✓"}</span>
                      )}
                    </div>
                  </div>
                  {message.sender.id !== currentUserId && (
                    <Avatar className="w-8 h-8 order-1 mr-2">
                      <AvatarImage src={message.sender.image || "/placeholder.svg"} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input de mensaje */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
