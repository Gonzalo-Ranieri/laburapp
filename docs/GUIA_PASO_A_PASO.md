# 🚀 GUÍA PASO A PASO - COMPLETAR LABURAPP

**Objetivo**: Llevar Laburapp de estado actual a producción lista para lanzamiento  
**Tiempo estimado**: 6-8 semanas  
**Última actualización**: Diciembre 2024

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Lo que YA está funcionando:
- Estructura base de Next.js con App Router
- UI completa con shadcn/ui y Tailwind
- Schema de base de datos completo (Prisma)
- Componentes de frontend: búsqueda, mapas, perfiles, servicios
- Sistema de pagos con Mercado Pago (código base)
- Sistema de escrow y confirmaciones
- Geolocalización y tracking
- Páginas legales básicas

### ❌ Lo que FALTA (crítico):
- Row Level Security (RLS) en base de datos
- Autenticación Supabase integrada
- Variables de entorno configuradas
- Mercado Pago en producción
- Sistema de notificaciones (email/push)
- API keys de mapas
- Testing completo
- Optimización de performance

---

## 🎯 FASE 1: SEGURIDAD Y AUTENTICACIÓN (Semana 1-2)

### PRIORIDAD MÁXIMA: No lanzar sin esto completado

### Paso 1.1: Configurar Variables de Entorno de Supabase

**Tiempo estimado**: 30 minutos

1. **Obtener credenciales de Supabase**:
   - Ve a tu proyecto en Supabase Dashboard
   - Navega a Settings > API
   - Copia las siguientes variables:

2. **Configurar en Vercel**:
   \`\`\`bash
   # En tu terminal local
   vercel env add SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   \`\`\`

3. **Configurar localmente**:
   - Actualiza tu archivo `.env` con los valores correctos
   - Las variables `NEXT_PUBLIC_*` deben tener el mismo valor que sus contrapartes

**Verificación**:
\`\`\`bash
# Debe mostrar tu URL de Supabase
echo $SUPABASE_URL
\`\`\`

---

### Paso 1.2: Habilitar Row Level Security (RLS)

**Tiempo estimado**: 2 horas  
**CRÍTICO**: Sin esto, tu app es INSEGURA

**Qué hacer**:

1. **Crear script de migración de RLS**:
   - Voy a crear un script SQL completo
   - Lo ejecutarás directamente en Supabase

2. **Ejecutar el script**:
   - Ve a Supabase Dashboard > SQL Editor
   - Copia y pega el contenido del script
   - Ejecuta

3. **Verificar que funciona**:
   - Intenta acceder a datos de otro usuario
   - Debe ser bloqueado por RLS

**Script que voy a crear**: `scripts/enable-rls.sql`

---

### Paso 1.3: Migrar a Supabase Auth

**Tiempo estimado**: 6-8 horas  
**Complejidad**: Media-Alta

**Qué vamos a hacer**:
1. Reemplazar sistema JWT manual por Supabase Auth
2. Actualizar middleware para usar Supabase SSR
3. Migrar componentes de login/registro
4. Actualizar todas las referencias a auth

**Pasos detallados**:

#### A. Actualizar configuración de Supabase
\`\`\`bash
# Ya tenemos los archivos base, los actualizaremos
# - lib/supabase/client.ts
# - lib/supabase/server.ts (nuevo)
# - middleware.ts
\`\`\`

#### B. Migrar usuarios existentes (si los hay)
- Script para hashear contraseñas con Supabase
- Importar a tabla auth.users

#### C. Actualizar componentes de auth
- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`
- `app/api/auth/*` (eliminar rutas manuales)

#### D. Actualizar middleware
- Protección automática de rutas
- Refresh de tokens
- Redirección a login

**Te guiaré en cada paso cuando lleguemos aquí**

---

### Paso 1.4: Actualizar Configuración de Seguridad

**Tiempo estimado**: 1 hora

**Qué hacer**:

1. **Configurar CORS en Supabase**:
   - Agregar tu dominio a allowed origins
   - Configurar en Settings > API

2. **Configurar cookies seguras**:
   - HTTPOnly
   - Secure (solo HTTPS)
   - SameSite

3. **Rate limiting**:
   - Configurar límites por IP
   - Configurar límites por usuario

**Checklist de verificación**:
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de RLS testeadas
- [ ] Auth de Supabase funcionando
- [ ] Login y registro funcionando
- [ ] Refresh de tokens automático
- [ ] Middleware protegiendo rutas
- [ ] Cookies seguras configuradas
- [ ] Rate limiting activo

---

## 💳 FASE 2: SISTEMA DE PAGOS (Semana 3)

### Paso 2.1: Configurar Mercado Pago en Producción

**Tiempo estimado**: 2-3 horas

**Pre-requisitos**:
- Cuenta de Mercado Pago verificada
- CUIT/CUIL
- Cuenta bancaria asociada

**Pasos**:

1. **Obtener credenciales de producción**:
   \`\`\`
   - Ve a: https://www.mercadopago.com.ar/developers
   - Tu aplicación > Credenciales
   - Copia:
     * Access Token de Producción
     * Public Key de Producción
   \`\`\`

2. **Configurar en Vercel**:
   \`\`\`bash
   vercel env add MERCADOPAGO_ACCESS_TOKEN production
   vercel env add NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY production
   \`\`\`

3. **Actualizar webhooks**:
   - URL del webhook: `https://tudominio.com/api/payments/webhook`
   - Configurar en panel de Mercado Pago
   - Eventos a escuchar: payment, merchant_order

