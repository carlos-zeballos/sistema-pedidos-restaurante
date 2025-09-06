const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkProductRPC() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Verificar si existe la función product_upsert
    const rpcCheck = await client.query(`
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_name = 'product_upsert' 
      AND routine_schema = 'public'
    `);
    
    console.log('📋 Funciones RPC encontradas:');
    rpcCheck.rows.forEach(row => {
      console.log(`  - ${row.routine_name}: ${row.routine_type}`);
    });
    
    if (rpcCheck.rows.length === 0) {
      console.log('❌ La función product_upsert NO existe');
      
      // Verificar qué funciones RPC existen
      const allRPCs = await client.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        ORDER BY routine_name
      `);
      
      console.log('📋 Funciones RPC disponibles:');
      allRPCs.rows.forEach(row => {
        console.log(`  - ${row.routine_name}`);
      });
    } else {
      console.log('✅ La función product_upsert existe');
      
      // Verificar la estructura de la función
      const functionDef = await client.query(`
        SELECT pg_get_functiondef(oid) as definition
        FROM pg_proc 
        WHERE proname = 'product_upsert'
      `);
      
      console.log('📋 Definición de la función:');
      console.log(functionDef.rows[0]?.definition || 'No se pudo obtener la definición');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkProductRPC();



