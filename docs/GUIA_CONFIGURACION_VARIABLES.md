# Guía de Configuración de Variables de Entorno - LaburApp

## 📋 Resumen de Cambios Realizados

### ✅ Variables Eliminadas (Redundantes)
- `POSTGRES_PRISMA_URL` → Duplicaba `POSTGRES_URL`
- `DATABASE_URL_UNPOOLED` → Duplicaba `POSTGRES_URL_NON_POOLING`
- `POSTGRES_URL_NO_SSL` → No se usaba en el código
- `PGHOST`, `PGHOST_UNPOOLED` → Se extraen de `DATABASE_URL`
- `PGUSER`, `PGPASSWORD`, `PGDATABASE` → Se extraen de `DATABASE_URL`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, `POSTGRES_HOST` → Duplicados
- Variables Supabase con doble prefijo → Simplificadas

### ✅ Variables Reorganizadas
- `SUPABASE_SUPABASE_URL` → `SUPABASE_URL`
- `SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SUPABASE_ANON_KEY` → `SUPABASE_ANON_KEY`
- `SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SUPABASE_JWT_SECRET` → `SUPABASE_JWT_SECRET`

### ✅ Variables Agregadas
- Variables de Push Notifications (VAPID)
- Variables de Redis Cache
- Variables de Backup Service
- Variables de Monitoring
- `MERCADOPAGO_PUBLIC_KEY`

## 🔧 Configuración por Categoría

### 1. Base de Datos (Supabase)
\`\`\`env
# Conexión principal (con pooling)
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true"
POSTGRES_URL="postgresql://user:pass@host:port/db?pgbouncer=true"

# Conexión sin pooling (para operaciones específicas)
POSTGRES_URL_NON_POOLING="postgresql://user:pass@host:port/db"
\`\`\`

### 2. Supabase
\`\`\`env
# URLs públicas
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"

# Claves de autenticación
SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"
\`\`\`

### 3. Autenticación
\`\`\`env
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"
\`\`\`

### 4. Aplicación
\`\`\`env
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
DEMO_MODE="false"
\`\`\`

### 5. Mercado Pago
\`\`\`env
MERCADOPAGO_ACCESS_TOKEN="PROD-your-token"
MERCADOPAGO_PUBLIC_KEY="PROD-your-public-key"
\`\`\`

### 6. Push Notifications
\`\`\`env
# Generar con: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:admin@yourdomain.com"
\`\`\`

### 7. Redis Cache (Opcional)
\`\`\`env
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"
REDIS_DB="0"
\`\`\`

### 8. Backup Service (Opcional)
\`\`\`env
BACKUP_ENABLED="true"
BACKUP_SCHEDULE="0 2 * * *"  # Diario a las 2 AM
BACKUP_RETENTION_DAILY="30"
BACKUP_COMPRESSION="true"
\`\`\`

### 9. Monitoring (Opcional)
\`\`\`env
MONITORING_ENABLED="true"
ALERT_EMAIL="admin@yourdomain.com"
ALERT_SLACK_WEBHOOK="https://hooks.slack.com/..."
\`\`\`

## 🚀 Pasos para Configurar

### 1. Desarrollo Local
\`\`\`bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables necesarias
nano .env
\`\`\`

### 2. Producción (Vercel)
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las variables de `.env.production`
4. Redeploy la aplicación

### 3. Generar Claves VAPID
\`\`\`bash
npm install -g web-push
npx web-push generate-vapid-keys
\`\`\`

### 4. Configurar Redis (Upstash)
1. Crear cuenta en [Upstash](https://upstash.com)
2. Crear base de datos Redis
3. Copiar credenciales a variables de entorno

## ⚠️ Variables Críticas que DEBES Configurar

### Mínimas para Funcionamiento Básico:
- `DATABASE_URL`
- `POSTGRES_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Para Funcionalidades Completas:
- `MERCADOPAGO_ACCESS_TOKEN` (pagos)
- `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` (notificaciones push)
- `REDIS_HOST` (cache y rendimiento)

## 🔒 Seguridad

### Variables Sensibles (NUNCA commitear):
- `JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `VAPID_PRIVATE_KEY`
- `REDIS_PASSWORD`

### Variables Públicas (Seguras para frontend):
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📝 Notas Importantes

1. **Prefijo NEXT_PUBLIC_**: Solo para variables que necesitan estar disponibles en el frontend
2. **Modo Demo**: `DEMO_MODE="true"` para desarrollo, `"false"` para producción
3. **Backup**: Configurar solo si necesitas backups automáticos
4. **Monitoring**: Configurar solo si necesitas alertas del sistema
5. **Redis**: Opcional pero recomendado para mejor rendimiento

## 🆘 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas

### Error de conexión a base de datos
- Verificar `DATABASE_URL` y `POSTGRES_URL`
- Comprobar que las credenciales sean correctas

### Push notifications no funcionan
- Generar nuevas claves VAPID
- Verificar que `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` estén configuradas

### Pagos no funcionan
- Verificar `MERCADOPAGO_ACCESS_TOKEN`
- Usar tokens TEST- para desarrollo, PROD- para producción
