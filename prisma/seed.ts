import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...")

  // Crear tipos de servicio
  const serviceTypes = await Promise.all([
    prisma.serviceType.upsert({
      where: { name: "Plomería" },
      update: {},
      create: {
        name: "Plomería",
        icon: "wrench",
        description: "Servicios de plomería y fontanería",
      },
    }),
    prisma.serviceType.upsert({
      where: { name: "Electricidad" },
      update: {},
      create: {
        name: "Electricidad",
        icon: "zap",
        description: "Servicios eléctricos y instalaciones",
      },
    }),
    prisma.serviceType.upsert({
      where: { name: "Limpieza" },
      update: {},
      create: {
        name: "Limpieza",
        icon: "sparkles",
        description: "Servicios de limpieza doméstica y comercial",
      },
    }),
    prisma.serviceType.upsert({
      where: { name: "Jardinería" },
      update: {},
      create: {
        name: "Jardinería",
        icon: "leaf",
        description: "Servicios de jardinería y paisajismo",
      },
    }),
  ])

  // Crear usuarios de prueba
  const hashedPassword = await bcrypt.hash("Password123!", 10)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@laburapp.com" },
      update: {},
      create: {
        name: "Administrador",
        email: "admin@laburapp.com",
        password: hashedPassword,
        phone: "+54 11 1234-5678",
      },
    }),
    prisma.user.upsert({
      where: { email: "proveedor1@laburapp.com" },
      update: {},
      create: {
        name: "Juan Pérez",
        email: "proveedor1@laburapp.com",
        password: hashedPassword,
        phone: "+54 11 2345-6789",
      },
    }),
    prisma.user.upsert({
      where: { email: "cliente1@laburapp.com" },
      update: {},
      create: {
        name: "María García",
        email: "cliente1@laburapp.com",
        password: hashedPassword,
        phone: "+54 11 3456-7890",
      },
    }),
  ])

  // Crear proveedores
  const providers = await Promise.all([
    prisma.provider.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        serviceTypeId: serviceTypes[0].id,
        bio: "Plomero con 10 años de experiencia",
        price: "$$",
        rating: 4.8,
        reviewCount: 25,
        isAvailable: true,
      },
    }),
  ])

  console.log("✅ Seed completado exitosamente")
  console.log(
    `📊 Creados: ${serviceTypes.length} tipos de servicio, ${users.length} usuarios, ${providers.length} proveedores`,
  )
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
