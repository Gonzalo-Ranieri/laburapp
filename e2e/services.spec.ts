import { test, expect } from "@playwright/test"

test.describe("Service Request Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login como usuario
    await page.goto("/login")
    await page.fill("[data-testid=email-input]", "client@example.com")
    await page.fill("[data-testid=password-input]", "password123")
    await page.click("[data-testid=submit-button]")
    await expect(page).toHaveURL("/dashboard")
  })

  test("should search and request a service", async ({ page }) => {
    // Buscar servicio
    await page.fill("[data-testid=search-input]", "plomería")
    await page.click("[data-testid=search-button]")

    await expect(page).toHaveURL(/\/search/)
    await expect(page.locator('text=Resultados para "plomería"')).toBeVisible()

    // Seleccionar proveedor
    await page.click("[data-testid=provider-card]:first-child")
    await expect(page.locator("text=Solicitar Servicio")).toBeVisible()

    // Llenar formulario de solicitud
    await page.fill("[data-testid=description-textarea]", "Necesito reparar una tubería que gotea")
    await page.selectOption("[data-testid=urgency-select]", "MEDIUM")

    // Enviar solicitud
    await page.click("[data-testid=submit-request-button]")

    await expect(page.locator("text=Solicitud enviada exitosamente")).toBeVisible()
  })

  test("should complete service and leave review", async ({ page }) => {
    // Ir a servicios activos
    await page.click("text=Servicios Activos")
    await expect(page).toHaveURL("/active")

    // Marcar servicio como completado
    await page.click("[data-testid=complete-service-button]:first-child")
    await page.click("text=Confirmar")

    // Dejar reseña
    await expect(page.locator("text=Califica tu experiencia")).toBeVisible()

    // Seleccionar 5 estrellas
    await page.click("[data-testid=star-5]")

    // Escribir comentario
    await page.fill("[data-testid=review-comment]", "Excelente servicio, muy profesional")

    // Enviar reseña
    await page.click("[data-testid=submit-review-button]")

    await expect(page.locator("text=Reseña enviada exitosamente")).toBeVisible()
  })
})
