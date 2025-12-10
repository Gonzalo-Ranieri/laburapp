-- ============================================
-- SCRIPT 7: POLÍTICAS RLS PARA MENSAJES
-- ============================================

DROP POLICY IF EXISTS "Users can view messages where they are sender or receiver" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- POLÍTICA: Los usuarios pueden ver mensajes donde son remitente o destinatario
CREATE POLICY "Users can view messages where they are sender or receiver"
ON messages
FOR SELECT
USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- POLÍTICA: Los usuarios pueden enviar mensajes
CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- POLÍTICA: Los usuarios pueden marcar como leídos sus mensajes recibidos
CREATE POLICY "Users can update received messages"
ON messages
FOR UPDATE
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());
