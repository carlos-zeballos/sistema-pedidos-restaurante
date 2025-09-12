const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkPaymentTableStructure() {
  console.log('🔍 Verificando estructura de tabla OrderPayment...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar estructura de OrderPayment
    console.log('1️⃣ Estructura de tabla OrderPayment:');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'OrderPayment' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await client.query(structureQuery);
    structureResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 2. Verificar datos de ejemplo
    console.log('\n2️⃣ Datos de ejemplo en OrderPayment:');
    const sampleQuery = `
      SELECT * FROM "OrderPayment" 
      LIMIT 3;
    `;
    
    const sampleResult = await client.query(sampleQuery);
    sampleResult.rows.forEach((row, index) => {
      console.log(`   Ejemplo ${index + 1}:`);
      Object.keys(row).forEach(key => {
        console.log(`     ${key}: ${row[key]}`);
      });
      console.log('');
    });

    // 3. Verificar si hay tabla de DeliveryPayment
    console.log('3️⃣ Verificando tabla DeliveryPayment...');
    const deliveryTableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%Delivery%';
    `;
    
    const deliveryTableResult = await client.query(deliveryTableQuery);
    console.log('📋 Tablas relacionadas con delivery:');
    deliveryTableResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 4. Verificar estructura de DeliveryPayment si existe
    if (deliveryTableResult.rows.length > 0) {
      console.log('\n4️⃣ Estructura de tabla DeliveryPayment:');
      const deliveryStructureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'DeliveryPayment' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const deliveryStructureResult = await client.query(deliveryStructureQuery);
      deliveryStructureResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPaymentTableStructure();
