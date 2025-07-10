import { test, expect } from "@playwright/test"

test.describe("Performance Tests", () => {
  test("homepage should load within performance budget", async ({ page }) => {
    const startTime = Date.now()

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const loadTime = Date.now() - startTime

    // La página debe cargar en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000)

    // Verificar métricas de Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcp = entries.find((entry) => entry.entryType === "largest-contentful-paint")
          const fid = entries.find((entry) => entry.entryType === "first-input")
          const cls = entries.find((entry) => entry.entryType === "layout-shift")

          resolve({
            lcp: lcp?.startTime,
            fid: fid?.processingStart - fid?.startTime,
            cls: cls?.value,
          })
        }).observe({ entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"] })
      })
    })

    // LCP debe ser menor a 2.5 segundos
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500)
    }

    // FID debe ser menor a 100ms
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100)
    }

    // CLS debe ser menor a 0.1
    if (metrics.cls) {
      expect(metrics.cls).toBeLessThan(0.1)
    }
  })

  test("search page should handle large result sets efficiently", async ({ page }) => {
    await page.goto("/search?q=servicios")

    const startTime = Date.now()
    await page.waitForSelector("[data-testid=provider-card]")
    const renderTime = Date.now() - startTime

    // Los resultados deben renderizarse en menos de 1 segundo
    expect(renderTime).toBeLessThan(1000)

    // Verificar que se implementó lazy loading
    const visibleCards = await page.locator("[data-testid=provider-card]").count()
    expect(visibleCards).toBeLessThanOrEqual(20) // Máximo 20 cards iniciales
  })
})
