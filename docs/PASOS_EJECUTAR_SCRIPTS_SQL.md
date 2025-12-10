# 🚀 GUÍA PASO A PASO: EJECUTAR SCRIPTS SQL EN SUPABASE

Esta guía te ayudará a ejecutar todos los scripts SQL de seguridad en tu nuevo proyecto de Supabase.

---

## 📋 PREREQUISITOS

1. ✅ Tener un proyecto de Supabase creado
2. ✅ Tener acceso al Dashboard de Supabase
3. ✅ Tener los 10 scripts SQL listos (en `scripts/supabase/`)

---

## 🔐 PASO 1: ACCEDER AL SQL EDITOR

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto "LaburApp"
3. En el menú lateral izquierdo, haz clic en "SQL Editor"
4. Verás una interfaz con un editor de texto

---

## 📝 PASO 2: EJECUTAR LOS SCRIPTS EN ORDEN

### Script 1: Habilitar RLS

1. Abre el archivo `scripts/supabase/001_enable_rls_all_tables.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor
4. Haz clic en el botón "Run" (▶️) en la esquina inferior derecha
5. ✅ Verifica que aparezca "Success" en verde
6. ⚠️ Si hay errores, verifica que las tablas existan

### Script 2: Políticas de Usuarios

1. Abre `scripts/supabase/002_create_rls_policies_users.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito
5. Deberías ver 4 políticas creadas para la tabla "users"

### Script 3: Políticas de Proveedores

1. Abre `scripts/supabase/003_create_rls_policies_providers.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 4: Políticas de Servicios

1. Abre `scripts/supabase/004_create_rls_policies_services.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 5: Políticas de Solicitudes

1. Abre `scripts/supabase/005_create_rls_policies_requests.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 6: Políticas de Pagos

1. Abre `scripts/supabase/006_create_rls_policies_payments.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 7: Políticas de Mensajes

1. Abre `scripts/supabase/007_create_rls_policies_messages.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 8: Políticas de Reseñas

1. Abre `scripts/supabase/008_create_rls_policies_reviews.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 9: Políticas de Notificaciones

1. Abre `scripts/supabase/009_create_rls_policies_notifications.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito

### Script 10: Índices de Rendimiento

1. Abre `scripts/supabase/010_create_indexes_performance.sql`
2. Copia y pega en el SQL Editor
3. Haz clic en "Run"
4. ✅ Verifica el mensaje de éxito
5. Este script puede tardar 10-30 segundos

---

## ✅ PASO 3: VERIFICAR QUE TODO ESTÁ CORRECTO

### Verificar RLS Habilitado

Ejecuta esta query en el SQL Editor:

\`\`\`sql
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
\`\`\`

**Resultado esperado**: Todas las tablas deben tener `rls_enabled = true`

### Verificar Políticas Creadas

Ejecuta esta query:

\`\`\`sql
SELECT 
    tablename,
    policyname,
    cmd AS command,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
\`\`\`

**Resultado esperado**: Deberías ver 30-40 políticas distribuidas en todas las tablas

### Verificar Índices Creados

Ejecuta esta query:

\`\`\`sql
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
\`\`\`

**Resultado esperado**: Deberías ver 20-30 índices con nombres que empiezan con "idx_"

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "relation does not exist"

**Causa**: La tabla no existe en tu base de datos

**Solución**:
1. Ve a "Table Editor" en Supabase
2. Verifica qué tablas existen
3. Omite el script para esa tabla O crea la tabla primero

### Error: "permission denied"

**Causa**: No tienes permisos suficientes

**Solución**:
1. Asegúrate de estar usando el SQL Editor de Supabase Dashboard
2. No uses el cliente de Supabase desde el código para ejecutar estos scripts

### Error: "policy already exists"

**Causa**: La política ya fue creada anteriormente

**Solución**:
- Esto es OK, puedes ignorar este error
- O ejecuta la línea `DROP POLICY IF EXISTS...` antes de crear la política

---

## 📊 CHECKLIST FINAL

Marca cada ítem cuando lo completes:

- [ ] Script 1: RLS habilitado en todas las tablas
- [ ] Script 2: Políticas de usuarios creadas (4 políticas)
- [ ] Script 3: Políticas de proveedores creadas (4 políticas)
- [ ] Script 4: Políticas de servicios creadas (5 políticas)
- [ ] Script 5: Políticas de solicitudes creadas (5 políticas)
- [ ] Script 6: Políticas de pagos creadas (4 políticas)
- [ ] Script 7: Políticas de mensajes creadas (3 políticas)
- [ ] Script 8: Políticas de reseñas creadas (5 políticas)
- [ ] Script 9: Políticas de notificaciones creadas (3 políticas)
- [ ] Script 10: Índices de rendimiento creados (20+ índices)
- [ ] Verificación: Query de RLS ejecutada correctamente
- [ ] Verificación: Query de políticas muestra 30+ políticas
- [ ] Verificación: Query de índices muestra 20+ índices

---

## 🎉 ¡COMPLETADO!

Si todos los scripts se ejecutaron exitosamente, tu base de datos ahora tiene:

✅ **Seguridad**: Row Level Security habilitado
✅ **Políticas**: ~35 políticas de acceso configuradas
✅ **Rendimiento**: ~25 índices optimizados
✅ **Listo para producción**: La base de datos está protegida

---

## 📞 SIGUIENTE PASO

Ahora puedes continuar con:

1. Actualizar las variables de entorno en Vercel
2. Probar el login/registro con Supabase Auth
3. Verificar que los usuarios no pueden acceder a datos de otros

Ver: `docs/PROGRESO_IMPLEMENTACION.md` para los siguientes pasos.
