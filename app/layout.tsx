import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Footer } from "@/components/layout/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "LaburApp - Conectamos personas con profesionales",
    template: "%s | LaburApp",
  },
  description:
    "Encuentra y contrata los mejores profesionales para cualquier servicio. Plomeros, electricistas, limpieza, jardinería y más.",
  keywords: ["servicios", "profesionales", "plomeros", "electricistas", "limpieza", "jardinería", "Argentina"],
  authors: [{ name: "LaburApp" }],
  creator: "LaburApp",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://laburapp.com",
    title: "LaburApp - Conectamos personas con profesionales",
    description: "Encuentra y contrata los mejores profesionales para cualquier servicio.",
    siteName: "LaburApp",
  },
  twitter: {
    card: "summary_large_image",
    title: "LaburApp - Conectamos personas con profesionales",
    description: "Encuentra y contrata los mejores profesionales para cualquier servicio.",
    creator: "@laburapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
