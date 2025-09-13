const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function finalDataVerification() {
  console.log('🔍 Verificación final de integridad de datos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar órdenes sin items (debería estar limpio ahora)
    console.log('1️⃣ ÓRDENES SIN ITEMS:');
    console.log('=====================');
    
    const ordersWithoutItemsQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE oi.id IS NULL
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutItems = await client.query(ordersWithoutItemsQuery);
    if (ordersWithoutItems.rows.length > 0) {
      console.log(`⚠️ Aún quedan ${ordersWithoutItems.rows.length} órdenes sin items:`);
      ordersWithoutItems.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name}`);
      });
    } else {
      console.log('✅ Todas las órdenes tienen items asociados');
    }

    // 2. Verificar órdenes sin pagos (debería estar limpio ahora)
    console.log('\n2️⃣ ÓRDENES SIN PAGOS:');
    console.log('======================');
    
    const ordersWithoutPaymentsQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE op.id IS NULL
      AND o.status IN ('PAGADO', 'ENTREGADO')
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutPayments = await client.query(ordersWithoutPaymentsQuery);
    if (ordersWithoutPayments.rows.length > 0) {
      console.log(`⚠️ Aún quedan ${ordersWithoutPayments.rows.length} órdenes marcadas como pagadas pero sin pagos:`);
      ordersWithoutPayments.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name}`);
      });
    } else {
      console.log('✅ Todas las órdenes pagadas tienen pagos registrados');
    }

    // 3. Verificar órdenes recientes (últimas 24 horas)
    console.log('\n3️⃣ ÓRDENES RECIENTES (ÚLTIMAS 24 HORAS):');
    console.log('==========================================');
    
    const recentOrdersQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name,
        s.type as space_type,
        COUNT(oi.id) as item_count,
        COUNT(op.id) as payment_count
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE o."createdAt" >= NOW() - INTERVAL '24 hours'
      GROUP BY o.id, o."orderNumber", o."createdAt", o."customerName", o."totalAmount", o.status, s.name, s.type
      ORDER BY o."createdAt" DESC;
    `;
    
    const recentOrders = await client.query(recentOrdersQuery);
    if (recentOrders.rows.length > 0) {
      console.log(`📅 Se encontraron ${recentOrders.rows.length} órdenes en las últimas 24 horas:`);
      recentOrders.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name} (${order.space_type}) - Items: ${order.item_count}, Pagos: ${order.payment_count}`);
      });
    } else {
      console.log('📅 No hay órdenes en las últimas 24 horas');
    }

    // 4. Verificar estadísticas generales
    console.log('\n4️⃣ ESTADÍSTICAS GENERALES:');
    console.log('===========================');
    
    const totalOrders = await client.query('SELECT COUNT(*) as count FROM "Order"');
    const totalItems = await client.query('SELECT COUNT(*) as count FROM "OrderItem"');
    const totalPayments = await client.query('SELECT COUNT(*) as count FROM "OrderPayment"');
    
    // Órdenes por status
    const ordersByStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM("totalAmount") as total_amount
      FROM "Order"
      GROUP BY status
      ORDER BY count DESC;
    `;
    
    const ordersByStatus = await client.query(ordersByStatusQuery);
    
    console.log(`\n📊 RESUMEN GENERAL:`);
    console.log(`   📦 Total órdenes: ${totalOrders.rows[0].count}`);
    console.log(`   🛒 Total items: ${totalItems.rows[0].count}`);
    console.log(`   💳 Total pagos: ${totalPayments.rows[0].count}`);
    
    console.log(`\n📋 ÓRDENES POR STATUS:`);
    ordersByStatus.rows.forEach(row => {
      console.log(`   - ${row.status}: ${row.count} órdenes ($${row.total_amount})`);
    });

    // 5. Verificar que las funciones RPC siguen funcionando
    console.log('\n5️⃣ VERIFICACIÓN DE FUNCIONES RPC:');
    console.log('===================================');
    
    const rpcTestQuery = `
      SELECT * FROM get_orders_report_by_date(
        '2025-09-12'::date,
        '2025-09-12'::date,
        null,
        null,
        1,
        5
      );
    `;
    
    const rpcResult = await client.query(rpcTestQuery);
    console.log(`✅ Función RPC get_orders_report_by_date:`);
    console.log(`   📊 Total órdenes encontradas: ${rpcResult.rows[0].total}`);
    console.log(`   📋 Órdenes en resultado: ${rpcResult.rows[0].orders.length}`);

    // 6. Resumen final
    console.log('\n6️⃣ RESUMEN FINAL:');
    console.log('==================');
    
    const issuesRemaining = ordersWithoutItems.rows.length + ordersWithoutPayments.rows.length;
    
    if (issuesRemaining === 0) {
      console.log(`\n🎉 ¡PERFECTO! Los datos están completamente limpios y consistentes.`);
      console.log(`✅ Todas las órdenes tienen items asociados`);
      console.log(`✅ Todas las órdenes pagadas tienen pagos registrados`);
      console.log(`✅ Las funciones RPC están funcionando correctamente`);
      console.log(`✅ Los reportes deberían mostrar datos precisos`);
    } else {
      console.log(`\n⚠️ Aún quedan ${issuesRemaining} problemas menores que requieren atención manual:`);
      if (ordersWithoutItems.rows.length > 0) {
        console.log(`   - ${ordersWithoutItems.rows.length} órdenes sin items (pero con pagos)`);
      }
      if (ordersWithoutPayments.rows.length > 0) {
        console.log(`   - ${ordersWithoutPayments.rows.length} órdenes sin pagos (pero marcadas como pagadas)`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

finalDataVerification();

