-- ============================================
-- SCRIPT 9: POLÍTICAS RLS PARA NOTIFICACIONES
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- POLÍTICA: Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());

-- POLÍTICA: El sistema puede crear notificaciones
CREATE POLICY "System can create notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- POLÍTICA: Los usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
