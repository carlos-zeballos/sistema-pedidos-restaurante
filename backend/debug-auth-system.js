const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function debugAuthSystem() {
  console.log('🔍 Debuggeando sistema de autenticación...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar usuarios y sus contraseñas
    console.log('1️⃣ Verificando usuarios y contraseñas...');
    const usersQuery = 'SELECT username, password, role FROM "User" LIMIT 5';
    const usersResult = await client.query(usersQuery);
    
    console.log('👥 Usuarios en la base de datos:');
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
      console.log(`     Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
    });

    // 2. Verificar si las contraseñas están hasheadas
    console.log('\n2️⃣ Verificando formato de contraseñas...');
    const passwordQuery = `
      SELECT username, password, 
             CASE 
               WHEN password LIKE '$2%' THEN 'bcrypt'
               WHEN LENGTH(password) = 60 THEN 'bcrypt_possible'
               WHEN LENGTH(password) < 20 THEN 'plain_text'
               ELSE 'unknown'
             END as password_type
      FROM "User" 
      LIMIT 5;
    `;
    
    const passwordResult = await client.query(passwordQuery);
    passwordResult.rows.forEach(user => {
      console.log(`   - ${user.username}: ${user.password_type}`);
    });

    // 3. Probar crear un usuario con contraseña simple
    console.log('\n3️⃣ Creando usuario de prueba con contraseña simple...');
    const bcrypt = require('bcrypt');
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    await client.query(`
      INSERT INTO "User" (id, username, email, password, firstname, lastname, role, isactive, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'testuser',
        'test@sistema.com',
        $1,
        'Test',
        'User',
        'ADMIN',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (username) DO UPDATE SET
        password = $1,
        "updatedAt" = NOW();
    `, [hashedPassword]);
    
    console.log(`✅ Usuario testuser creado con contraseña: ${testPassword}`);
    console.log(`   Hash: ${hashedPassword.substring(0, 20)}...`);

    // 4. Verificar si hay algún problema con el sistema de autenticación
    console.log('\n4️⃣ Verificando configuración de autenticación...');
    
    // Verificar si existe alguna tabla de sesiones o tokens
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%session%' OR table_name LIKE '%token%' OR table_name LIKE '%auth%'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Tablas relacionadas con autenticación:');
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

debugAuthSystem();

