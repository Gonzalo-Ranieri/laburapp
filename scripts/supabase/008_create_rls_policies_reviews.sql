-- ============================================
-- SCRIPT 8: POLÍTICAS RLS PARA RESEÑAS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews for completed services" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- POLÍTICA: Cualquiera puede ver reseñas aprobadas
CREATE POLICY "Anyone can view approved reviews"
ON reviews
FOR SELECT
USING (is_approved = true);

-- POLÍTICA: Los usuarios pueden ver sus propias reseñas (aprobadas o no)
CREATE POLICY "Users can view own reviews"
ON reviews
FOR SELECT
USING (user_id = auth.uid());

-- POLÍTICA: Los usuarios pueden crear reseñas
CREATE POLICY "Users can create reviews"
ON reviews
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- POLÍTICA: Los usuarios pueden actualizar sus propias reseñas
CREATE POLICY "Users can update own reviews"
ON reviews
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- POLÍTICA: Los usuarios pueden eliminar sus propias reseñas
CREATE POLICY "Users can delete own reviews"
ON reviews
FOR DELETE
USING (user_id = auth.uid());
