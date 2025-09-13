const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function deleteBuggedOrder() {
  console.log('🗑️ Eliminando orden bugueada ORD-20250912-0015...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Buscar la orden específica
    console.log('1️⃣ BUSCANDO ORDEN ORD-20250912-0015:');
    console.log('=====================================');
    
    const orderQuery = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        o."createdAt",
        s.name as space_name,
        s.type as space_type
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o."orderNumber" = 'ORD-20250912-0015';
    `);
    
    if (orderQuery.rows.length === 0) {
      console.log('❌ Orden ORD-20250912-0015 no encontrada');
      return;
    }
    
    const order = orderQuery.rows[0];
    console.log(`📋 Orden encontrada:`);
    console.log(`   - ID: ${order.id}`);
    console.log(`   - Número: ${order.orderNumber}`);
    console.log(`   - Cliente: ${order.customerName}`);
    console.log(`   - Estado: ${order.status}`);
    console.log(`   - Total: $${order.totalAmount}`);
    console.log(`   - Espacio: ${order.space_name} (${order.space_type})`);
    console.log(`   - Creada: ${order.createdAt}`);

    // 2. Verificar elementos relacionados
    console.log('\n2️⃣ VERIFICANDO ELEMENTOS RELACIONADOS:');
    console.log('=====================================');
    
    // Verificar items de la orden
    const orderItems = await client.query(`
      SELECT COUNT(*) as items_count FROM "OrderItem" WHERE "orderId" = $1;
    `, [order.id]);
    console.log(`📦 Items en la orden: ${orderItems.rows[0].items_count}`);
    
    // Verificar pagos
    const orderPayments = await client.query(`
      SELECT COUNT(*) as payments_count FROM "OrderPayment" WHERE "orderId" = $1;
    `, [order.id]);
    console.log(`💳 Pagos registrados: ${orderPayments.rows[0].payments_count}`);

    // 3. Eliminar elementos relacionados primero
    console.log('\n3️⃣ ELIMINANDO ELEMENTOS RELACIONADOS:');
    console.log('=====================================');
    
    // Eliminar items de la orden
    const deleteItems = await client.query(`
      DELETE FROM "OrderItem" WHERE "orderId" = $1;
    `, [order.id]);
    console.log(`✅ Items eliminados: ${deleteItems.rowCount}`);
    
    // Eliminar pagos de la orden
    const deletePayments = await client.query(`
      DELETE FROM "OrderPayment" WHERE "orderId" = $1;
    `, [order.id]);
    console.log(`✅ Pagos eliminados: ${deletePayments.rowCount}`);

    // 4. Eliminar la orden
    console.log('\n4️⃣ ELIMINANDO LA ORDEN:');
    console.log('=======================');
    
    const deleteOrder = await client.query(`
      DELETE FROM "Order" WHERE id = $1;
    `, [order.id]);
    
    if (deleteOrder.rowCount > 0) {
      console.log(`✅ Orden ${order.orderNumber} eliminada exitosamente`);
      console.log(`✅ Registros eliminados: ${deleteOrder.rowCount}`);
    } else {
      console.log(`❌ No se pudo eliminar la orden`);
    }

    // 5. Verificar eliminación
    console.log('\n5️⃣ VERIFICANDO ELIMINACIÓN:');
    console.log('============================');
    
    const verifyDeletion = await client.query(`
      SELECT COUNT(*) as count FROM "Order" WHERE "orderNumber" = 'ORD-20250912-0015';
    `);
    
    if (verifyDeletion.rows[0].count === '0') {
      console.log('✅ Orden eliminada completamente de la base de datos');
    } else {
      console.log('❌ La orden aún existe en la base de datos');
    }

    // 6. Mostrar resumen de órdenes restantes
    console.log('\n6️⃣ RESUMEN DE ÓRDENES RESTANTES:');
    console.log('=================================');
    
    const remainingOrders = await client.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'PENDIENTE' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'PAGADO' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'ENTREGADO' THEN 1 END) as delivered_orders
      FROM "Order"
      WHERE DATE("createdAt") = CURRENT_DATE;
    `);
    
    const summary = remainingOrders.rows[0];
    console.log(`📊 Órdenes de hoy:`);
    console.log(`   - Total: ${summary.total_orders}`);
    console.log(`   - Pendientes: ${summary.pending_orders}`);
    console.log(`   - Pagadas: ${summary.paid_orders}`);
    console.log(`   - Entregadas: ${summary.delivered_orders}`);

  } catch (error) {
    console.error('❌ Error eliminando orden:', error.message);
  } finally {
    await client.end();
  }
}

deleteBuggedOrder();

