const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function applyPaymentSystem() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    const fs = require('fs');
    const sql = fs.readFileSync('payment-system.sql', 'utf8');
    
    console.log('📄 Aplicando sistema de métodos de pago...');
    await client.query(sql);
    
    console.log('✅ Sistema de métodos de pago aplicado exitosamente');
    
    // Verificar que los métodos de pago se crearon
    const result = await client.query('SELECT * FROM "PaymentMethod" ORDER BY name');
    console.log('📋 Métodos de pago creados:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.description} (${row.icon})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

applyPaymentSystem();


