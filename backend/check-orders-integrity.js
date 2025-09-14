const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkOrdersIntegrity() {
  console.log('🔍 Verificando integridad de pedidos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar órdenes sin items
    console.log('1️⃣ ÓRDENES SIN ITEMS:');
    console.log('=====================');
    
    const ordersWithoutItemsQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        s.name as space_name,
        s.type as space_type
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE oi.id IS NULL
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutItems = await client.query(ordersWithoutItemsQuery);
    if (ordersWithoutItems.rows.length > 0) {
      console.log(`❌ Se encontraron ${ordersWithoutItems.rows.length} órdenes sin items:`);
      ordersWithoutItems.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.space_name}`);
      });
    } else {
      console.log('✅ Todas las órdenes tienen items asociados');
    }

    // 2. Verificar órdenes sin pagos
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
        s.name as space_name,
        s.type as space_type
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE op.id IS NULL
      AND o.status IN ('PAGADO', 'ENTREGADO', 'COMPLETADO')
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutPayments = await client.query(ordersWithoutPaymentsQuery);
    if (ordersWithoutPayments.rows.length > 0) {
      console.log(`❌ Se encontraron ${ordersWithoutPayments.rows.length} órdenes marcadas como pagadas pero sin pagos:`);
      ordersWithoutPayments.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name}`);
      });
    } else {
      console.log('✅ Todas las órdenes pagadas tienen pagos registrados');
    }

    // 3. Verificar inconsistencias en totales
    console.log('\n3️⃣ INCONSISTENCIAS EN TOTALES:');
    console.log('===============================');
    
    const totalInconsistenciesQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."totalAmount" as order_total,
        COALESCE(SUM(op.amount), 0) as paid_total,
        o."totalAmount" - COALESCE(SUM(op.amount), 0) as difference,
        o.status,
        s.name as space_name
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o.status IN ('PAGADO', 'ENTREGADO', 'COMPLETADO')
      GROUP BY o.id, o."orderNumber", o."totalAmount", o.status, s.name
      HAVING ABS(o."totalAmount" - COALESCE(SUM(op.amount), 0)) > 0.01
      ORDER BY ABS(o."totalAmount" - COALESCE(SUM(op.amount), 0)) DESC;
    `;
    
    const totalInconsistencies = await client.query(totalInconsistenciesQuery);
    if (totalInconsistencies.rows.length > 0) {
      console.log(`❌ Se encontraron ${totalInconsistencies.rows.length} órdenes con inconsistencias en totales:`);
      totalInconsistencies.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: Total orden $${order.order_total}, Total pagado $${order.paid_total}, Diferencia $${order.difference}`);
      });
    } else {
      console.log('✅ Todos los totales de órdenes coinciden con los pagos');
    }

    // 4. Verificar órdenes con items pero sin productos/combos válidos
    console.log('\n4️⃣ ITEMS SIN PRODUCTOS/COMBOS VÁLIDOS:');
    console.log('========================================');
    
    const invalidItemsQuery = `
      SELECT 
        oi.id,
        oi."orderId",
        o."orderNumber",
        oi.name as item_name,
        oi."productId",
        oi."comboId",
        oi."unitPrice",
        oi.quantity,
        CASE 
          WHEN oi."productId" IS NOT NULL THEN 'Producto'
          WHEN oi."comboId" IS NOT NULL THEN 'Combo'
          ELSE 'Sin tipo'
        END as item_type
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE (oi."productId" IS NULL AND oi."comboId" IS NULL)
      OR (oi."productId" IS NOT NULL AND oi."comboId" IS NOT NULL)
      ORDER BY o."createdAt" DESC;
    `;
    
    const invalidItems = await client.query(invalidItemsQuery);
    if (invalidItems.rows.length > 0) {
      console.log(`❌ Se encontraron ${invalidItems.rows.length} items con problemas:`);
      invalidItems.rows.forEach(item => {
        console.log(`   - Orden ${item.orderNumber}: ${item.item_name} (${item.item_type}) - Producto: ${item.productId}, Combo: ${item.comboId}`);
      });
    } else {
      console.log('✅ Todos los items tienen productos o combos válidos');
    }

    // 5. Verificar órdenes con espacios inactivos
    console.log('\n5️⃣ ÓRDENES CON ESPACIOS INACTIVOS:');
    console.log('====================================');
    
    const inactiveSpaceOrdersQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        s.name as space_name,
        s."isActive" as space_active,
        s.type as space_type
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE s."isActive" = false
      ORDER BY o."createdAt" DESC;
    `;
    
    const inactiveSpaceOrders = await client.query(inactiveSpaceOrdersQuery);
    if (inactiveSpaceOrders.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${inactiveSpaceOrders.rows.length} órdenes en espacios inactivos:`);
      inactiveSpaceOrders.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.space_name} (${order.space_type}) - INACTIVO`);
      });
    } else {
      console.log('✅ Todas las órdenes están en espacios activos');
    }

    // 6. Verificar órdenes con usuarios inexistentes
    console.log('\n6️⃣ ÓRDENES CON USUARIOS INEXISTENTES:');
    console.log('======================================');
    
    const invalidUserOrdersQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."createdBy",
        u.username,
        u."isActive" as user_active
      FROM "Order" o
      LEFT JOIN "User" u ON o."createdBy" = u.id
      WHERE u.id IS NULL OR u."isActive" = false
      ORDER BY o."createdAt" DESC;
    `;
    
    const invalidUserOrders = await client.query(invalidUserOrdersQuery);
    if (invalidUserOrders.rows.length > 0) {
      console.log(`❌ Se encontraron ${invalidUserOrders.rows.length} órdenes con usuarios problemáticos:`);
      invalidUserOrders.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - Usuario: ${order.username || 'INEXISTENTE'} (${order.user_active ? 'ACTIVO' : 'INACTIVO'})`);
      });
    } else {
      console.log('✅ Todas las órdenes tienen usuarios válidos y activos');
    }

    // 7. Verificar órdenes duplicadas por número
    console.log('\n7️⃣ ÓRDENES DUPLICADAS:');
    console.log('=======================');
    
    const duplicateOrdersQuery = `
      SELECT 
        "orderNumber",
        COUNT(*) as count,
        array_agg(id) as order_ids,
        array_agg("createdAt") as created_dates
      FROM "Order"
      GROUP BY "orderNumber"
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `;
    
    const duplicateOrders = await client.query(duplicateOrdersQuery);
    if (duplicateOrders.rows.length > 0) {
      console.log(`❌ Se encontraron ${duplicateOrders.rows.length} números de orden duplicados:`);
      duplicateOrders.rows.forEach(dup => {
        console.log(`   - ${dup.orderNumber}: ${dup.count} órdenes (IDs: ${dup.order_ids.join(', ')})`);
      });
    } else {
      console.log('✅ No hay números de orden duplicados');
    }

    // 8. Verificar órdenes con fechas futuras o muy antiguas
    console.log('\n8️⃣ ÓRDENES CON FECHAS ANÓMALAS:');
    console.log('===============================');
    
    const anomalousDatesQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        s.name as space_name,
        CASE 
          WHEN o."createdAt" > NOW() THEN 'FUTURA'
          WHEN o."createdAt" < '2024-01-01' THEN 'MUY ANTIGUA'
          ELSE 'NORMAL'
        END as date_status
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o."createdAt" > NOW() 
      OR o."createdAt" < '2024-01-01'
      ORDER BY o."createdAt" DESC;
    `;
    
    const anomalousDates = await client.query(anomalousDatesQuery);
    if (anomalousDates.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${anomalousDates.rows.length} órdenes con fechas anómalas:`);
      anomalousDates.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.createdAt} (${order.date_status})`);
      });
    } else {
      console.log('✅ Todas las órdenes tienen fechas normales');
    }

    // 9. Resumen final
    console.log('\n9️⃣ RESUMEN DE INTEGRIDAD:');
    console.log('==========================');
    
    const totalOrders = await client.query('SELECT COUNT(*) as count FROM "Order"');
    const totalItems = await client.query('SELECT COUNT(*) as count FROM "OrderItem"');
    const totalPayments = await client.query('SELECT COUNT(*) as count FROM "OrderPayment"');
    
    console.log(`\n📊 ESTADÍSTICAS GENERALES:`);
    console.log(`   📦 Total órdenes: ${totalOrders.rows[0].count}`);
    console.log(`   🛒 Total items: ${totalItems.rows[0].count}`);
    console.log(`   💳 Total pagos: ${totalPayments.rows[0].count}`);
    
    const issuesFound = ordersWithoutItems.rows.length + 
                       ordersWithoutPayments.rows.length + 
                       totalInconsistencies.rows.length + 
                       invalidItems.rows.length + 
                       invalidUserOrders.rows.length + 
                       duplicateOrders.rows.length;
    
    if (issuesFound === 0) {
      console.log(`\n🎉 ¡PERFECTO! No se encontraron problemas de integridad en los datos`);
    } else {
      console.log(`\n⚠️ Se encontraron ${issuesFound} problemas de integridad que requieren atención`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOrdersIntegrity();


