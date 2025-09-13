const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkCurrentOrders() {
  console.log('📋 Verificando órdenes actuales en el sistema...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar órdenes de hoy
    console.log('1️⃣ ÓRDENES DE HOY:');
    console.log('==================');
    
    const todayOrders = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        o."createdAt",
        s.name as space_name,
        s.type as space_type,
        COUNT(oi.id) as items_count,
        COUNT(op.id) as payments_count
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE DATE(o."createdAt") = CURRENT_DATE
      GROUP BY o.id, o."orderNumber", o."customerName", o.status, o."totalAmount", o."createdAt", s.name, s.type
      ORDER BY o."createdAt" DESC;
    `);
    
    if (todayOrders.rows.length === 0) {
      console.log('📭 No hay órdenes creadas hoy');
    } else {
      console.log(`📊 Total de órdenes de hoy: ${todayOrders.rows.length}\n`);
      
      todayOrders.rows.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber}`);
        console.log(`   - Cliente: ${order.customerName}`);
        console.log(`   - Estado: ${order.status}`);
        console.log(`   - Total: $${order.totalAmount}`);
        console.log(`   - Espacio: ${order.space_name} (${order.space_type})`);
        console.log(`   - Items: ${order.items_count}`);
        console.log(`   - Pagos: ${order.payments_count}`);
        console.log(`   - Creada: ${order.createdAt}`);
        console.log('');
      });
    }

    // 2. Verificar órdenes pendientes específicamente
    console.log('2️⃣ ÓRDENES PENDIENTES:');
    console.log('======================');
    
    const pendingOrders = await client.query(`
      SELECT 
        o."orderNumber",
        o."customerName",
        o."totalAmount",
        s.name as space_name,
        o."createdAt"
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o.status = 'PENDIENTE'
      ORDER BY o."createdAt" DESC;
    `);
    
    if (pendingOrders.rows.length === 0) {
      console.log('✅ No hay órdenes pendientes');
    } else {
      console.log(`📋 Órdenes pendientes: ${pendingOrders.rows.length}\n`);
      
      pendingOrders.rows.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - $${order.totalAmount} - ${order.space_name}`);
      });
    }

    // 3. Verificar órdenes de delivery específicamente
    console.log('\n3️⃣ ÓRDENES DE DELIVERY:');
    console.log('========================');
    
    const deliveryOrders = await client.query(`
      SELECT 
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        s.name as space_name,
        o."createdAt"
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE s.type = 'DELIVERY'
      AND DATE(o."createdAt") = CURRENT_DATE
      ORDER BY o."createdAt" DESC;
    `);
    
    if (deliveryOrders.rows.length === 0) {
      console.log('📭 No hay órdenes de delivery de hoy');
    } else {
      console.log(`🚚 Órdenes de delivery de hoy: ${deliveryOrders.rows.length}\n`);
      
      deliveryOrders.rows.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - ${order.status} - $${order.totalAmount}`);
      });
    }

    // 4. Buscar específicamente la orden ORD-20250912-0015
    console.log('\n4️⃣ BÚSQUEDA ESPECÍFICA DE ORD-20250912-0015:');
    console.log('=============================================');
    
    const specificOrder = await client.query(`
      SELECT 
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        s.name as space_name,
        o."createdAt"
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o."orderNumber" = 'ORD-20250912-0015';
    `);
    
    if (specificOrder.rows.length === 0) {
      console.log('✅ Orden ORD-20250912-0015 NO EXISTE en la base de datos');
      console.log('✅ La orden ya fue eliminada o nunca se registró correctamente');
    } else {
      console.log('❌ Orden ORD-20250912-0015 aún existe:');
      const order = specificOrder.rows[0];
      console.log(`   - Cliente: ${order.customerName}`);
      console.log(`   - Estado: ${order.status}`);
      console.log(`   - Total: $${order.totalAmount}`);
      console.log(`   - Espacio: ${order.space_name}`);
    }

  } catch (error) {
    console.error('❌ Error verificando órdenes:', error.message);
  } finally {
    await client.end();
  }
}

checkCurrentOrders();

