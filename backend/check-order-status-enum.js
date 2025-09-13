const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkOrderStatusEnum() {
  console.log('🔍 Verificando enum de status de órdenes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar valores del enum OrderStatus
    console.log('1️⃣ Valores del enum OrderStatus:');
    const enumQuery = `
      SELECT unnest(enum_range(NULL::order_status)) as status_value;
    `;
    
    const enumResult = await client.query(enumQuery);
    console.log('📋 Valores válidos del enum:');
    enumResult.rows.forEach(row => {
      console.log(`   - ${row.status_value}`);
    });

    // 2. Verificar órdenes sin pagos (corregido)
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
      AND o.status IN ('PAGADO', 'ENTREGADO')
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

    // 3. Verificar órdenes sin items (revisión detallada)
    console.log('\n3️⃣ ÓRDENES SIN ITEMS (DETALLADO):');
    console.log('===================================');
    
    const ordersWithoutItemsQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name,
        s.type as space_type,
        u.username as created_by_user
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "User" u ON o."createdBy" = u.id
      WHERE oi.id IS NULL
      ORDER BY o."createdAt" DESC;
    `;
    
    const ordersWithoutItems = await client.query(ordersWithoutItemsQuery);
    if (ordersWithoutItems.rows.length > 0) {
      console.log(`❌ Se encontraron ${ordersWithoutItems.rows.length} órdenes sin items:`);
      ordersWithoutItems.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} ($${order.totalAmount}) - ${order.status} - ${order.space_name} - Creado por: ${order.created_by_user}`);
      });
    }

    // 4. Verificar órdenes con total 0
    console.log('\n4️⃣ ÓRDENES CON TOTAL $0:');
    console.log('=========================');
    
    const zeroTotalOrdersQuery = `
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o."totalAmount",
        o.status,
        s.name as space_name,
        COUNT(oi.id) as item_count
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      WHERE o."totalAmount" = 0
      GROUP BY o.id, o."orderNumber", o."createdAt", o."customerName", o."totalAmount", o.status, s.name
      ORDER BY o."createdAt" DESC;
    `;
    
    const zeroTotalOrders = await client.query(zeroTotalOrdersQuery);
    if (zeroTotalOrders.rows.length > 0) {
      console.log(`⚠️ Se encontraron ${zeroTotalOrders.rows.length} órdenes con total $0:`);
      zeroTotalOrders.rows.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.status} - ${order.space_name} - Items: ${order.item_count}`);
      });
    } else {
      console.log('✅ No hay órdenes con total $0');
    }

    // 5. Verificar órdenes recientes (últimas 24 horas)
    console.log('\n5️⃣ ÓRDENES RECIENTES (ÚLTIMAS 24 HORAS):');
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

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOrderStatusEnum();

