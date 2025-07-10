import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LaburApp",
  description: "Plataforma on-demand de servicios profesionales",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.className}>
      <body>
        {/*  Envoltura global con AuthProvider y cualquier otro provider futuro */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
