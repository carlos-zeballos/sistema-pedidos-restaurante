import pg from 'pg';

// URL sin SSL para probar conexión básica
const testUrl = process.env.DATABASE_URL.replace('?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=10&statement_timeout=60000', '');

const pool = new pg.Pool({ 
  connectionString: testUrl,
  ssl: false
});

try {
  console.log('🔍 Probando conexión sin SSL...');
  const r = await pool.query('select 1 as ok, NOW() as current_time');
  console.log('✅ Conexión exitosa!');
  console.log('📊 Resultado:', r.rows);
  await pool.end();
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  await pool.end();
}
