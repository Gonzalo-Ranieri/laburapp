import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginForm } from "@/components/auth/login-form"
import jest from "jest" // Import jest to declare the variable

// Mock del hook useToast
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it("renders login form correctly", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, "invalid-email")

    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it("submits form with valid credentials", async () => {
    const user = userEvent.setup()
    const mockResponse = {
      ok: true,
      json: async () => ({
        token: "mock-token",
        user: { id: "1", email: "test@example.com", name: "Test User" },
      }),
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "password123")
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      })
    })
  })

  it("handles login error correctly", async () => {
    const user = userEvent.setup()
    const mockResponse = {
      ok: false,
      json: async () => ({ error: "Credenciales inválidas" }),
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "wrongpassword")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })

  it("shows loading state during submission", async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    ;(global.fetch as jest.Mock).mockReturnValueOnce(mockPromise)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "password123")
    await user.click(submitButton)

    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolver la promesa
    resolvePromise!({
      ok: true,
      json: async () => ({ token: "mock-token", user: {} }),
    })
  })
})
