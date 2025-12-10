import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET: Obtener usuario específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo puede ver su propio perfil o ser admin
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: {
          select: {
            id: true,
            bio: true,
            rating: true,
            reviewCount: true,
            isAvailable: true,
            price: true,
            serviceType: {
              select: {
                id: true,
                name: true,
                icon: true,
                description: true,
              },
            },
            services: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                priceType: true,
                isActive: true,
              },
              where: { isActive: true },
            },
          },
        },
        _count: {
          select: {
            clientRequests: true,
            providerServices: true,
            reviews: true,
            receivedReviews: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar usuario
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo puede actualizar su propio perfil
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, phone, address, image, currentPassword, newPassword } = body

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (address !== undefined) updateData.address = address || null
    if (image !== undefined) updateData.image = image || null

    // Si se quiere cambiar la contraseña
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Contraseña actual requerida" }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, existingUser.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })
      }

      // Encriptar nueva contraseña
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUserFromRequest(request)

    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo puede eliminar su propio perfil
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        clientRequests: true,
        providerServices: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar si tiene solicitudes activas
    const activeRequests = await prisma.serviceRequest.count({
      where: {
        OR: [{ clientId: params.id }, { providerId: params.id }],
        status: {
          in: ["PENDING", "ACCEPTED", "IN_PROGRESS"],
        },
      },
    })

    if (activeRequests > 0) {
      return NextResponse.json({ error: "No se puede eliminar la cuenta con solicitudes activas" }, { status: 400 })
    }

    // Eliminar usuario (cascade eliminará relaciones)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
