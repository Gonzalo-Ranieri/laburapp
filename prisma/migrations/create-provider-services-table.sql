-- Crear tabla de servicios de proveedores
CREATE TABLE "ProviderService" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "priceType" TEXT NOT NULL DEFAULT 'fixed',
    "categoryId" TEXT NOT NULL,
    "subcategory" TEXT,
    "duration" INTEGER, -- duración estimada en minutos
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT[],
    "tags" TEXT[],
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderService_pkey" PRIMARY KEY ("id")
);

-- Crear índices
CREATE INDEX "ProviderService_providerId_idx" ON "ProviderService"("providerId");
CREATE INDEX "ProviderService_categoryId_idx" ON "ProviderService"("categoryId");
CREATE INDEX "ProviderService_isActive_idx" ON "ProviderService"("isActive");

-- Agregar foreign keys
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
