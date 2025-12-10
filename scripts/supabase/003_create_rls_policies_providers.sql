-- ============================================
-- SCRIPT 3: POLÍTICAS RLS PARA PROVEEDORES
-- ============================================

-- ELIMINAR políticas existentes
DROP POLICY IF EXISTS "Providers can view own profile" ON provider_profiles;
DROP POLICY IF EXISTS "Providers can update own profile" ON provider_profiles;
DROP POLICY IF EXISTS "Anyone can view active providers" ON provider_profiles;
DROP POLICY IF EXISTS "Providers can insert own profile" ON provider_profiles;

-- POLÍTICA: Los proveedores pueden ver su propio perfil completo
CREATE POLICY "Providers can view own profile"
ON provider_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- POLÍTICA: Los proveedores pueden actualizar su propio perfil
CREATE POLICY "Providers can update own profile"
ON provider_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLÍTICA: Cualquiera puede ver proveedores activos y verificados
CREATE POLICY "Anyone can view active providers"
ON provider_profiles
FOR SELECT
USING (is_active = true);

-- POLÍTICA: Los usuarios pueden crear su perfil de proveedor
CREATE POLICY "Providers can insert own profile"
ON provider_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Verificar políticas creadas
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'provider_profiles';
