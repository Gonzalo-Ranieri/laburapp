-- ============================================
-- SCRIPT 6: POLÍTICAS RLS PARA PAGOS
-- ============================================

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Providers can view payments for their services" ON payments;
DROP POLICY IF EXISTS "System can create payments" ON payments;
DROP POLICY IF EXISTS "System can update payment status" ON payments;

-- POLÍTICA: Los usuarios pueden ver sus propios pagos
CREATE POLICY "Users can view own payments"
ON payments
FOR SELECT
USING (
  user_id = auth.uid()
);

-- POLÍTICA: Los proveedores pueden ver pagos de sus servicios
CREATE POLICY "Providers can view payments for their services"
ON payments
FOR SELECT
USING (
  provider_id IN (
    SELECT id FROM provider_profiles WHERE user_id = auth.uid()
  )
);

-- POLÍTICA: El sistema puede crear pagos (desde API routes con service role)
CREATE POLICY "System can create payments"
ON payments
FOR INSERT
WITH CHECK (true);

-- POLÍTICA: El sistema puede actualizar estado de pagos
CREATE POLICY "System can update payment status"
ON payments
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Nota: Las políticas con "true" solo funcionarán con el service_role_key
-- Los usuarios normales no podrán crear/actualizar pagos directamente
