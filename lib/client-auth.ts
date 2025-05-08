// Funciones de autenticación del lado del cliente

// Guardar información del usuario en localStorage
export function saveUserToLocalStorage(user: any) {
  if (typeof window !== "undefined") {
    try {
      // Asegurarse de que el objeto user es válido
      if (!user || typeof user !== "object") {
        console.error("Error: Intentando guardar un usuario inválido en localStorage", user)
        return
      }

      // Guardar en localStorage
      const userJson = JSON.stringify(user)
      localStorage.setItem("user", userJson)
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("lastAuthCheck", Date.now().toString())

      // También guardar en sessionStorage para persistencia entre pestañas
      sessionStorage.setItem("user", userJson)
      sessionStorage.setItem("isLoggedIn", "true")

      console.log("Usuario guardado en localStorage y sessionStorage:", user.name || user.email)
    } catch (error) {
      console.error("Error al guardar usuario en localStorage:", error)
    }
  }
}

// Obtener información del usuario desde localStorage
export function getUserFromLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      // Primero intentar obtener de sessionStorage (más reciente)
      let userJson = sessionStorage.getItem("user")

      // Si no está en sessionStorage, intentar localStorage
      if (!userJson) {
        userJson = localStorage.getItem("user")
      }

      if (!userJson) return null
      return JSON.parse(userJson)
    } catch (error) {
      console.error("Error al obtener usuario de localStorage:", error)
      return null
    }
  }
  return null
}

// Eliminar información del usuario de localStorage
export function removeUserFromLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("lastAuthCheck")

      // También limpiar sessionStorage
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("isLoggedIn")
    } catch (error) {
      console.error("Error al eliminar usuario de localStorage:", error)
    }
  }
}

// Verificar si el usuario está autenticado
export function isAuthenticated() {
  if (typeof window !== "undefined") {
    // Verificar primero si hay una cookie de autenticación
    const hasAuthCookie = document.cookie.includes("auth_status=authenticated")

    // Verificar si hay información en localStorage/sessionStorage
    const isLoggedInStorage =
      localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true"

    const user = getUserFromLocalStorage()
    const hasUser = !!user && typeof user === "object" && !!user.id

    console.log("Verificación de autenticación:", {
      hasAuthCookie,
      isLoggedInStorage,
      hasUser,
    })

    return (hasAuthCookie || isLoggedInStorage) && hasUser
  }
  return false
}

// Obtener el tiempo del último chequeo de autenticación
export function getLastAuthCheck() {
  if (typeof window !== "undefined") {
    const lastCheck = localStorage.getItem("lastAuthCheck")
    return lastCheck ? Number.parseInt(lastCheck) : 0
  }
  return 0
}

// Actualizar el tiempo del último chequeo de autenticación
export function updateLastAuthCheck() {
  if (typeof window !== "undefined") {
    localStorage.setItem("lastAuthCheck", Date.now().toString())
  }
}
