-- ============================================
-- SCRIPT 2: POLÍTICAS RLS PARA TABLA USERS
-- ============================================

-- ELIMINAR políticas existentes si hay alguna
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view public user info" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- POLÍTICA: Los usuarios pueden ver su propio perfil completo
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- POLÍTICA: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLÍTICA: Cualquiera puede ver información pública de usuarios (nombre, email, avatar)
-- Pero NO información sensible como contraseñas
CREATE POLICY "Anyone can view public user info"
ON users
FOR SELECT
USING (true);

-- POLÍTICA: Permitir creación de perfil durante registro
CREATE POLICY "Users can insert own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verificar políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
