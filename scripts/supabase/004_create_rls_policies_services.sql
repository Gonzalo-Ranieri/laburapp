-- ============================================
-- SCRIPT 4: POLÍTICAS RLS PARA SERVICIOS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active services" ON services;
DROP POLICY IF EXISTS "Providers can manage own services" ON services;
DROP POLICY IF EXISTS "Providers can create services" ON services;
DROP POLICY IF EXISTS "Providers can update own services" ON services;
DROP POLICY IF EXISTS "Providers can delete own services" ON services;

-- POLÍTICA: Cualquiera puede ver servicios activos
CREATE POLICY "Anyone can view active services"
ON services
FOR SELECT
USING (is_active = true);

-- POLÍTICA: Los proveedores pueden ver todos sus servicios (activos e inactivos)
CREATE POLICY "Providers can view own services"
ON services
FOR SELECT
USING (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Los proveedores pueden crear servicios
CREATE POLICY "Providers can create services"
ON services
FOR INSERT
WITH CHECK (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Los proveedores pueden actualizar sus propios servicios
CREATE POLICY "Providers can update own services"
ON services
FOR UPDATE
USING (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Los proveedores pueden eliminar sus propios servicios
CREATE POLICY "Providers can delete own services"
ON services
FOR DELETE
USING (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);
