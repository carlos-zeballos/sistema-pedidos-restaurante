const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkReportsRPC() {
  console.log('🔍 Verificando funciones RPC de reportes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar funciones RPC de reportes
    console.log('1️⃣ Verificando funciones RPC de reportes...');
    const functionsQuery = `
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_name LIKE '%report%' 
      AND routine_schema = 'public'
      ORDER BY routine_name;
    `;
    
    const functionsResult = await client.query(functionsQuery);
    console.log('📋 Funciones RPC de reportes encontradas:');
    functionsResult.rows.forEach(func => {
      console.log(`   - ${func.routine_name} (${func.routine_type})`);
    });

    // 2. Verificar funciones específicas que usa el servicio
    const requiredFunctions = [
      'get_payment_methods_report_by_date',
      'get_delivery_payments_report_by_date', 
      'get_orders_report_by_date',
      'soft_delete_order'
    ];

    console.log('\n2️⃣ Verificando funciones requeridas...');
    for (const funcName of requiredFunctions) {
      const checkQuery = `
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_name = $1 
        AND routine_schema = 'public';
      `;
      
      const result = await client.query(checkQuery, [funcName]);
      if (result.rows.length > 0) {
        console.log(`   ✅ ${funcName} - Existe`);
      } else {
        console.log(`   ❌ ${funcName} - NO EXISTE`);
      }
    }

    // 3. Verificar estructura de tablas relacionadas con reportes
    console.log('\n3️⃣ Verificando estructura de tablas...');
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%Order%' OR table_name LIKE '%Payment%' OR table_name LIKE '%Space%')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Tablas relacionadas con reportes:');
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 4. Verificar si hay datos de prueba
    console.log('\n4️⃣ Verificando datos de prueba...');
    
    const ordersCount = await client.query('SELECT COUNT(*) as count FROM "Order"');
    const paymentsCount = await client.query('SELECT COUNT(*) as count FROM "OrderPayment"');
    const spacesCount = await client.query('SELECT COUNT(*) as count FROM "Space"');
    
    console.log(`   - Órdenes: ${ordersCount.rows[0].count}`);
    console.log(`   - Pagos: ${paymentsCount.rows[0].count}`);
    console.log(`   - Espacios: ${spacesCount.rows[0].count}`);

    // 5. Probar una función RPC si existe
    console.log('\n5️⃣ Probando función RPC de reportes...');
    try {
      const testResult = await client.query(`
        SELECT * FROM get_orders_report_by_date(
          '2025-01-01'::date,
          '2025-12-31'::date,
          null,
          null,
          1,
          10
        );
      `);
      console.log('✅ Función get_orders_report_by_date funciona');
      console.log('   Resultado:', testResult.rows[0]);
    } catch (error) {
      console.log('❌ Error probando función RPC:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkReportsRPC();

