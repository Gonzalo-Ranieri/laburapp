-- ============================================
-- SCRIPT 1: HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ============================================
-- Este script es CRÍTICO para la seguridad de la aplicación
-- Ejecutar PRIMERO antes de crear políticas
-- ============================================

-- Habilitar RLS en la tabla users
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla provider_profiles
ALTER TABLE IF EXISTS provider_profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla services
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla service_requests
ALTER TABLE IF EXISTS service_requests ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla messages
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla reviews
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla payments
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla payment_confirmations
ALTER TABLE IF EXISTS payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla notifications
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla tracking
ALTER TABLE IF EXISTS tracking ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla categories
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla subcategories
ALTER TABLE IF EXISTS subcategories ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla certifications
ALTER TABLE IF EXISTS certifications ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla favorites
ALTER TABLE IF EXISTS favorites ENABLE ROW LEVEL SECURITY;

-- Verificación: Mostrar tablas con RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Crear función auxiliar para obtener el user_id del JWT
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (current_setting('request.jwt.claims', true)::json->>'user_id')
  )::uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION auth.user_id() IS 'Obtiene el ID del usuario autenticado desde el JWT de Supabase';
