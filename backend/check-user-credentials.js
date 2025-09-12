const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUserCredentials() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Verificar usuarios disponibles
    const users = await client.query(`
      SELECT id, username, name, role, isactive 
      FROM "User" 
      WHERE isactive = true
      ORDER BY username
    `);
    
    console.log('📋 Usuarios activos disponibles:');
    users.rows.forEach(user => {
      console.log(`  - Username: ${user.username}`);
      console.log(`    Name: ${user.name}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Active: ${user.isactive}`);
      console.log('');
    });
    
    if (users.rows.length === 0) {
      console.log('❌ No hay usuarios activos en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserCredentials();










