const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkUserTable() {
  console.log('🔍 Verificando estructura de tabla User...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Verificar estructura de la tabla
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(structureQuery);
    
    console.log('📋 Estructura de tabla User:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Verificar usuarios existentes
    const usersQuery = 'SELECT * FROM "User" LIMIT 3';
    const usersResult = await client.query(usersQuery);
    
    console.log('\n👥 Usuarios existentes:');
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - Password: ${user.password ? 'Sí' : 'No'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserTable();



