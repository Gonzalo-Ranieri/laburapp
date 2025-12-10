# Revisión de Variables de Entorno - LaburApp

## Variables Actuales Analizadas

### 1. Variables de Base de Datos (REDUNDANTES - NECESITA LIMPIEZA)

#### Variables Principales de Supabase (MANTENER):
- `DATABASE_URL` - URL principal de conexión a la base de datos
- `POSTGRES_URL` - URL de PostgreSQL (pooled)
- `POSTGRES_URL_NON_POOLING` - URL sin pooling para operaciones específicas

#### Variables Redundantes de Supabase (ELIMINAR):
- `POSTGRES_PRISMA_URL` - Duplica POSTGRES_URL
- `DATABASE_URL_UNPOOLED` - Duplica POSTGRES_URL_NON_POOLING
- `POSTGRES_URL_NO_SSL` - No se usa en el código
- `PGHOST` - Redundante, se extrae de DATABASE_URL
- `PGHOST_UNPOOLED` - Redundante
- `PGUSER` - Redundante, se extrae de DATABASE_URL
- `PGPASSWORD` - Redundante, se extrae de DATABASE_URL
- `PGDATABASE` - Redundante, se extrae de DATABASE_URL
- `POSTGRES_USER` - Duplica PGUSER
- `POSTGRES_PASSWORD` - Duplica PGPASSWORD
- `POSTGRES_DATABASE` - Duplica PGDATABASE
- `POSTGRES_HOST` - Duplica PGHOST

#### Variables con Prefijo SUPABASE (LIMPIAR):
- `SUPABASE_SUPABASE_URL` → `SUPABASE_URL`
- `SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SUPABASE_ANON_KEY` → `SUPABASE_ANON_KEY`
- `SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SUPABASE_JWT_SECRET` → `SUPABASE_JWT_SECRET`

### 2. Variables de Autenticación (MANTENER)
- `JWT_SECRET` - Clave secreta para JWT
- `NEXTAUTH_SECRET` - Para NextAuth (si se usa)
- `NEXTAUTH_URL` - URL base para NextAuth

### 3. Variables de la Aplicación (MANTENER)
- `NEXT_PUBLIC_APP_URL` - URL pública de la aplicación
- `NODE_ENV` - Entorno de ejecución
- `CI` - Indicador de entorno CI/CD

### 4. Variables de Mercado Pago (MANTENER)
- `MERCADOPAGO_ACCESS_TOKEN` - Token de acceso de Mercado Pago
- `MERCADOPAGO_PUBLIC_KEY` - Clave pública (falta agregar)

### 5. Variables Faltantes (AGREGAR)

#### Push Notifications:
- `VAPID_PUBLIC_KEY` - Clave pública VAPID para push notifications
- `VAPID_PRIVATE_KEY` - Clave privada VAPID
- `VAPID_SUBJECT` - Sujeto VAPID (email o URL)

#### Redis Cache:
- `REDIS_HOST` - Host de Redis
- `REDIS_PORT` - Puerto de Redis
- `REDIS_PASSWORD` - Contraseña de Redis
- `REDIS_DB` - Base de datos Redis

#### Backup Service:
- `BACKUP_ENABLED` - Habilitar backups automáticos
- `BACKUP_SCHEDULE` - Programación cron para backups
- `BACKUP_RETENTION_DAILY` - Días de retención
- `BACKUP_RETENTION_WEEKLY` - Semanas de retención
- `BACKUP_RETENTION_MONTHLY` - Meses de retención
- `BACKUP_COMPRESSION` - Habilitar compresión
- `BACKUP_ENCRYPTION` - Habilitar encriptación
- `BACKUP_LOCAL_ENABLED` - Backup local habilitado
- `BACKUP_LOCAL_PATH` - Ruta de backups locales

#### Monitoring:
- `MONITORING_ENABLED` - Habilitar monitoreo del sistema
- `ALERT_EMAIL` - Email para alertas
- `ALERT_SLACK_WEBHOOK` - Webhook de Slack para alertas

#### Demo Mode:
- `DEMO_MODE` - Modo demostración

### 6. Variables Obsoletas (ELIMINAR)
- Todas las variables duplicadas mencionadas arriba
- Variables con prefijos redundantes

## Resumen de Acciones Requeridas

