-- Función RPC simplificada para autenticación
-- Esta versión no usa pgcrypto, solo verifica que el usuario existe y está activo
CREATE OR REPLACE FUNCTION simple_auth_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  firstname TEXT,
  lastname TEXT,
  email TEXT,
  role TEXT,
  isactive BOOLEAN,
  createdat TIMESTAMP,
  updatedat TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Por ahora, solo verificar que el usuario existe y está activo
  -- En producción, deberías usar pgcrypto para verificar la contraseña
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.firstname,
    u.lastname,
    u.email,
    u.role::text,
    u.isactive,
    u.createdat,
    u.updatedat
  FROM "User" u
  WHERE lower(u.username) = lower(p_username)
    AND u.isactive = true
  LIMIT 1;
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION simple_auth_login(TEXT, TEXT) TO anon, authenticated;
