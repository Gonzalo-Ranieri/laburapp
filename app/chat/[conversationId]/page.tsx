"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip } from "lucide-react"
import Link from "next/link"

interface ChatPageProps {
  params: {
    conversationId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "1",
      senderId: "other",
      content: "Hola! Vi tu solicitud de servicio de electricidad. ¿Podrías darme más detalles sobre el trabajo?",
      timestamp: new Date(Date.now() - 3600000),
      read: true,
    },
    {
      id: "2",
      senderId: "me",
      content: "Hola Carlos! Necesito instalar 3 enchufes nuevos en la cocina y revisar el tablero eléctrico.",
      timestamp: new Date(Date.now() - 3500000),
      read: true,
    },
    {
      id: "3",
      senderId: "other",
      content:
        "Perfecto. ¿Cuándo te vendría bien que vaya a hacer una evaluación? Estoy disponible mañana por la tarde.",
      timestamp: new Date(Date.now() - 3400000),
      read: true,
    },
    {
      id: "4",
      senderId: "me",
      content: "Mañana a las 15:00 me viene perfecto. ¿Cuánto calculas que puede costar?",
      timestamp: new Date(Date.now() - 3300000),
      read: true,
    },
    {
      id: "5",
      senderId: "other",
      content: "Para los 3 enchufes serían unos $4,500 y la revisión del tablero $2,000. Total aproximado $6,500.",
      timestamp: new Date(Date.now() - 3200000),
      read: false,
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        senderId: "me",
        content: message,
        timestamp: new Date(),
        read: false,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Datos del contacto (normalmente vendrían de una API)
  const contact = {
    id: "carlos-rodriguez",
    name: "Carlos Rodríguez",
    service: "Electricista",
    image: "/placeholder.svg?height=40&width=40",
    online: true,
    lastSeen: "Hace 5 minutos",
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/chat">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Avatar>
                <AvatarImage src={contact.image || "/placeholder.svg"} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{contact.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{contact.service}</p>
                  {contact.online && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      En línea
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md ${msg.senderId === "me" ? "order-2" : "order-1"}`}>
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.senderId === "me" ? "bg-emerald-500 text-white" : "bg-white border"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              <p className={`text-xs text-muted-foreground mt-1 ${msg.senderId === "me" ? "text-right" : "text-left"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {msg.senderId === "me" && <span className="ml-1">{msg.read ? "✓✓" : "✓"}</span>}
              </p>
            </div>
            {msg.senderId !== "me" && (
              <Avatar className="h-8 w-8 order-1 mr-2">
                <AvatarImage src={contact.image || "/placeholder.svg"} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
