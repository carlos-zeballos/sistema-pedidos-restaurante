const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Verificar si existe la tabla PaymentMethod
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('PaymentMethod', 'OrderPayment')
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas existentes:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    if (tables.rows.length === 0) {
      console.log('❌ No se encontraron las tablas de pago');
    }
    
    // Verificar columnas de la tabla Order
    const orderColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      AND column_name LIKE '%payment%'
      ORDER BY column_name
    `);
    
    console.log('📋 Columnas de pago en Order:');
    orderColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();












