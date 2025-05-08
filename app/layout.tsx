import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LaburApp - Servicios a domicilio",
  description: "Conectamos profesionales de oficios con clientes que necesitan servicios a domicilio",
    generator: 'v0.dev'
}

/**
 * Layout principal de la aplicación
 *
 * Este componente define la estructura básica de todas las páginas,
 * incluyendo proveedores de contexto y elementos UI globales.
 * La navegación principal y el pie de página se manejan en componentes separados
 * para evitar duplicación.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
