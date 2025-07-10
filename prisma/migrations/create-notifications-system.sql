-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- REQUEST, PAYMENT, REVIEW, CHAT, SYSTEM, PROMOTION
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB DEFAULT '{}',
  "read" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Crear tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "email" BOOLEAN NOT NULL DEFAULT true,
  "push" BOOLEAN NOT NULL DEFAULT true,
  "sms" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "NotificationPreference_userId_type_unique" UNIQUE ("userId", "type")
);

-- Crear tabla de tokens de push notifications
CREATE TABLE IF NOT EXISTS "PushToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "platform" TEXT NOT NULL, -- WEB, ANDROID, IOS
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PushToken_token_unique" UNIQUE ("token")
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX IF NOT EXISTS "PushToken_userId_idx" ON "PushToken"("userId");
CREATE INDEX IF NOT EXISTS "PushToken_isActive_idx" ON "PushToken"("isActive");

-- Insertar preferencias por defecto para tipos de notificación
INSERT INTO "NotificationPreference" ("id", "userId", "type", "email", "push", "sms")
SELECT 
  gen_random_uuid(),
  u.id,
  notification_type.type,
  CASE 
    WHEN notification_type.type IN ('REQUEST', 'PAYMENT') THEN true
    ELSE false
  END,
  true,
  false
FROM "User" u
CROSS JOIN (
  VALUES 
    ('REQUEST'),
    ('PAYMENT'),
    ('REVIEW'),
    ('CHAT'),
    ('SYSTEM'),
    ('PROMOTION')
) AS notification_type(type)
ON CONFLICT ("userId", "type") DO NOTHING;
