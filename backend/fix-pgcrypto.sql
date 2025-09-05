-- Verificar si pgcrypto está habilitado
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Habilitar pgcrypto si no está habilitado
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verificar que la función crypt existe
SELECT proname, prosrc FROM pg_proc WHERE proname = 'crypt';

-- Verificar que gen_salt existe
SELECT proname, prosrc FROM pg_proc WHERE proname = 'gen_salt';

-- Probar la función crypt
SELECT crypt('test', gen_salt('bf', 10));

-- Verificar usuarios existentes
SELECT username, firstname, lastname, role, isactive FROM "User" WHERE isactive = true;
