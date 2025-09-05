import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { 
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  } 
});

try {
  console.log('🔍 Probando conexión con pg...');
  const r = await pool.query('select 1 as ok, NOW() as current_time');
  console.log('✅ Conexión exitosa!');
  console.log('📊 Resultado:', r.rows);
  await pool.end();
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  await pool.end();
}
