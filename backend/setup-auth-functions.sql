-- Habilitar extensión para hashing (bcrypt vía pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Función para verificar contraseñas usando pgcrypto
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Comparar la contraseña de entrada con el hash almacenado usando pgcrypto
  RETURN extensions.crypt(input_password, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener usuario por username y verificar contraseña
CREATE OR REPLACE FUNCTION get_user_by_credentials(p_username TEXT, p_password TEXT)
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username::text AS username,
    u."firstName"::text AS firstname,
    u."lastName"::text AS lastname,
    u.email::text AS email,
    u.role::text AS role,
    u."isActive" AS isactive,
    u."createdAt" AS createdat,
    u."updatedAt" AS updatedat
  FROM "User" u
  WHERE lower(u.username) = lower(p_username) 
    AND u."isActive" = true
    AND extensions.crypt(p_password, u.password) = u.password;
END;
$$ LANGUAGE plpgsql;

-- RPC de login seguro (username o email, case-insensitive)
CREATE OR REPLACE FUNCTION auth_login(p_identifier TEXT, p_password TEXT)
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
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash  TEXT;
  v_dummy TEXT := '$2a$10$C5iYfB1dHkqz.qxZQFqU0O7Qw7S1bq8pA3t0O3yV7Qb0e5m7k6z7a';
BEGIN
  SELECT u.password INTO v_hash
  FROM "User" u
  WHERE (lower(u.username) = lower(p_identifier) OR lower(u.email) = lower(p_identifier))
    AND u."isActive" = true
  LIMIT 1;

  v_hash := COALESCE(v_hash, v_dummy);

  IF extensions.crypt(p_password, v_hash) = v_hash THEN
    RETURN QUERY
    SELECT
      u.id,
      u.username::text AS username,
      u."firstName"::text AS firstname,
      u."lastName"::text AS lastname,
      u.email::text AS email,
      u.role::text AS role,
      u."isActive" AS isactive,
      u."createdAt" AS createdat,
      u."updatedAt" AS updatedat
    FROM "User" u
    WHERE (lower(u.username) = lower(p_identifier) OR lower(u.email) = lower(p_identifier))
      AND u."isActive" = true
    LIMIT 1;
  END IF;
  RETURN;
END;
$$;

-- Permisos
REVOKE ALL ON FUNCTION auth_login(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_credentials(TEXT, TEXT) TO anon, authenticated;

-- Upsert admin
INSERT INTO "User" (username, password, firstname, lastname, email, role, isactive, createdat, updatedat)
VALUES (
  'admin',
  extensions.crypt('Admin123!', extensions.gen_salt('bf', 10)),
  'Administrador',
  'Sistema',
  'admin@restaurant.com',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  username  = EXCLUDED.username,
  password  = EXCLUDED.password,
  firstname = EXCLUDED.firstname,
  lastname  = EXCLUDED.lastname,
  role      = EXCLUDED.role,
  isactive  = EXCLUDED.isactive,
  updatedat = NOW();
