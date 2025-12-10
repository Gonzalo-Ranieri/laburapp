-- ============================================
-- SCRIPT 5: POLÍTICAS RLS PARA SOLICITUDES DE SERVICIO
-- ============================================

DROP POLICY IF EXISTS "Users can view own requests" ON service_requests;
DROP POLICY IF EXISTS "Providers can view requests for their services" ON service_requests;
DROP POLICY IF EXISTS "Users can create requests" ON service_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON service_requests;
DROP POLICY IF EXISTS "Providers can update status of their requests" ON service_requests;

-- POLÍTICA: Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users can view own requests"
ON service_requests
FOR SELECT
USING (user_id = auth.uid());

-- POLÍTICA: Los proveedores pueden ver solicitudes para sus servicios
CREATE POLICY "Providers can view requests for their services"
ON service_requests
FOR SELECT
USING (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: Los usuarios pueden crear solicitudes
CREATE POLICY "Users can create requests"
ON service_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- POLÍTICA: Los usuarios pueden actualizar sus propias solicitudes (cancelar, etc.)
CREATE POLICY "Users can update own requests"
ON service_requests
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- POLÍTICA: Los proveedores pueden actualizar el estado de las solicitudes de sus servicios
CREATE POLICY "Providers can update status of their requests"
ON service_requests
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
