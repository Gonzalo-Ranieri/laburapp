"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import prisma from "@/lib/db"

interface JwtPayload {
  id: string
  email: string
}

async function getUserId() {
  const token = cookies().get("token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload
    return decoded.id
  } catch (error) {
    return null
  }
}

export async function requestService(formData: FormData) {
  const userId = await getUserId()
  if (!userId) {
    redirect("/login")
  }

  const serviceTypeId = formData.get("serviceTypeId") as string
  const providerId = formData.get("providerId") as string
  const description = formData.get("description") as string
  const address = formData.get("address") as string
  const scheduledDate = formData.get("scheduledDate") as string
  const images = formData.getAll("images") as string[]

  if (!serviceTypeId || !description || !address || !scheduledDate) {
    return { error: "Todos los campos son requeridos" }
  }

  try {
    await prisma.serviceRequest.create({
      data: {
        clientId: userId,
        providerId: providerId || undefined,
        serviceTypeId,
        description,
        address,
        scheduledDate: new Date(scheduledDate),
        images: images.filter(Boolean),
      },
    })

    revalidatePath("/active")
    redirect("/active")
  } catch (error) {
    console.error("Error al crear solicitud:", error)
    return { error: "Error al crear solicitud" }
  }
}

export async function updateRequestStatus(requestId: string, status: string) {
  const userId = await getUserId()
  if (!userId) {
    redirect("/login")
  }

  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return { error: "Solicitud no encontrada" }
    }

    // Verificar permisos
    const isClient = request.clientId === userId
    const isProvider = request.providerId === userId

    if (!isClient && !isProvider) {
      return { error: "No autorizado" }
    }

    // Validar transiciones de estado
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    }

    if (request.status !== status && !allowedTransitions[request.status].includes(status)) {
      return { error: "Transición de estado no permitida" }
    }

    // Verificar permisos específicos por estado
    if (status === "ACCEPTED" && !isProvider) {
      return { error: "Solo el proveedor puede aceptar solicitudes" }
    }

    if (status === "IN_PROGRESS" && !isProvider) {
      return { error: "Solo el proveedor puede iniciar el servicio" }
    }

    if (status === "COMPLETED" && !isProvider) {
      return { error: "Solo el proveedor puede completar el servicio" }
    }

    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: status as any },
    })

    revalidatePath("/active")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    return { error: "Error al actualizar estado" }
  }
}

export async function createReview(formData: FormData) {
  const userId = await getUserId()
  if (!userId) {
    redirect("/login")
  }

  const requestId = formData.get("requestId") as string
  const rating = Number.parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string

  if (!requestId || !rating || rating < 1 || rating > 5) {
    return { error: "ID de solicitud y calificación (1-5) son requeridos" }
  }

  try {
    // Verificar que la solicitud exista y esté completada
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { review: true },
    })

    if (!serviceRequest) {
      return { error: "Solicitud no encontrada" }
    }

    if (serviceRequest.status !== "COMPLETED") {
      return { error: "Solo se pueden reseñar servicios completados" }
    }

    if (serviceRequest.clientId !== userId) {
      return { error: "Solo el cliente puede dejar una reseña" }
    }

    if (serviceRequest.review) {
      return { error: "Ya existe una reseña para esta solicitud" }
    }

    if (!serviceRequest.providerId) {
      return { error: "La solicitud no tiene un proveedor asignado" }
    }

    // Crear reseña
    await prisma.review.create({
      data: {
        requestId,
        userId,
        providerId: serviceRequest.providerId,
        rating,
        comment,
      },
    })

    // Actualizar calificación promedio del proveedor
    const providerReviews = await prisma.review.findMany({
      where: { providerId: serviceRequest.providerId },
    })

    const totalRating = providerReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / providerReviews.length

    await prisma.provider.update({
      where: { userId: serviceRequest.providerId },
      data: {
        rating: averageRating,
        reviewCount: providerReviews.length,
      },
    })

    revalidatePath("/active")
    return { success: true }
  } catch (error) {
    console.error("Error al crear reseña:", error)
    return { error: "Error al crear reseña" }
  }
}