4. **Configurar split de pagos** (comisión de plataforma):
   - Implementar marketplace fee
   - Configurar % de comisión (recomendado: 10-15%)

---

### Paso 2.2: Implementar Sistema de Comisiones

**Tiempo estimado**: 4 horas

**Qué hacer**:

1. **Definir modelo de comisión**:
   \`\`\`typescript
   // Ejemplo: 10% para la plataforma
   const PLATFORM_FEE = 0.10;
   
   // Distribución:
   // - 90% al proveedor
   // - 10% a la plataforma
   \`\`\`

2. **Actualizar creación de pagos**:
   - Usar `application_fee` en preferencias
   - Configurar cuentas de marketplace

3. **Agregar dashboard de ingresos**:
   - Gráficos de comisiones
   - Totales por período
   - Exportación para contabilidad

---

### Paso 2.3: Testing de Pagos

**Tiempo estimado**: 3 horas

**Flujo de testing**:

1. **En Sandbox (desarrollo)**:
   \`\`\`
   Tarjetas de prueba Mercado Pago:
   - Aprobada: 5031 7557 3453 0604
   - Rechazada: 5031 4332 1540 6351
   \`\`\`

2. **En Producción (con montos pequeños)**:
   - Realizar 5-10 transacciones de prueba
   - Verificar escrow
   - Verificar liberación de fondos
   - Verificar reembolsos

3. **Casos de prueba**:
   - [ ] Pago exitoso
   - [ ] Pago rechazado
   - [ ] Reembolso completo
   - [ ] Reembolso parcial
   - [ ] Timeout de confirmación
   - [ ] Liberación automática de escrow

**Checklist de verificación**:
- [ ] Mercado Pago configurado en producción
- [ ] Webhooks funcionando
- [ ] Split de pagos implementado
- [ ] Testing completo realizado
- [ ] Reembolsos funcionando
- [ ] Dashboard de ingresos operativo

---

## 📧 FASE 3: NOTIFICACIONES (Semana 4)

### Paso 3.1: Configurar Servicio de Email

**Tiempo estimado**: 3-4 horas

**Servicio recomendado**: Resend

**Pasos**:

1. **Crear cuenta en Resend**:
   - Ve a: https://resend.com
   - Sign up
   - Verificar dominio de email (opcional pero recomendado)

2. **Obtener API Key**:
   \`\`\`bash
   vercel env add RESEND_API_KEY
   \`\`\`

3. **Instalar dependencia**:
   \`\`\`bash
   npm install resend
   \`\`\`

4. **Configurar dominio de envío**:
   - Si tienes dominio: `notifications@laburapp.com`
   - Si no: usar dominio de Resend `@resend.dev`

---

### Paso 3.2: Crear Templates de Email

**Tiempo estimado**: 4 horas

**Emails necesarios**:

1. **Bienvenida**:
   - Trigger: Registro de usuario
   - Contenido: Bienvenida + guía rápida

2. **Verificación de email**:
   - Trigger: Registro
   - Contenido: Link de verificación

3. **Servicio solicitado**:
   - Trigger: Nueva solicitud
   - Destinatario: Proveedor
   - Contenido: Detalles del servicio + botón de aceptar

4. **Servicio aceptado**:
   - Trigger: Proveedor acepta
   - Destinatario: Cliente
   - Contenido: Datos del proveedor + tracking

5. **Pago recibido**:
   - Trigger: Pago exitoso
   - Destinatario: Cliente y Proveedor
   - Contenido: Detalles del pago + recibo

6. **Confirmación solicitada**:
   - Trigger: Servicio marcado como completado
   - Destinatario: Cliente
   - Contenido: Botón para confirmar + countdown

7. **Pago liberado**:
   - Trigger: Confirmación o auto-release
   - Destinatario: Proveedor
   - Contenido: Fondos disponibles

---

### Paso 3.3: Implementar Push Notifications (Web)

**Tiempo estimado**: 6 horas

**Qué hacer**:

1. **Configurar Service Worker**:
   \`\`\`typescript
   // public/sw.js
   // Manejar notificaciones push
   \`\`\`

2. **Solicitar permisos**:
   \`\`\`typescript
   // Botón para habilitar notificaciones
   // Guardar subscription en BD
   \`\`\`

3. **Enviar notificaciones**:
   \`\`\`typescript
   // Desde backend usando Web Push API
   \`\`\`

**Notificaciones necesarias**:
- Nuevo servicio (proveedor)
- Servicio aceptado (cliente)
- Proveedor en camino
- Mensaje nuevo
- Pago procesado
- Confirmación requerida

---

### Paso 3.4: Sistema de Preferencias

**Tiempo estimado**: 2 horas

**Qué implementar**:

1. **Tabla de preferencias**:
   \`\`\`sql
   CREATE TABLE notification_preferences (
     user_id TEXT PRIMARY KEY,
     email_enabled BOOLEAN DEFAULT TRUE,
     push_enabled BOOLEAN DEFAULT TRUE,
     sms_enabled BOOLEAN DEFAULT FALSE,
     -- Preferencias específicas
     notify_new_service BOOLEAN DEFAULT TRUE,
     notify_messages BOOLEAN DEFAULT TRUE,
     -- etc...
   );
   \`\`\`

2. **UI de configuración**:
   - Toggle para cada tipo de notificación
   - Guardar en BD
   - Respetar preferencias al enviar

**Checklist de verificación**:
- [ ] Resend configurado
- [ ] 7+ templates de email creados
- [ ] Emails enviándose correctamente
- [ ] Push notifications funcionando
- [ ] Service Worker registrado
- [ ] Preferencias de usuario implementadas
- [ ] Testing de todas las notificaciones

---

## 🗺️ FASE 4: MAPAS Y GEOLOCALIZACIÓN (Semana 4)

### Paso 4.1: Elegir y Configurar Servicio de Mapas

**Tiempo estimado**: 2 horas

**Opciones**:

#### Opción A: Mapbox (Recomendado)
**Pros**: 50k cargas gratis, mejor performance, más bonito  
**Contras**: Requiere API key

**Pasos**:
1. Crear cuenta: https://www.mapbox.com
2. Obtener Access Token
3. Configurar:
   \`\`\`bash
   vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
   \`\`\`

#### Opción B: Google Maps
**Pros**: Más conocido, buena documentación  
**Contras**: Más caro después de límite gratis

**Pasos**:
1. Google Cloud Console
2. Habilitar Maps JavaScript API
3. Crear credenciales
4. Configurar:
   \`\`\`bash
   vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   \`\`\`

#### Opción C: OpenStreetMap (Actual)
**Pros**: Gratis, sin API key  
**Contras**: Performance inferior, menos features

---

### Paso 4.2: Optimizar Geolocalización

**Tiempo estimado**: 3 horas

**Mejoras necesarias**:

1. **Throttling de actualizaciones**:
   \`\`\`typescript
   // Actualizar ubicación cada 30 segundos en lugar de cada segundo
   const LOCATION_UPDATE_INTERVAL = 30000;
   \`\`\`

2. **Detener tracking en background**:
   \`\`\`typescript
   // Pausar cuando app pierde foco
   document.addEventListener('visibilitychange', () => {
     if (document.hidden) stopTracking();
   });
   \`\`\`

3. **Usar baja precisión cuando sea posible**:
   \`\`\`typescript
   navigator.geolocation.watchPosition(
     callback,
     error,
     { enableHighAccuracy: false } // Ahorra batería
   );
   \`\`\`

---

### Paso 4.3: Implementar Búsqueda Geográfica

**Tiempo estimado**: 4 horas

**Qué hacer**:

1. **Agregar índices geográficos**:
   \`\`\`sql
   CREATE INDEX idx_provider_location 
   ON "ProviderLocation" (latitude, longitude);
   \`\`\`

2. **Implementar búsqueda por radio**:
   \`\`\`typescript
   // Buscar proveedores en un radio de 5km
   // Usar fórmula de Haversine
   \`\`\`

3. **Agregar filtro de distancia en UI**:
   - Slider: 1km, 5km, 10km, 20km, 50km
   - Mostrar distancia en cards de proveedores

**Checklist de verificación**:
- [ ] Servicio de mapas configurado
- [ ] API key funcionando
- [ ] Mapas cargando rápido
- [ ] Geolocalización optimizada
- [ ] Batería no drena excesivamente
- [ ] Búsqueda por radio funcionando
- [ ] Distancias mostradas correctamente

---

## 📊 FASE 5: ANALYTICS Y MONITOREO (Semana 5)

### Paso 5.1: Configurar Error Tracking con Sentry

**Tiempo estimado**: 2 horas

**Pasos**:

1. **Crear cuenta en Sentry**:
   - https://sentry.io
   - Crear nuevo proyecto Next.js

2. **Instalar SDK**:
   \`\`\`bash
   npx @sentry/wizard@latest -i nextjs
   \`\`\`

3. **Configurar**:
   - El wizard crea archivos automáticamente
   - Configurar environments (dev, staging, prod)
   - Configurar source maps

4. **Testing**:
   \`\`\`typescript
   // Crear error de prueba
   throw new Error("[TEST] Sentry está funcionando!");
   \`\`\`

5. **Configurar alertas**:
   - Slack/Email cuando hay errores críticos
   - Threshold de errores por hora

---

### Paso 5.2: Implementar Analytics

**Tiempo estimado**: 3 horas

**Opción A: Google Analytics 4** (Gratis, completo)

**Pasos**:
1. Crear propiedad GA4
2. Obtener Measurement ID
3. Instalar:
   \`\`\`bash
   npm install @next/third-parties
   \`\`\`
4. Configurar eventos personalizados

**Opción B: Vercel Analytics** (Más simple)

**Pasos**:
1. Habilitar en dashboard de Vercel
2. Instalar:
   \`\`\`bash
   npm install @vercel/analytics
   \`\`\`
3. Agregar al layout

---

### Paso 5.3: Definir Métricas Clave (KPIs)

**Tiempo estimado**: 1 hora

**Métricas críticas a trackear**:

1. **Adquisición**:
   - Registros diarios
   - Conversión visita → registro
   - Fuentes de tráfico

2. **Activación**:
   - % usuarios que solicitan primer servicio
   - % proveedores que completan perfil
   - Tiempo hasta primera acción

3. **Retención**:
   - Usuarios activos diarios (DAU)
   - Usuarios activos mensuales (MAU)
   - Tasa de retención día 1, 7, 30

4. **Ingresos**:
   - GMV (Gross Merchandise Value)
   - Comisiones ganadas
   - Ticket promedio
   - LTV (Lifetime Value)

5. **Engagement**:
   - Servicios solicitados
   - Tasa de aceptación
   - Tasa de completación
   - Rating promedio

**Implementar eventos**:
\`\`\`typescript
// Ejemplos de eventos a trackear
analytics.track('user_registered', { type: 'client' });
analytics.track('service_requested', { category, price });
analytics.track('service_completed', { rating, duration });
\`\`\`

**Checklist de verificación**:
- [ ] Sentry configurado
- [ ] Errores siendo trackeados
- [ ] Source maps funcionando
- [ ] Alertas configuradas
- [ ] Analytics instalado
- [ ] Eventos personalizados implementados
- [ ] Dashboard de métricas creado

---

## 🧪 FASE 6: TESTING (Semana 5-6)

### Paso 6.1: Tests End-to-End con Playwright

**Tiempo estimado**: 8-10 horas

**Setup inicial**:
\`\`\`bash
# Playwright ya está instalado, configurarlo
npx playwright install
\`\`\`

**Tests críticos a escribir**:

#### Test 1: Registro y Login
\`\`\`typescript
// tests/auth.spec.ts
test('usuario puede registrarse y hacer login', async ({ page }) => {
  // 1. Ir a registro
  // 2. Llenar formulario
  // 3. Submit
  // 4. Verificar redirección
  // 5. Logout
  // 6. Login nuevamente
});
\`\`\`

#### Test 2: Solicitud de Servicio Completa
\`\`\`typescript
// tests/service-flow.spec.ts
test('cliente puede solicitar servicio', async ({ page }) => {
  // 1. Login como cliente
  // 2. Buscar servicio
  // 3. Seleccionar proveedor
  // 4. Llenar formulario
  // 5. Confirmar
  // 6. Verificar creación
});
\`\`\`

#### Test 3: Flujo de Pago
\`\`\`typescript
// tests/payment-flow.spec.ts
test('pago completo funciona', async ({ page }) => {
  // 1. Servicio aceptado
  // 2. Ir a pagar
  // 3. Completar pago (sandbox)
  // 4. Verificar estado
  // 5. Verificar escrow
});
\`\`\`

#### Test 4: Confirmación y Liberación
\`\`\`typescript
// tests/escrow-flow.spec.ts
test('confirmación libera fondos', async ({ page }) => {
  // 1. Servicio completado
  // 2. Cliente confirma
  // 3. Verificar liberación
  // 4. Verificar notificaciones
});
\`\`\`

**Ejecutar tests**:
\`\`\`bash
# Todos los tests
npm run test:e2e

# En modo headless (CI)
npm run test:e2e:ci

# Con UI
npx playwright test --ui
\`\`\`

---

### Paso 6.2: Testing Manual Exhaustivo

**Tiempo estimado**: 6-8 horas

**Checklist detallado**:

#### Autenticación:
- [ ] Registro como cliente funciona
- [ ] Registro como proveedor funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Recuperación de contraseña funciona
- [ ] Sesión persiste al refrescar
- [ ] Sesión expira correctamente
- [ ] Protección de rutas funciona

#### Servicios:
- [ ] Búsqueda de servicios funciona
- [ ] Filtros funcionan correctamente
- [ ] Solicitud de servicio funciona
- [ ] Proveedores ven solicitudes
- [ ] Proveedor puede aceptar
- [ ] Cliente recibe notificación
- [ ] Tracking en tiempo real funciona
- [ ] Completar servicio funciona

#### Pagos:
- [ ] Redirección a Mercado Pago funciona
- [ ] Webhook procesa pagos correctamente
- [ ] Escrow retiene fondos
- [ ] Confirmación manual libera fondos
- [ ] Auto-release funciona (24h)
- [ ] Reembolsos funcionan
- [ ] Historial de pagos correcto

#### Notificaciones:
- [ ] Emails llegan correctamente
- [ ] Push notifications funcionan
- [ ] Notificaciones en tiempo real (chat)
- [ ] Preferencias se respetan

#### Responsive:
- [ ] Todo funciona en móvil (iOS Safari)
- [ ] Todo funciona en móvil (Chrome Android)
- [ ] Todo funciona en tablet
- [ ] Todo funciona en desktop

#### Performance:
- [ ] Páginas cargan en < 3 segundos
- [ ] Mapas cargan rápido
- [ ] Imágenes optimizadas
- [ ] Sin memory leaks
- [ ] Sin errores en consola

---

### Paso 6.3: Testing de Seguridad

**Tiempo estimado**: 4 horas

**Pruebas a realizar**:

1. **SQL Injection**:
   \`\`\`
   Intentar: ' OR '1'='1
   En: búsquedas, formularios
   Resultado esperado: Bloqueado
   \`\`\`

2. **XSS (Cross-Site Scripting)**:
   \`\`\`
   Intentar: <script>alert('XSS')</script>
   En: comentarios, descripciones, nombres
   Resultado esperado: Sanitizado
   \`\`\`

3. **CSRF (Cross-Site Request Forgery)**:
   \`\`\`
   Intentar: Enviar request desde otro dominio
   Resultado esperado: Bloqueado por CORS
   \`\`\`

4. **Autenticación**:
   \`\`\`
   - Intentar acceder a /profile sin login → redirect
   - Intentar acceder a datos de otro usuario → 403
   - Intentar modificar datos de otro usuario → 403
   \`\`\`

5. **RLS Testing**:
   \`\`\`sql
   -- En Supabase SQL Editor
   SELECT * FROM "User" WHERE id != auth.uid();
   -- Debe retornar 0 filas
   \`\`\`

**Herramientas**:
- OWASP ZAP
- Burp Suite (versión gratuita)
- Manual testing

**Checklist de verificación**:
- [ ] Tests E2E escritos para flujos críticos
- [ ] Tests pasando en CI/CD
- [ ] Testing manual completo
- [ ] Sin errores críticos
- [ ] Funciona en todos los navegadores
- [ ] Testing de seguridad pasado
- [ ] RLS verificado

---

## 🚀 FASE 7: OPTIMIZACIÓN Y DEPLOY (Semana 6-7)

### Paso 7.1: Optimización de Performance

**Tiempo estimado**: 6 horas

**Tareas**:

1. **Optimizar imágenes**:
   \`\`\`typescript
   // Usar next/image en todas partes
   import Image from 'next/image';
   
   <Image
     src="/provider.jpg"
     alt="Proveedor"
     width={300}
     height={300}
     loading="lazy" // Lazy loading automático
   />
   \`\`\`

2. **Code splitting**:
   \`\`\`typescript
   // Usar dynamic imports
   import dynamic from 'next/dynamic';
   
   const MapView = dynamic(() => import('./map-view'), {
     loading: () => <p>Cargando mapa...</p>,
     ssr: false
   });
   \`\`\`

3. **Reducir bundle size**:
   \`\`\`bash
   # Analizar bundle
   npm run build
   npx @next/bundle-analyzer
   
   # Identificar librerías pesadas
   # Buscar alternativas más ligeras
   \`\`\`

4. **Implementar caching**:
   \`\`\`typescript
   // Agregar headers de cache
   export const revalidate = 3600; // 1 hora
   \`\`\`

---

### Paso 7.2: Configurar CDN y Assets

**Tiempo estimado**: 2 horas

**Qué hacer**:

1. **Vercel CDN** (automático):
   - Ya está configurado
   - Verificar que funciona

2. **Optimizar fonts**:
   \`\`\`typescript
   // En layout.tsx
   import { Inter } from 'next/font/google';
   
   const inter = Inter({ 
     subsets: ['latin'],
     display: 'swap', // Mejora FCP
   });
   \`\`\`

3. **Comprimir assets**:
   - Habilitar compression en Vercel (automático)
   - Verificar con DevTools

---

### Paso 7.3: Configurar Dominio

**Tiempo estimado**: 1 hora

**Pasos**:

1. **Registrar dominio** (si no tienes):
   - Opciones: NIC.ar, Namecheap, GoDaddy
   - Sugerencia: laburapp.com.ar

2. **Configurar en Vercel**:
   \`\`\`
   - Ve a proyecto en Vercel
   - Settings > Domains
   - Add domain
   - Seguir instrucciones de DNS
   \`\`\`

3. **Configurar DNS**:
   \`\`\`
   Tipo  Nombre  Valor
   A     @       76.76.21.21
   CNAME www     cname.vercel-dns.com
   \`\`\`

4. **Esperar propagación** (puede tomar 24-48h)

5. **Verificar SSL**:
   - Vercel provee certificado automático
   - Forzar HTTPS

---

### Paso 7.4: Configurar Ambientes

**Tiempo estimado**: 2 horas

**Ambientes necesarios**:

1. **Development** (local):
   - `.env.local`
   - Base de datos de desarrollo
   - Mercado Pago sandbox

2. **Staging** (preview):
   - Branch: `staging`
   - Base de datos de staging
   - Mercado Pago sandbox
   - Testing de features nuevas

3. **Production**:
   - Branch: `main`
   - Base de datos de producción
   - Mercado Pago producción
   - Solo código testeado

**Configurar en Vercel**:
\`\`\`bash
# Variables por ambiente
vercel env add MERCADOPAGO_ACCESS_TOKEN production
vercel env add MERCADOPAGO_ACCESS_TOKEN preview
vercel env add MERCADOPAGO_ACCESS_TOKEN development
\`\`\`

---

### Paso 7.5: CI/CD Pipeline

**Tiempo estimado**: 3 horas

**Configurar GitHub Actions**:

\`\`\`yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm run test:e2e
\`\`\`

**Proteger branch main**:
- Requerir tests pasando
- Requerir code review
- No permitir push directo

**Checklist de verificación**:
- [ ] Performance optimizado
- [ ] Lighthouse score > 90
- [ ] Bundle size minimizado
- [ ] Imágenes optimizadas
- [ ] Dominio configurado
- [ ] SSL funcionando
- [ ] Ambientes configurados
- [ ] CI/CD funcionando
- [ ] Deploy automático en merges

---

## 📱 FASE 8: PWA Y MÓVIL (Semana 7)

### Paso 8.1: Configurar Progressive Web App

**Tiempo estimado**: 4 horas

**Pasos**:

1. **Crear manifest.json**:
   \`\`\`json
   {
     "name": "LaburApp",
     "short_name": "LaburApp",
     "description": "Servicios a domicilio en Argentina",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#0070f3",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   \`\`\`

2. **Crear Service Worker**:
   \`\`\`javascript
   // public/sw.js
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open('laburapp-v1').then((cache) => {
         return cache.addAll([
           '/',
           '/offline',
         ]);
       })
     );
   });
   \`\`\`

3. **Registrar Service Worker**:
   \`\`\`typescript
   // app/layout.tsx
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js');
     }
   }, []);
   \`\`\`

4. **Generar iconos**:
   - Usar: https://realfavicongenerator.net
   - Subir logo
   - Descargar todos los iconos

---

### Paso 8.2: Optimización Móvil

**Tiempo estimado**: 4 horas

**Mejoras específicas para móvil**:

1. **Mejorar touch targets**:
   \`\`\`css
   /* Mínimo 44x44px para botones */
   .button {
     min-width: 44px;
     min-height: 44px;
   }
   \`\`\`

2. **Mejorar formularios en móvil**:
   \`\`\`html
   <input 
     type="tel" 
     inputmode="numeric"
     autocomplete="tel"
   />
   \`\`\`

3. **Reducir datos móviles**:
   - Cargar imágenes más pequeñas en móvil
   - Deshabilitar auto-play de videos
   - Comprimir respuestas de API

4. **Testing en dispositivos reales**:
   - Pedir prestado o usar BrowserStack
   - Probar en 3G simulado

---

### Paso 8.3: Página Offline

**Tiempo estimado**: 2 horas

**Crear experiencia offline**:

\`\`\`typescript
// app/offline/page.tsx
export default function Offline() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1>Sin conexión</h1>
        <p>Por favor verifica tu conexión a internet</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
\`\`\`

**Checklist de verificación**:
- [ ] Manifest.json configurado
- [ ] Service Worker funcionando
- [ ] App instalable en home screen
- [ ] Iconos de todas las resoluciones
- [ ] Splash screen configurado
- [ ] Funcionalidad offline básica
- [ ] Optimizado para móvil
- [ ] Funciona en 3G

---

## 📝 FASE 9: CONTENIDO Y LEGAL (Semana 7-8)

### Paso 9.1: Revisión Legal

**Tiempo estimado**: Variable (depende de abogado)  
**Costo estimado**: $50,000 - $150,000 ARS

**Documentos a revisar**:

1. **Términos y Condiciones**:
   - Responsabilidades de cada parte
   - Proceso de disputas
   - Cancelaciones y reembolsos
   - Limitación de responsabilidad

2. **Política de Privacidad**:
   - Compliance con Ley 25.326 (Argentina)
   - GDPR (si planeas expandir a Europa)
   - Qué datos recolectas
   - Cómo los usas
   - Cómo los proteges
   - Derechos del usuario

3. **Acuerdo de Proveedores**:
   - Términos específicos para proveedores
   - Comisiones
   - Penalidades
   - Verificación de identidad

**Buscar**:
- Abogado especializado en tecnología/marketplace
- Experiencia con plataformas similares (Rappi, Pedidos Ya, etc.)

---

### Paso 9.2: Configuración Fiscal

**Tiempo estimado**: Variable  
**Requiere**: Contador

**Pasos necesarios**:

1. **Elegir estructura legal**:
   - Monotributo (si ingresos < $X)
   - SRL
   - SA

2. **Registrarse en AFIP**:
   - Obtener CUIT
   - Alta de actividad
   - Facturación electrónica

3. **Configurar facturación**:
   - Sistema de facturación electrónica
   - Integrar con Mercado Pago
   - Reportes mensuales

4. **Contratar contador**:
   - Para declaraciones mensuales
   - Asesoramiento fiscal
   - Optimización impositiva

---

### Paso 9.3: Crear Contenido de Marketing

**Tiempo estimado**: 8-12 horas

**Páginas necesarias**:

1. **Landing page optimizada**:
   - Hero section atractivo
   - Beneficios claros
   - Call-to-action fuerte
   - Testimonios (conseguir 3-5)
   - Sección "Cómo funciona"

2. **Sobre Nosotros**:
   - Historia de LaburApp
   - Misión y visión
   - Equipo
   - Contacto

3. **Blog** (para SEO):
   - 5-10 artículos iniciales
   - Ejemplos:
     * "Cómo contratar un plomero confiable"
     * "Precios de servicios de electricidad en CABA"
     * "Tips para elegir un buen pintor"

4. **Centro de Ayuda**:
   - FAQ extendido
   - Guías paso a paso
   - Videos tutoriales (opcional)

5. **Para Proveedores**:
   - Página específica
   - Beneficios de unirse
   - Proceso de registro
   - Calculadora de ganancias

---

### Paso 9.4: SEO Básico

**Tiempo estimado**: 4 horas

**Optimizaciones**:

1. **Metadata**:
   \`\`\`typescript
   // app/layout.tsx
   export const metadata = {
     title: 'LaburApp - Servicios a domicilio en Argentina',
     description: 'Encuentra plomeros, electricistas, pintores y más...',
     keywords: ['servicios', 'domicilio', 'argentina', 'plomero', ...],
     openGraph: {
       title: 'LaburApp',
       description: '...',
       images: ['/og-image.jpg'],
     },
   };
   \`\`\`

2. **Sitemap**:
   \`\`\`xml
   <!-- public/sitemap.xml -->
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://laburapp.com</loc>
       <lastmod>2024-12-09</lastmod>
       <priority>1.0</priority>
     </url>
     <!-- más URLs -->
   </urlset>
   \`\`\`

3. **Robots.txt**:
   \`\`\`
   User-agent: *
   Allow: /
   
   Sitemap: https://laburapp.com/sitemap.xml
   \`\`\`

4. **Structured Data**:
   \`\`\`json
   {
     "@context": "https://schema.org",
     "@type": "LocalBusiness",
     "name": "LaburApp",
     "description": "...",
     "url": "https://laburapp.com",
     "telephone": "+54-11-xxxx-xxxx"
   }
   \`\`\`

**Checklist de verificación**:
- [ ] Términos revisados por abogado
- [ ] Estructura legal definida
- [ ] Registrado en AFIP
- [ ] Facturación configurada
- [ ] Contenido de marketing creado
- [ ] Blog con primeros artículos
- [ ] SEO básico implementado
- [ ] Google Search Console configurado

---

## 🚦 FASE 10: PRE-LANZAMIENTO (Semana 8)

### Paso 10.1: Beta Testing

**Tiempo estimado**: 1 semana completa

**Proceso**:

1. **Reclutar beta testers**:
   - 10-20 clientes
   - 10-20 proveedores
   - Mix de tech-savvy y no tech-savvy

2. **Darles acceso**:
   - URL de staging
   - Credenciales de prueba
   - Instrucciones claras

3. **Recolectar feedback**:
   \`\`\`
   Formulario con preguntas:
   - ¿Qué te gustó?
   - ¿Qué no te gustó?
   - ¿Algo confuso?
   - ¿Qué falta?
   - ¿Lo usarías? ¿Por qué?
   - ¿Lo recomendarías?
   \`\`\`

4. **Iterar basado en feedback**:
   - Priorizar issues críticos
   - Arreglar bugs
   - Mejorar UX

---

### Paso 10.2: Preparar Proveedores Iniciales

**Tiempo estimado**: 2 semanas (paralelo a beta)

**Objetivo**: Tener 20-30 proveedores listos para el lanzamiento

**Estrategia**:

1. **Reclutar manualmente**:
   - Buscar en Facebook Marketplace
   - Buscar en grupos de servicios
   - Contactar directamente por WhatsApp

2. **Ofrecer incentivos**:
   - Primeros 3 meses sin comisión
   - Badge de "Proveedor Fundador"
   - Prioridad en búsquedas

3. **Onboarding personalizado**:
   - Videollamada explicando la app
   - Ayudarlos a completar perfil
   - Primeros servicios acompañados

4. **Cobertura geográfica**:
   - Asegurar cobertura en zonas clave
   - CABA: todos los barrios
   - GBA: al menos zona norte y oeste

---

### Paso 10.3: Plan de Lanzamiento

**Timing**: Elegir fecha específica

**Checklist pre-lanzamiento** (1 semana antes):

#### Técnico:
- [ ] Todos los tests pasando
- [ ] Performance verificado
- [ ] Backups configurados
- [ ] Monitoreo activo
- [ ] On-call definido (quién responde a emergencias)
- [ ] Rollback plan preparado

#### Negocio:
- [ ] Al menos 20 proveedores activos
- [ ] Proveedores entrenados
- [ ] Políticas claras definidas
- [ ] Proceso de soporte definido
- [ ] Presupuesto de marketing asignado

#### Legal:
- [ ] Documentos legales aprobados
- [ ] Estructura fiscal operativa
- [ ] Seguros necesarios (responsabilidad civil)

#### Marketing:
- [ ] Landing page optimizada
- [ ] Redes sociales creadas (Instagram, Facebook)
- [ ] Material gráfico listo
- [ ] Estrategia de lanzamiento definida
- [ ] Press kit preparado

---

### Paso 10.4: Estrategia de Lanzamiento

**Opción A: Soft Launch** (Recomendado)

**Semana 1**: Solo familiares y amigos
**Semana 2**: Agregar beta testers
**Semana 3**: Abrir a más barrios gradualmente
**Semana 4**: Lanzamiento público completo

**Ventajas**:
- Detectar problemas con poco tráfico
- Ajustar procesos
- Construir reputación gradualmente

**Opción B: Hard Launch**

Lanzamiento público desde día 1 con campaña de marketing.

**Requiere**:
- Mayor presupuesto
- Más proveedores listos
- Sistema más robusto
- Mayor riesgo

---

### Paso 10.5: Plan de Adquisición Inicial

**Presupuesto sugerido**: $100,000 - $500,000 ARS primer mes

**Canales**:

1. **Facebook/Instagram Ads** (60% del presupuesto):
   - Segmentación geográfica (CABA/GBA)
   - Intereses: servicios, hogar, construcción
   - Campañas separadas para clientes y proveedores

2. **Google Ads** (30% del presupuesto):
   - Keywords: "plomero urgente", "electricista caba", etc.
   - Focus en intención alta

3. **Referidos** (10% del presupuesto):
   - Dar $500 al que refiere + $500 al referido
   - Trackear con códigos únicos

4. **Orgánico** (gratis pero lleva tiempo):
   - Postear en grupos de Facebook
   - Subreddit de Argentina
   - Contenido en TikTok/Instagram

**Métricas a trackear**:
- CAC (Costo de Adquisición de Cliente)
- LTV (Lifetime Value)
- ROI por canal
- Conversión por canal

**Checklist de verificación**:
- [ ] Beta testing completado
- [ ] Feedback implementado
- [ ] 20+ proveedores listos
- [ ] Proveedores entrenados
- [ ] Plan de lanzamiento definido
- [ ] Fecha de lanzamiento establecida
- [ ] Presupuesto de marketing asignado
- [ ] Canales de adquisición configurados

---

## 🎉 DÍA DEL LANZAMIENTO

### Checklist Final (Día D - 1):

#### Técnico:
- [ ] Hacer backup completo
- [ ] Verificar todos los servicios
- [ ] Verificar variables de entorno
- [ ] Hacer deploy a producción
- [ ] Testing rápido en producción
- [ ] Monitoreo activo

#### Comunicación:
- [ ] Email a lista de espera (si hay)
- [ ] Post en redes sociales
- [ ] Comunicado de prensa (si aplica)
- [ ] Notificar a proveedores listos

#### Soporte:
- [ ] Equipo disponible todo el día
- [ ] WhatsApp de soporte activo
- [ ] Email monitoreado
- [ ] Plan para emergencias

### Durante el Día del Lanzamiento:

1. **Monitorear constantemente**:
   - Dashboard de Sentry (errores)
   - Dashboard de Vercel (performance)
   - Dashboard de analytics (tráfico)
   - Base de datos (queries lentas)

2. **Estar preparado para**:
   - Picos de tráfico
   - Bugs inesperados
   - Feedback de usuarios
   - Ajustes rápidos

3. **Comunicación**:
   - Responder a todos los mensajes
   - Agradecer feedback
   - Resolver problemas rápidamente

---

## 📊 POST-LANZAMIENTO (Semana 8+)

### Primeras 48 horas:

**Prioridades**:
1. Estabilidad del sistema
2. Responder a todos los usuarios
3. Arreglar bugs críticos
4. Monitorear métricas clave

**Métricas a revisar diariamente**:
- Registros
- Servicios solicitados
- Servicios completados
- Errores críticos
- Tiempo de respuesta promedio
- Tasa de conversión

### Primera semana:

**Focus**:
1. Retención de usuarios iniciales
2. Ajustes basados en feedback
3. Optimizaciones de performance
4. Expansión de proveedores

**Reuniones diarias**:
- Revisar métricas
- Priorizar issues
- Planear día siguiente

### Primer mes:

**Objetivos**:
- 100+ usuarios registrados
- 50+ servicios completados
- NPS > 50
- Tasa de completación > 80%
- Rating promedio > 4.5

**Hitos a alcanzar**:
- Product-market fit inicial
- Procesos operativos funcionando
- Comisiones cubren costos de operación
- Crecimiento sostenible

---

## 🎯 RESUMEN EJECUTIVO

### Tiempo Total Estimado: 6-8 semanas

**Distribución del tiempo**:
- Seguridad y Auth: 2 semanas (CRÍTICO)
- Pagos: 1 semana (CRÍTICO)
- Notificaciones y Mapas: 1 semana
- Analytics y Testing: 2 semanas
- Optimización y PWA: 1 semana
- Contenido y Pre-lanzamiento: 1-2 semanas

### Inversión Estimada:

**Servicios (mensual)**:
- Vercel Pro: $20
- Base de datos: $25-50
- Mapas: $0-50
- Email: $0-30
- Monitoring: $0-50
- **Total**: $50-200/mes inicial

**One-time**:
- Revisión legal: $50,000-150,000 ARS
- Diseño gráfico (logo, branding): $30,000-100,000 ARS
- Marketing inicial: $100,000-500,000 ARS

**Total inversión inicial**: ~$300,000 - $1,000,000 ARS

### Recursos Necesarios:

**Equipo mínimo**:
- 1 Developer full-time (tú)
- 1 Diseñador part-time (freelance)
- 1 Abogado (consultoría)
- 1 Contador (mensual)
- Soporte/Operations: puede ser tú inicialmente

---

## ✅ CRITERIO DE "LISTO PARA LANZAR"

Tu app está lista cuando puedes responder SÍ a todas estas preguntas:

### Seguridad:
- ✅ ¿RLS está habilitado y testeado?
- ✅ ¿Autenticación es segura?
- ✅ ¿No hay SQL injection possible?
- ✅ ¿Datos sensibles están encriptados?

### Funcionalidad:
- ✅ ¿Un usuario puede completar un servicio end-to-end?
- ✅ ¿Pagos funcionan en producción?
- ✅ ¿Escrow retiene y libera fondos correctamente?
- ✅ ¿Notificaciones llegan?

### Experiencia:
- ✅ ¿La app es intuitiva para usuarios no-tech?
- ✅ ¿Funciona bien en móvil?
- ✅ ¿No hay errores visibles?
- ✅ ¿Carga rápido?

### Negocio:
- ✅ ¿Tienes al menos 20 proveedores listos?
- ✅ ¿Tienes estructura legal?
- ✅ ¿Tienes plan de marketing?
- ✅ ¿Puedes soportar el crecimiento?

---

## 🆘 CÓMO USAR ESTA GUÍA

**Recomendación**: 
1. Lee toda la guía primero (30-60 min)
2. Imprime o guarda el checklist
3. Empieza por Fase 1 (Seguridad)
4. No saltees pasos críticos
5. Testea todo constantemente
6. Pide ayuda cuando necesites

**Recuerda**:
- Es mejor lanzar tarde pero seguro que temprano y con problemas
- Focus en hacer pocas cosas excelentes en lugar de muchas cosas mediocres
- Escucha a tus usuarios
- Itera rápidamente

---

## 📞 SIGUIENTE PASO

**Di**: "Empecemos con [nombre de fase]" y te guiaré paso a paso en cada tarea específica.

Por ejemplo:
- "Empecemos con el RLS"
- "Empecemos con Supabase Auth"
- "Empecemos con Mercado Pago"

¡Vamos a hacer que LaburApp sea realidad! 🚀
