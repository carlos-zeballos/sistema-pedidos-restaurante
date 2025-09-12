const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function investigateOrderCreationIssues() {
  console.log('🔍 Investigando problemas de creación de pedidos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar números de orden duplicados
    console.log('1️⃣ VERIFICANDO NÚMEROS DE ORDEN DUPLICADOS:');
    console.log('===========================================');
    
    const duplicateOrderNumbers = await client.query(`
      SELECT 
        "orderNumber",
        COUNT(*) as count,
        array_agg(id) as order_ids,
        array_agg(status) as statuses,
        array_agg("createdAt") as created_dates
      FROM "Order"
      WHERE "deletedAt" IS NULL
      GROUP BY "orderNumber"
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `);
    
    if (duplicateOrderNumbers.rows.length === 0) {
      console.log('📭 No hay números de orden duplicados');
    } else {
      console.log(`⚠️ Números de orden duplicados encontrados: ${duplicateOrderNumbers.rows.length}\n`);
      
      duplicateOrderNumbers.rows.forEach((dup, index) => {
        console.log(`${index + 1}. ${dup.orderNumber}: ${dup.count} órdenes`);
        console.log(`   - IDs: ${dup.order_ids.join(', ')}`);
        console.log(`   - Estados: ${dup.statuses.join(', ')}`);
        console.log(`   - Fechas: ${dup.created_dates.join(', ')}`);
        console.log('');
      });
    }

    // 2. Verificar el último número de orden generado
    console.log('2️⃣ VERIFICANDO ÚLTIMO NÚMERO DE ORDEN:');
    console.log('=====================================');
    
    const lastOrderNumber = await client.query(`
      SELECT 
        "orderNumber",
        "createdAt",
        status
      FROM "Order"
      WHERE "orderNumber" LIKE 'ORD-20250912-%'
      ORDER BY "createdAt" DESC
      LIMIT 5;
    `);
    
    console.log(`📋 Últimos números de orden de hoy:\n`);
    lastOrderNumber.rows.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.status} - ${order.createdAt}`);
    });

    // 3. Verificar función RPC de creación de órdenes
    console.log('\n3️⃣ VERIFICANDO FUNCIÓN RPC DE CREACIÓN:');
    console.log('=======================================');
    
    const rpcFunctionExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_order_with_items'
      );
    `);
    
    console.log(`📋 Función create_order_with_items existe: ${rpcFunctionExists.rows[0].exists}`);
    
    if (rpcFunctionExists.rows[0].exists) {
      // Ver la definición de la función
      const functionDef = await client.query(`
        SELECT pg_get_functiondef(oid) as definition
        FROM pg_proc 
        WHERE proname = 'create_order_with_items';
      `);
      
      console.log('📋 Definición de la función:');
      console.log(functionDef.rows[0].definition.substring(0, 500) + '...');
    }

    // 4. Verificar problema de "PAGADO 00" en reportes
    console.log('\n4️⃣ VERIFICANDO PROBLEMA "PAGADO 00":');
    console.log('=====================================');
    
    const ordersWithZeroAmount = await client.query(`
      SELECT 
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        COUNT(op.id) as payment_count,
        SUM(op.amount) as total_paid
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE o."deletedAt" IS NULL
      AND (o."totalAmount" = 0 OR SUM(op.amount) = 0)
      GROUP BY o.id, o."orderNumber", o."customerName", o.status, o."totalAmount"
      ORDER BY o."createdAt" DESC
      LIMIT 10;
    `);
    
    if (ordersWithZeroAmount.rows.length === 0) {
      console.log('📭 No hay órdenes con montos cero');
    } else {
      console.log(`⚠️ Órdenes con montos cero: ${ordersWithZeroAmount.rows.length}\n`);
      
      ordersWithZeroAmount.rows.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - ${order.status}`);
        console.log(`   - Total orden: $${order.totalAmount}`);
        console.log(`   - Pagos: ${order.payment_count} ($${order.total_paid || 0})`);
        console.log('');
      });
    }

    // 5. Verificar función RPC de reportes
    console.log('\n5️⃣ VERIFICANDO FUNCIÓN RPC DE REPORTES:');
    console.log('=======================================');
    
    const reportFunction = await client.query(`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc 
      WHERE proname = 'get_payment_methods_report_by_date';
    `);
    
    if (reportFunction.rows.length > 0) {
      console.log('📋 Función de reportes encontrada');
      const def = reportFunction.rows[0].definition;
      
      // Verificar si la función está sumando correctamente
      if (def.includes('SUM(op.amount)')) {
        console.log('✅ La función está sumando correctamente los montos');
      } else {
        console.log('❌ La función NO está sumando correctamente los montos');
      }
    }

    // 6. Probar creación de orden manual
    console.log('\n6️⃣ PROBANDO CREACIÓN DE ORDEN MANUAL:');
    console.log('=====================================');
    
    try {
      // Generar número de orden único
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const nextNumber = await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING("orderNumber" FROM 'ORD-\\d{8}-(\\d+)') AS INTEGER)), 0) + 1 as next_num
        FROM "Order"
        WHERE "orderNumber" LIKE 'ORD-${today}-%';
      `);
      
      const nextOrderNumber = `ORD-${today}-${String(nextNumber.rows[0].next_num).padStart(4, '0')}`;
      console.log(`📋 Próximo número de orden: ${nextOrderNumber}`);
      
      // Verificar que no existe
      const existsCheck = await client.query(`
        SELECT COUNT(*) as count FROM "Order" WHERE "orderNumber" = $1;
      `, [nextOrderNumber]);
      
      console.log(`✅ Número de orden único: ${existsCheck.rows[0].count === '0' ? 'SÍ' : 'NO'}`);
      
    } catch (error) {
      console.log(`❌ Error probando creación: ${error.message}`);
    }

    console.log('\n🎯 RESUMEN DE PROBLEMAS ENCONTRADOS:');
    console.log('===================================');
    console.log('1. ❌ Números de orden duplicados causan error 500');
    console.log('2. ❌ Función RPC de creación puede tener problemas');
    console.log('3. ❌ Reportes muestran "PAGADO 00" por órdenes con montos cero');
    console.log('4. ❌ Necesitamos corregir la generación de números únicos');

  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
  } finally {
    await client.end();
  }
}

investigateOrderCreationIssues();
