import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ChatInterface } from "@/components/chat/chat-interface"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock de Socket.IO
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
}

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket),
}))

describe("Chat Integration", () => {
  const defaultProps = {
    conversationId: "conv-1",
    otherUser: {
      id: "user-2",
      name: "María García",
      image: "/avatar.jpg",
      isOnline: true,
      lastSeen: "2023-01-01T00:00:00Z",
    },
    currentUserId: "user-1",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it("should load and display messages", async () => {
    const mockMessages = [
      {
        id: "msg-1",
        content: "Hola, ¿cómo estás?",
        sender: { id: "user-2", name: "María García", image: "/avatar.jpg" },
        createdAt: "2023-01-01T10:00:00Z",
        readBy: ["user-1"],
      },
      {
        id: "msg-2",
        content: "Muy bien, gracias",
        sender: { id: "user-1", name: "Juan Pérez", image: "/avatar2.jpg" },
        createdAt: "2023-01-01T10:01:00Z",
        readBy: ["user-2"],
      },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messages: mockMessages,
        pagination: { total: 2, limit: 50, offset: 0, pages: 1 },
      }),
    })

    render(<ChatInterface {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText("Hola, ¿cómo estás?")).toBeInTheDocument()
      expect(screen.getByText("Muy bien, gracias")).toBeInTheDocument()
    })
  })

  it("should send message via socket", async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [], pagination: { total: 0 } }),
    })

    render(<ChatInterface {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/escribe un mensaje/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/escribe un mensaje/i)
    const sendButton = screen.getByRole("button", { name: /send/i })

    await user.type(input, "Nuevo mensaje de prueba")
    await user.click(sendButton)

    expect(mockSocket.emit).toHaveBeenCalledWith("send_message", {
      conversationId: "conv-1",
      content: "Nuevo mensaje de prueba",
    })
  })

  it("should handle typing indicators", async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [], pagination: { total: 0 } }),
    })

    render(<ChatInterface {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/escribe un mensaje/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/escribe un mensaje/i)
    await user.type(input, "Escribiendo...")

    expect(mockSocket.emit).toHaveBeenCalledWith("typing", {
      conversationId: "conv-1",
      isTyping: true,
    })
  })
})
