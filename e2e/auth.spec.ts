import { test, expect } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should login successfully", async ({ page }) => {
    // Navegar a login
    await page.click("text=Iniciar Sesión")
    await expect(page).toHaveURL("/login")

    // Llenar formulario
    await page.fill("[data-testid=email-input]", "test@example.com")
    await page.fill("[data-testid=password-input]", "password123")

    // Enviar formulario
    await page.click("[data-testid=submit-button]")

    // Verificar redirección exitosa
    await expect(page).toHaveURL("/dashboard")
    await expect(page.locator("text=Bienvenido")).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.click("text=Iniciar Sesión")

    await page.fill("[data-testid=email-input]", "invalid@example.com")
    await page.fill("[data-testid=password-input]", "wrongpassword")

    await page.click("[data-testid=submit-button]")

    await expect(page.locator("text=Credenciales inválidas")).toBeVisible()
  })

  test("should register new user", async ({ page }) => {
    await page.click("text=Registrarse")
    await expect(page).toHaveURL("/register")

    await page.fill("[data-testid=name-input]", "Nuevo Usuario")
    await page.fill("[data-testid=email-input]", "nuevo@example.com")
    await page.fill("[data-testid=password-input]", "password123")
    await page.fill("[data-testid=confirm-password-input]", "password123")

    await page.click("[data-testid=submit-button]")

    await expect(page).toHaveURL("/dashboard")
  })
})
