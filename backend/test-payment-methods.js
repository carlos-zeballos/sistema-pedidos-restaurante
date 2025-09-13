const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testPaymentMethods() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Probar la consulta que usa el backend
    const result = await client.query(`
      SELECT * FROM "PaymentMethod" 
      WHERE "isActive" = true 
      ORDER BY name
    `);
    
    console.log('📋 Métodos de pago activos:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.description} (${row.icon})`);
    });
    
    console.log(`\n✅ Total: ${result.rows.length} métodos de pago disponibles`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testPaymentMethods();











