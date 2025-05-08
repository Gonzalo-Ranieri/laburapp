"use client"

import { UserProfile } from "@/components/user-profile"

/**
 * Página de perfil de usuario
 *
 * Esta página muestra el perfil del usuario, incluyendo su información personal,
 * preferencias, historial de pagos y opciones de configuración.
 */
export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <section>
        <h1 className="text-2xl font-bold mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
      </section>

      {/* Componente principal de perfil de usuario */}
      <UserProfile />
    </div>
  )
}
