"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function createProviderService(formData: FormData) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No autorizado" }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return { success: false, error: "Token inválido" }
    }

    // Buscar el proveedor del usuario
    const provider = await prisma.provider.findUnique({
      where: { userId: payload.userId },
    })

    if (!provider) {
      return { success: false, error: "Proveedor no encontrado" }
    }

    // Extraer datos del formulario
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const serviceTypeId = formData.get("serviceTypeId") as string
    const price = formData.get("price") as string
    const priceType = formData.get("priceType") as string
    const duration = formData.get("duration") as string
    const subcategory = formData.get("subcategory") as string
    const requirements = formData.get("requirements") as string
    const tags = formData.get("tags") as string

    // Validaciones
    if (!name || !description || !serviceTypeId || !price) {
      return { success: false, error: "Campos requeridos faltantes" }
    }

    // Procesar tags
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    // Crear el servicio
    const service = await prisma.providerService.create({
      data: {
        providerId: provider.id,
        serviceTypeId,
        name,
        description,
        price: Number.parseFloat(price),
        priceType: (priceType as any) || "FIXED",
        duration: duration ? Number.parseInt(duration) : null,
        subcategory: subcategory || null,
        tags: tagsArray,
        requirements: requirements || null,
        images: [],
        isActive: true,
      },
    })

    revalidatePath("/provider/services")
    return { success: true, service }
  } catch (error) {
    console.error("Error creando servicio:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function updateProviderService(serviceId: string, formData: FormData) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No autorizado" }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return { success: false, error: "Token inválido" }
    }

    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await prisma.providerService.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    })

    if (!existingService) {
      return { success: false, error: "Servicio no encontrado" }
    }

    if (existingService.provider.userId !== payload.userId) {
      return { success: false, error: "No autorizado" }
    }

    // Extraer datos del formulario
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const serviceTypeId = formData.get("serviceTypeId") as string
    const price = formData.get("price") as string
    const priceType = formData.get("priceType") as string
    const duration = formData.get("duration") as string
    const subcategory = formData.get("subcategory") as string
    const requirements = formData.get("requirements") as string
    const tags = formData.get("tags") as string

    // Procesar tags
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    // Actualizar el servicio
    const service = await prisma.providerService.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        serviceTypeId,
        price: Number.parseFloat(price),
        priceType: priceType as any,
        duration: duration ? Number.parseInt(duration) : null,
        subcategory: subcategory || null,
        tags: tagsArray,
        requirements: requirements || null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/provider/services")
    return { success: true, service }
  } catch (error) {
    console.error("Error actualizando servicio:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function deleteProviderService(serviceId: string) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No autorizado" }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return { success: false, error: "Token inválido" }
    }

    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await prisma.providerService.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    })

    if (!existingService) {
      return { success: false, error: "Servicio no encontrado" }
    }

    if (existingService.provider.userId !== payload.userId) {
      return { success: false, error: "No autorizado" }
    }

    // Eliminar el servicio
    await prisma.providerService.delete({
      where: { id: serviceId },
    })

    revalidatePath("/provider/services")
    return { success: true, message: "Servicio eliminado exitosamente" }
  } catch (error) {
    console.error("Error eliminando servicio:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function toggleServiceStatus(serviceId: string) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No autorizado" }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return { success: false, error: "Token inválido" }
    }

    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await prisma.providerService.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    })

    if (!existingService) {
      return { success: false, error: "Servicio no encontrado" }
    }

    if (existingService.provider.userId !== payload.userId) {
      return { success: false, error: "No autorizado" }
    }

    // Cambiar el estado
    const service = await prisma.providerService.update({
      where: { id: serviceId },
      data: {
        isActive: !existingService.isActive,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/provider/services")
    return { success: true, service }
  } catch (error) {
    console.error("Error cambiando estado del servicio:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function getProviderServices() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return { success: false, error: "No autorizado" }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return { success: false, error: "Token inválido" }
    }

    // Buscar el proveedor del usuario
    const provider = await prisma.provider.findUnique({
      where: { userId: payload.userId },
    })

    if (!provider) {
      return { success: false, error: "Proveedor no encontrado" }
    }

    // Obtener servicios del proveedor
    const services = await prisma.providerService.findMany({
      where: { providerId: provider.id },
      include: {
        serviceType: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, services }
  } catch (error) {
    console.error("Error obteniendo servicios:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}
