import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import jest from "jest"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Mock de la base de datos
jest.mock("@/lib/db", () => ({
  executeQuery: jest.fn(),
}))

// Mock de bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}))

// Mock de JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}))

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should login successfully with valid credentials", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      password: "hashedpassword",
      name: "Test User",
      isActive: true,
    }
    ;(executeQuery as jest.Mock).mockResolvedValueOnce([mockUser])
    ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
    ;(jwt.sign as jest.Mock).mockReturnValueOnce("mock-token")

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.token).toBe("mock-token")
    expect(data.user.email).toBe("test@example.com")
    expect(data.user.password).toBeUndefined()
  })

  it("should return 400 for missing email", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        password: "password123",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain("Email y contraseña son requeridos")
  })

  it("should return 401 for invalid credentials", async () => {
    ;(executeQuery as jest.Mock).mockResolvedValueOnce([])

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Credenciales inválidas")
  })

  it("should return 401 for inactive user", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      password: "hashedpassword",
      name: "Test User",
      isActive: false,
    }
    ;(executeQuery as jest.Mock).mockResolvedValueOnce([mockUser])
    ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(true)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Cuenta desactivada")
  })
})
