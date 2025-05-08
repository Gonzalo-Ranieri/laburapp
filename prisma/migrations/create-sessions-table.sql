-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Añadir índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Añadir foreign key
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
