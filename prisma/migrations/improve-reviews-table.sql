-- Añadir columna de imágenes a la tabla Review
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';

-- Crear tabla para votos útiles en reseñas
CREATE TABLE IF NOT EXISTS "ReviewHelpful" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ReviewHelpful_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReviewHelpful_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE,
  CONSTRAINT "ReviewHelpful_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ReviewHelpful_reviewId_userId_unique" UNIQUE ("reviewId", "userId")
);

-- Crear tabla para reportes de reseñas
CREATE TABLE IF NOT EXISTS "ReviewReport" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE,
  CONSTRAINT "ReviewReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Crear tabla para respuestas a reseñas
CREATE TABLE IF NOT EXISTS "ReviewResponse" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ReviewResponse_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReviewResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE,
  CONSTRAINT "ReviewResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ReviewResponse_reviewId_unique" UNIQUE ("reviewId")
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "Review_providerId_idx" ON "Review"("providerId");
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating");