### ELIMINAR (Variables Redundantes):
- POSTGRES_PRISMA_URL
- DATABASE_URL_UNPOOLED
- POSTGRES_URL_NO_SSL
- PGHOST, PGHOST_UNPOOLED
- PGUSER, PGPASSWORD, PGDATABASE
- POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE, POSTGRES_HOST
- Variables SUPABASE con doble prefijo

### MANTENER (Variables Esenciales):
- DATABASE_URL
- POSTGRES_URL
- POSTGRES_URL_NON_POOLING
- JWT_SECRET
- NEXT_PUBLIC_APP_URL
- MERCADOPAGO_ACCESS_TOKEN
- Variables de Supabase limpias

### AGREGAR (Variables Faltantes):
- Variables de Push Notifications
- Variables de Redis
- Variables de Backup
- Variables de Monitoring
- MERCADOPAGO_PUBLIC_KEY
\`\`\`

\`\`\`plaintext file=".env"
# =============================================================================
# LABURAPP - VARIABLES DE ENTORNO (DESARROLLO)
# =============================================================================

# -----------------------------------------------------------------------------
# BASE DE DATOS (SUPABASE)
# -----------------------------------------------------------------------------
DATABASE_URL="postgresql://postgres.uuidukjaffqtybgmzplj:LaburApp2024!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
POSTGRES_URL="postgresql://postgres.uuidukjaffqtybgmzplj:LaburApp2024!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://postgres.uuidukjaffqtybgmzplj:LaburApp2024!@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# -----------------------------------------------------------------------------
# SUPABASE
# -----------------------------------------------------------------------------
SUPABASE_URL="https://uuidukjaffqtybgmzplj.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://uuidukjaffqtybgmzplj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aWR1a2phZmZxdHliZ216cGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTYwNTcsImV4cCI6MjA2NzczMjA1N30.YoDB5HlSuwrsTo-X5NM-cG3rwN1Ji6SUDTKyAVkW7iM"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aWR1a2phZmZxdHliZ216cGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTYwNTcsImV4cCI6MjA2NzczMjA1N30.YoDB5HlSuwrsTo-X5NM-cG3rwN1Ji6SUDTKyAVkW7iM"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aWR1a2phZmZxdHliZ216cGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE1NjA1NywiZXhwIjoyMDY3NzMyMDU3fQ.44seZ5qIDs5d1YZfVOwOx3frZqdWmfx1j5nCuYSTy7Y"
SUPABASE_JWT_SECRET="laburapp_jwt_secret_2024"

# -----------------------------------------------------------------------------
# AUTENTICACIÓN
# -----------------------------------------------------------------------------
JWT_SECRET="laburapp_super_secret_key_2024_development"
NEXTAUTH_SECRET="laburapp_nextauth_secret_2024_development"
NEXTAUTH_URL="http://localhost:3000"

# -----------------------------------------------------------------------------
# APLICACIÓN
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
DEMO_MODE="true"

# -----------------------------------------------------------------------------
# MERCADO PAGO
# -----------------------------------------------------------------------------
MERCADOPAGO_ACCESS_TOKEN="TEST-your-access-token-here"
MERCADOPAGO_PUBLIC_KEY="TEST-your-public-key-here"

# -----------------------------------------------------------------------------
# PUSH NOTIFICATIONS (VAPID)
# -----------------------------------------------------------------------------
VAPID_PUBLIC_KEY="your-vapid-public-key-here"
VAPID_PRIVATE_KEY="your-vapid-private-key-here"
VAPID_SUBJECT="mailto:admin@laburapp.com"

# -----------------------------------------------------------------------------
# REDIS CACHE
# -----------------------------------------------------------------------------
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"

# -----------------------------------------------------------------------------
# BACKUP SERVICE
# -----------------------------------------------------------------------------
BACKUP_ENABLED="false"
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAILY="7"
BACKUP_RETENTION_WEEKLY="4"
BACKUP_RETENTION_MONTHLY="12"
BACKUP_COMPRESSION="true"
BACKUP_ENCRYPTION="false"
BACKUP_LOCAL_ENABLED="true"
BACKUP_LOCAL_PATH="./backups"

# -----------------------------------------------------------------------------
# MONITORING Y ALERTAS
# -----------------------------------------------------------------------------
MONITORING_ENABLED="false"
ALERT_EMAIL="admin@laburapp.com"
ALERT_SLACK_WEBHOOK=""

# -----------------------------------------------------------------------------
# DESARROLLO (Solo para desarrollo local)
# -----------------------------------------------------------------------------
CI="false"
