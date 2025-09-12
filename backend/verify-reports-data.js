const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function verifyReportsData() {
  console.log('🔍 Verificando datos de reportes con filtros de fechas...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Verificar órdenes por tipo (MESA vs DELIVERY)
    console.log('1️⃣ Verificando órdenes por tipo de espacio...');
    const ordersByTypeQuery = `
      SELECT 
        s.type as space_type,
        COUNT(*) as total_orders,
        SUM(o."totalAmount") as total_amount,
        COUNT(CASE WHEN o."isDelivery" = true THEN 1 END) as delivery_orders,
        COUNT(CASE WHEN o."isDelivery" = false OR o."isDelivery" IS NULL THEN 1 END) as regular_orders
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o."createdAt" >= '2025-09-01'::date
      AND o."createdAt" <= '2025-09-12'::date
      GROUP BY s.type
      ORDER BY s.type;
    `;
    
    const ordersByType = await client.query(ordersByTypeQuery);
    console.log('📊 Órdenes por tipo de espacio:');
    ordersByType.rows.forEach(row => {
      console.log(`   - ${row.space_type}: ${row.total_orders} órdenes ($${row.total_amount})`);
      console.log(`     * Delivery: ${row.delivery_orders}`);
      console.log(`     * Regulares: ${row.regular_orders}`);
    });

    // 2. Verificar pagos por método
    console.log('\n2️⃣ Verificando pagos por método...');
    const paymentsByMethodQuery = `
      SELECT 
        pm.name as method_name,
        COUNT(*) as payment_count,
        SUM(op.amount) as total_amount,
        COUNT(CASE WHEN op."isDelivery" = true THEN 1 END) as delivery_payments,
        COUNT(CASE WHEN op."isDelivery" = false OR op."isDelivery" IS NULL THEN 1 END) as regular_payments
      FROM "OrderPayment" op
      JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
      WHERE op."createdAt" >= '2025-09-01'::date
      AND op."createdAt" <= '2025-09-12'::date
      GROUP BY pm.name
      ORDER BY total_amount DESC;
    `;
    
    const paymentsByMethod = await client.query(paymentsByMethodQuery);
    console.log('💰 Pagos por método:');
    paymentsByMethod.rows.forEach(row => {
      console.log(`   - ${row.method_name}: ${row.payment_count} pagos ($${row.total_amount})`);
      console.log(`     * Delivery: ${row.delivery_payments}`);
      console.log(`     * Regulares: ${row.regular_payments}`);
    });

    // 3. Verificar órdenes con delivery cost
    console.log('\n3️⃣ Verificando órdenes con costo de delivery...');
    const deliveryOrdersQuery = `
      SELECT 
        COUNT(*) as total_delivery_orders,
        SUM("deliveryCost") as total_delivery_cost,
        AVG("deliveryCost") as avg_delivery_cost,
        COUNT(CASE WHEN "deliveryCost" > 0 THEN 1 END) as orders_with_delivery_cost
      FROM "Order"
      WHERE "createdAt" >= '2025-09-01'::date
      AND "createdAt" <= '2025-09-12'::date
      AND "isDelivery" = true;
    `;
    
    const deliveryOrders = await client.query(deliveryOrdersQuery);
    console.log('🚚 Órdenes de delivery:');
    deliveryOrders.rows.forEach(row => {
      console.log(`   - Total órdenes delivery: ${row.total_delivery_orders}`);
      console.log(`   - Total costo delivery: $${row.total_delivery_cost}`);
      console.log(`   - Costo promedio: $${row.avg_delivery_cost}`);
      console.log(`   - Órdenes con costo: ${row.orders_with_delivery_cost}`);
    });

    // 4. Verificar filtros de fecha específicos
    console.log('\n4️⃣ Verificando filtros de fecha específicos...');
    
    const todayOrdersQuery = `
      SELECT 
        COUNT(*) as today_orders,
        SUM("totalAmount") as today_total,
        COUNT(CASE WHEN "isDelivery" = true THEN 1 END) as today_delivery
      FROM "Order"
      WHERE DATE("createdAt") = CURRENT_DATE;
    `;
    
    const todayOrders = await client.query(todayOrdersQuery);
    console.log('📅 Órdenes de hoy:');
    todayOrders.rows.forEach(row => {
      console.log(`   - Total: ${row.today_orders} órdenes ($${row.today_total})`);
      console.log(`   - Delivery: ${row.today_delivery}`);
    });

    // 5. Verificar función RPC de reportes
    console.log('\n5️⃣ Probando función RPC de reportes con diferentes filtros...');
    
    // Probar con filtro de fecha específico
    const rpcTestQuery = `
      SELECT * FROM get_orders_report_by_date(
        '2025-09-12'::date,
        '2025-09-12'::date,
        null,
        null,
        1,
        10
      );
    `;
    
    const rpcResult = await client.query(rpcTestQuery);
    console.log('✅ Función RPC con filtro de fecha funciona');
    console.log(`   - Total órdenes encontradas: ${rpcResult.rows[0].total}`);
    console.log(`   - Órdenes en resultado: ${rpcResult.rows[0].orders.length}`);

    // 6. Verificar que los datos incluyen información de delivery
    console.log('\n6️⃣ Verificando información de delivery en los datos...');
    if (rpcResult.rows[0].orders.length > 0) {
      const sampleOrder = rpcResult.rows[0].orders[0];
      console.log('📋 Ejemplo de orden con información de delivery:');
      console.log(`   - ID: ${sampleOrder.id}`);
      console.log(`   - Número: ${sampleOrder.orderNumber}`);
      console.log(`   - Tipo espacio: ${sampleOrder.spaceType}`);
      console.log(`   - Total original: $${sampleOrder.originalTotal}`);
      console.log(`   - Total final: $${sampleOrder.finalTotal}`);
      console.log(`   - Fee delivery: $${sampleOrder.deliveryFeeTotal}`);
      console.log(`   - Total pagado: $${sampleOrder.totalPaid}`);
      console.log(`   - Pagos: ${sampleOrder.payments.length} métodos`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyReportsData();
