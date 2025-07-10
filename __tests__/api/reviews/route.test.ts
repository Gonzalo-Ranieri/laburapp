import { POST, GET } from "@/app/api/reviews/route"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/db", () => ({
  executeQuery: jest.fn(),
}))

jest.mock("@/lib/auth", () => ({
  getUserFromToken: jest.fn(),
}))

import { executeQuery } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

describe("/api/reviews", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST", () => {
    it("should create review successfully", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" }
      const mockServiceRequest = {
        id: "request-1",
        status: "COMPLETED",
        clientId: "user-1",
        providerId: "provider-1",
      }
      const mockReview = {
        id: "review-1",
        requestId: "request-1",
        userId: "user-1",
        providerId: "provider-1",
        rating: 5,
        comment: "Excelente servicio",
      }
      ;(getUserFromToken as jest.Mock).mockResolvedValueOnce(mockUser)
      ;(executeQuery as jest.Mock)
        .mockResolvedValueOnce([mockServiceRequest]) // Verificar solicitud
        .mockResolvedValueOnce([mockReview]) // Crear reseña
        .mockResolvedValueOnce([{ average_rating: 4.5, review_count: 10 }]) // Stats del proveedor
        .mockResolvedValueOnce([]) // Actualizar proveedor
        .mockResolvedValueOnce([]) // Crear notificación

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          requestId: "request-1",
          rating: 5,
          comment: "Excelente servicio",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe("review-1")
      expect(data.rating).toBe(5)
    })

    it("should return 401 for unauthorized user", async () => {
      ;(getUserFromToken as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          requestId: "request-1",
          rating: 5,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe("No autorizado")
    })

    it("should return 400 for invalid rating", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" }
      ;(getUserFromToken as jest.Mock).mockResolvedValueOnce(mockUser)

      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          requestId: "request-1",
          rating: 6, // Rating inválido
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain("calificación (1-5) son requeridos")
    })
  })

  describe("GET", () => {
    it("should get reviews with pagination", async () => {
      const mockReviews = [
        {
          id: "review-1",
          rating: 5,
          comment: "Excelente",
          user_name: "Juan",
          createdAt: "2023-01-01",
        },
      ]
      ;(executeQuery as jest.Mock)
        .mockResolvedValueOnce(mockReviews) // Reviews
        .mockResolvedValueOnce([{ count: "1" }]) // Count

      const request = new NextRequest("http://localhost:3000/api/reviews?providerId=provider-1&limit=10&offset=0")

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reviews).toHaveLength(1)
      expect(data.pagination.total).toBe(1)
    })
  })
})
