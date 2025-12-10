import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUserFromRequest } from "@/lib/auth"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// POST: Crear reporte/denuncia
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      type, // USER, SERVICE_REQUEST, REVIEW, MESSAGE
      targetId, // ID del elemento reportado
      reason,
      description,
      evidence = [], // URLs de imágenes/archivos como evidencia
      severity = "MEDIUM", // LOW, MEDIUM, HIGH, CRITICAL
    } = body

    // Validaciones
    if (!type || !targetId || !reason) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Verificar que el target existe según el tipo
    let targetExists = false
    let targetInfo: any = {}

    switch (type) {
      case "USER":
        const targetUser = await prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, name: true, email: true },
        })
        targetExists = !!targetUser
        targetInfo = targetUser
        break

      case "SERVICE_REQUEST":
        const serviceRequest = await prisma.serviceRequest.findUnique({
          where: { id: targetId },
          include: {
            client: { select: { id: true, name: true } },
            provider: { select: { id: true, name: true } },
          },
        })
        targetExists = !!serviceRequest
        targetInfo = serviceRequest
        break

      case "REVIEW":
        const review = await prisma.review.findUnique({
          where: { id: targetId },
          include: {
            user: { select: { id: true, name: true } },
            provider: { select: { id: true, name: true } },
          },
        })
        targetExists = !!review
        targetInfo = review
        break

      case "MESSAGE":
        const message = await prisma.message.findUnique({
          where: { id: targetId },
          include: {
            sender: { select: { id: true, name: true } },
            conversation: { select: { id: true, type: true } },
          },
        })
        targetExists = !!message
        targetInfo = message
        break
    }

    if (!targetExists) {
      return NextResponse.json({ error: "Elemento reportado no encontrado" }, { status: 404 })
    }

    // Verificar que el usuario no esté reportando algo propio (excepto en casos específicos)
    if (type === "USER" && targetId === user.id) {
      return NextResponse.json({ error: "No puedes reportarte a ti mismo" }, { status: 400 })
    }

    // Crear el reporte
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        type,
        targetId,
        reason,
        description,
        evidence,
        severity,
        status: "PENDING",
        metadata: {
          targetInfo,
          reporterInfo: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get("user-agent"),
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        },
      },
    })

    // Crear notificación para moderadores
    const moderators = await prisma.user.findMany({
      where: { role: "ADMIN" }, // Asumiendo que tienes un campo role
      select: { id: true },
    })

    for (const moderator of moderators) {
      await prisma.notification.create({
        data: {
          userId: moderator.id,
          type: "MODERATION",
          title: "Nuevo reporte recibido",
          message: `Reporte de ${type.toLowerCase()} por ${reason}`,
          data: {
            reportId: report.id,
            reportType: type,
            severity,
            reporterId: user.id,
          },
          priority: severity === "CRITICAL" ? "URGENT" : severity === "HIGH" ? "HIGH" : "NORMAL",
        },
      })
    }

    // Auto-moderación para casos críticos
    if (severity === "CRITICAL") {
      await handleCriticalReport(report, targetInfo, type)
    }

    return NextResponse.json(
      {
        report: {
          id: report.id,
          status: report.status,
          createdAt: report.createdAt,
        },
        message: "Reporte enviado correctamente. Será revisado por nuestro equipo.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creando reporte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET: Obtener reportes (solo para moderadores)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const status = url.searchParams.get("status") || ""
    const type = url.searchParams.get("type") || ""
    const severity = url.searchParams.get("severity") || ""

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type
    if (severity) where.severity = severity

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          moderator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ])

    // Estadísticas de reportes
    const stats = await prisma.report.groupBy({
      by: ["status", "type", "severity"],
      _count: { id: true },
    })

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: stats.reduce(
          (acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + s._count.id
            return acc
          },
          {} as Record<string, number>,
        ),
        byType: stats.reduce(
          (acc, s) => {
            acc[s.type] = (acc[s.type] || 0) + s._count.id
            return acc
          },
          {} as Record<string, number>,
        ),
        bySeverity: stats.reduce(
          (acc, s) => {
            acc[s.severity] = (acc[s.severity] || 0) + s._count.id
            return acc
          },
          {} as Record<string, number>,
        ),
      },
    })
  } catch (error) {
    console.error("Error obteniendo reportes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para manejar reportes críticos
async function handleCriticalReport(report: any, targetInfo: any, type: string) {
  try {
    switch (type) {
      case "USER":
        // Suspender temporalmente al usuario reportado
        await prisma.user.update({
          where: { id: report.targetId },
          data: {
            status: "SUSPENDED",
            suspendedAt: new Date(),
            suspensionReason: `Reporte crítico: ${report.reason}`,
          },
        })
        break

      case "SERVICE_REQUEST":
        // Cancelar la solicitud de servicio
        await prisma.serviceRequest.update({
          where: { id: report.targetId },
          data: {
            status: "CANCELLED",
            cancelledReason: `Reporte crítico: ${report.reason}`,
          },
        })
        break

      case "REVIEW":
        // Ocultar la reseña
        await prisma.review.update({
          where: { id: report.targetId },
          data: {
            hidden: true,
            hiddenReason: `Reporte crítico: ${report.reason}`,
          },
        })
        break
    }

    // Actualizar el reporte como procesado automáticamente
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: "AUTO_RESOLVED",
        resolvedAt: new Date(),
        resolution: "Acción automática tomada debido a la severidad crítica del reporte",
      },
    })
  } catch (error) {
    console.error("Error en auto-moderación:", error)
  }
}
