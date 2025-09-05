-- Función para verificar contraseñas usando pgcrypto
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Comparar la contraseña de entrada con el hash almacenado usando pgcrypto
  RETURN crypt(input_password, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql;
