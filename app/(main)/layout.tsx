import type React from "react"
/**
 * Layout para las páginas principales con navegación
 *
 * Este layout incluye la navegación principal y el pie de página,
 * y se aplica a todas las páginas dentro del grupo (main).
 */
import { MainNavigation } from "@/components/layout/main-navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MainNavigation />
      {children}
      <BottomNavigation />
    </>
  )
}
