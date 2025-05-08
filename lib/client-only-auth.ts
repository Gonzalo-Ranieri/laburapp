/**
 * Sistema de autenticación del lado del cliente para el modo de demostración
 *
 * Este módulo proporciona funcionalidades de autenticación que funcionan
 * completamente en el cliente, sin necesidad de llamadas al servidor.
 * Es ideal para entornos de vista previa o demostración.
 */

import { demoUsers } from "./demo-mode"

/**
 * Tipo para la información del usuario autenticado
 */
export type AuthUser = {
  id: string
  email: string
  name: string
  role?: string
  image?: string
  providerProfile?: any
}

/**
 * Verifica las credenciales del usuario contra los usuarios de demostración
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Información del usuario si las credenciales son válidas, null en caso contrario
 */
export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
  // Simular un retraso de red para una experiencia más realista
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Buscar el usuario por email (ignorando mayúsculas/minúsculas)
  const user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

  // Si no se encuentra el usuario o la contraseña no coincide, devolver null
  if (!user || user.password !== password) {
    console.log("Credenciales inválidas:", { email, providedPassword: password })
    console.log("Usuario encontrado:", user)
    return null
  }

  console.log("Usuario autenticado:", user.name)

  // Devolver la información del usuario sin la contraseña
  const { password: _, ...userInfo } = user
  return userInfo as AuthUser
}

/**
 * Guarda la información del usuario en localStorage
 * @param user - Información del usuario a guardar
 */
export function saveUserToStorage(user: AuthUser): void {
  try {
    localStorage.setItem("auth_user", JSON.stringify(user))
    localStorage.setItem("auth_timestamp", Date.now().toString())
  } catch (error) {
    console.error("Error al guardar usuario en localStorage:", error)
  }
}

/**
 * Obtiene la información del usuario desde localStorage
 * @returns Información del usuario si existe, null en caso contrario
 */
export function getUserFromStorage(): AuthUser | null {
  try {
    const userJson = localStorage.getItem("auth_user")
    if (!userJson) return null
    return JSON.parse(userJson) as AuthUser
  } catch (error) {
    console.error("Error al obtener usuario de localStorage:", error)
    return null
  }
}

/**
 * Elimina la información del usuario de localStorage
 */
export function removeUserFromStorage(): void {
  try {
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_timestamp")
  } catch (error) {
    console.error("Error al eliminar usuario de localStorage:", error)
  }
}

/**
 * Verifica si el usuario está autenticado
 * @returns true si el usuario está autenticado, false en caso contrario
 */
export function isAuthenticated(): boolean {
  return getUserFromStorage() !== null
}

/**
 * Cierra la sesión del usuario eliminando su información de localStorage
 */
export async function logout(): Promise<void> {
  // Simular un retraso de red para una experiencia más realista
  await new Promise((resolve) => setTimeout(resolve, 500))
  removeUserFromStorage()
}

/**
 * Obtiene todos los usuarios de demostración (sin contraseñas)
 * Útil para depuración y administración
 */
export function getAllDemoUsers(): Omit<(typeof demoUsers)[0], "password">[] {
  return demoUsers.map(({ password, ...user }) => user)
}
