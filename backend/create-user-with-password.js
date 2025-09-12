const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function createUserWithPassword() {
  console.log('🔧 Creando usuario con contraseña...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Crear usuario con contraseña hasheada
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO "User" (id, username, email, password, role, "isActive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'testuser',
        'test@sistema.com',
        $1,
        'ADMIN',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (username) DO UPDATE SET
        password = $1,
        "updatedAt" = NOW();
    `, [hashedPassword]);
    
    console.log('✅ Usuario testuser creado con contraseña admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createUserWithPassword();

