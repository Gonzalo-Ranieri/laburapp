import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CreateReviewForm } from "@/components/reviews/create-review-form"
import jest from "jest"

jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe("CreateReviewForm", () => {
  const defaultProps = {
    requestId: "request-1",
    providerName: "Juan Pérez",
    serviceType: "Plomería",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it("renders review form correctly", () => {
    render(<CreateReviewForm {...defaultProps} />)

    expect(screen.getByText("Califica tu experiencia")).toBeInTheDocument()
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument()
    expect(screen.getByText("Plomería")).toBeInTheDocument()
    expect(screen.getByLabelText(/calificación/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comentario/i)).toBeInTheDocument()
  })

  it("allows selecting star rating", async () => {
    const user = userEvent.setup()
    render(<CreateReviewForm {...defaultProps} />)

    const stars = screen.getAllByRole("button")
    const fourthStar = stars.find((button) => button.querySelector("svg"))

    if (fourthStar) {
      await user.click(fourthStar)
      // Verificar que las estrellas se iluminen
      expect(fourthStar.querySelector("svg")).toHaveClass("text-yellow-500")
    }
  })

  it("submits review successfully", async () => {
    const user = userEvent.setup()
    const mockResponse = {
      ok: true,
      json: async () => ({ id: "review-1", rating: 5 }),
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<CreateReviewForm {...defaultProps} />)

    // Seleccionar 5 estrellas
    const stars = screen.getAllByRole("button")
    const fifthStar = stars[4] // Asumiendo que las estrellas son los primeros 5 botones
    await user.click(fifthStar)

    // Escribir comentario
    const commentTextarea = screen.getByLabelText(/comentario/i)
    await user.type(commentTextarea, "Excelente servicio, muy profesional")

    // Enviar reseña
    const submitButton = screen.getByRole("button", { name: /enviar reseña/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: "request-1",
          rating: 5,
          comment: "Excelente servicio, muy profesional",
          images: [],
        }),
      })
    })
  })

  it("shows error when submitting without rating", async () => {
    const user = userEvent.setup()
    render(<CreateReviewForm {...defaultProps} />)

    const submitButton = screen.getByRole("button", { name: /enviar reseña/i })
    await user.click(submitButton)

    // El botón debería estar deshabilitado sin rating
    expect(submitButton).toBeDisabled()
  })
})
