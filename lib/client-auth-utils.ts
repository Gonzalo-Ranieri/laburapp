// Funciones para manejar la autenticación del lado del cliente

// Guardar token en localStorage
export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

// Obtener token de localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Eliminar token de localStorage
export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

// Decodificar token JWT (sin verificación)
export function getUserFromToken(): any | null {
  try {
    const token = getToken()
    if (!token) return null

    // Decodificar el payload del token (segunda parte)
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decodificando token:", error)
    return null
  }
}

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false

  try {
    // Verificar si el token ha expirado
    const decodedToken: any = getUserFromToken()
    if (!decodedToken) return false

    const currentTime = Date.now() / 1000
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      // Token expirado, eliminarlo
      removeToken()
      return false
    }

    return true
  } catch (error) {
    console.error("Error al verificar autenticación:", error)
    removeToken()
    return false
  }
}

// Verificar si el usuario es proveedor
export function isProvider(): boolean {
  const user = getUserFromToken()
  return user?.isProvider === true
}
