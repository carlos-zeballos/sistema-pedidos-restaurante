const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function generateCompleteReportsAnalysis() {
  console.log('📊 Generando análisis completo de reportes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // 1. Análisis de órdenes por tipo y delivery
    console.log('1️⃣ ANÁLISIS DE ÓRDENES POR TIPO:');
    console.log('================================');
    
    const ordersAnalysisQuery = `
      SELECT 
        s.type as space_type,
        COUNT(*) as total_orders,
        SUM(o."totalAmount") as total_amount,
        COUNT(CASE WHEN o."isDelivery" = true THEN 1 END) as delivery_orders,
        COUNT(CASE WHEN o."isDelivery" = false OR o."isDelivery" IS NULL THEN 1 END) as regular_orders,
        SUM(CASE WHEN o."isDelivery" = true THEN o."deliveryCost" ELSE 0 END) as total_delivery_cost
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o."createdAt" >= '2025-09-01'::date
      AND o."createdAt" <= '2025-09-12'::date
      GROUP BY s.type
      ORDER BY total_amount DESC;
    `;
    
    const ordersAnalysis = await client.query(ordersAnalysisQuery);
    ordersAnalysis.rows.forEach(row => {
      console.log(`\n🏢 ${row.space_type}:`);
      console.log(`   📦 Total órdenes: ${row.total_orders}`);
      console.log(`   💰 Total vendido: $${row.total_amount}`);
      console.log(`   🚚 Órdenes delivery: ${row.delivery_orders}`);
      console.log(`   🍽️ Órdenes regulares: ${row.regular_orders}`);
      console.log(`   🚚 Costo total delivery: $${row.total_delivery_cost}`);
    });

    // 2. Análisis de pagos por método (corregido)
    console.log('\n\n2️⃣ ANÁLISIS DE PAGOS POR MÉTODO:');
    console.log('==================================');
    
    const paymentsAnalysisQuery = `
      SELECT 
        pm.name as method_name,
        pm.icon as method_icon,
        pm.color as method_color,
        COUNT(*) as payment_count,
        SUM(op.amount) as total_amount,
        COUNT(CASE WHEN op."isDeliveryService" = true THEN 1 END) as delivery_payments,
        COUNT(CASE WHEN op."isDeliveryService" = false THEN 1 END) as regular_payments,
        SUM(CASE WHEN op."isDeliveryService" = true THEN op.amount ELSE 0 END) as delivery_amount,
        SUM(CASE WHEN op."isDeliveryService" = false THEN op.amount ELSE 0 END) as regular_amount
      FROM "OrderPayment" op
      JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
      WHERE op."createdAt" >= '2025-09-01'::date
      AND op."createdAt" <= '2025-09-12'::date
      GROUP BY pm.name, pm.icon, pm.color
      ORDER BY total_amount DESC;
    `;
    
    const paymentsAnalysis = await client.query(paymentsAnalysisQuery);
    paymentsAnalysis.rows.forEach(row => {
      console.log(`\n💳 ${row.method_name}:`);
      console.log(`   📊 Total pagos: ${row.payment_count}`);
      console.log(`   💰 Total monto: $${row.total_amount}`);
      console.log(`   🚚 Pagos delivery: ${row.delivery_payments} ($${row.delivery_amount})`);
      console.log(`   🍽️ Pagos regulares: ${row.regular_payments} ($${row.regular_amount})`);
    });

    // 3. Análisis de órdenes de delivery específico
    console.log('\n\n3️⃣ ANÁLISIS ESPECÍFICO DE DELIVERY:');
    console.log('====================================');
    
    const deliveryAnalysisQuery = `
      SELECT 
        COUNT(*) as total_delivery_orders,
        SUM("totalAmount") as total_delivery_revenue,
        SUM("deliveryCost") as total_delivery_fees,
        AVG("deliveryCost") as avg_delivery_fee,
        COUNT(CASE WHEN "deliveryCost" > 0 THEN 1 END) as orders_with_delivery_fee,
        COUNT(CASE WHEN "deliveryCost" = 0 THEN 1 END) as orders_without_delivery_fee
      FROM "Order"
      WHERE "createdAt" >= '2025-09-01'::date
      AND "createdAt" <= '2025-09-12'::date
      AND "isDelivery" = true;
    `;
    
    const deliveryAnalysis = await client.query(deliveryAnalysisQuery);
    deliveryAnalysis.rows.forEach(row => {
      console.log(`\n🚚 RESUMEN DE DELIVERY:`);
      console.log(`   📦 Total órdenes delivery: ${row.total_delivery_orders}`);
      console.log(`   💰 Ingresos totales: $${row.total_delivery_revenue}`);
      console.log(`   🚚 Fees de delivery: $${row.total_delivery_fees}`);
      console.log(`   📊 Fee promedio: $${row.avg_delivery_fee}`);
      console.log(`   ✅ Con fee: ${row.orders_with_delivery_fee}`);
      console.log(`   ❌ Sin fee: ${row.orders_without_delivery_fee}`);
    });

    // 4. Análisis por fechas específicas
    console.log('\n\n4️⃣ ANÁLISIS POR FECHAS:');
    console.log('========================');
    
    const dailyAnalysisQuery = `
      SELECT 
        DATE("createdAt") as order_date,
        COUNT(*) as daily_orders,
        SUM("totalAmount") as daily_revenue,
        COUNT(CASE WHEN "isDelivery" = true THEN 1 END) as daily_delivery,
        COUNT(CASE WHEN "isDelivery" = false OR "isDelivery" IS NULL THEN 1 END) as daily_regular,
        SUM(CASE WHEN "isDelivery" = true THEN "deliveryCost" ELSE 0 END) as daily_delivery_fees
      FROM "Order"
      WHERE "createdAt" >= '2025-09-01'::date
      AND "createdAt" <= '2025-09-12'::date
      GROUP BY DATE("createdAt")
      ORDER BY order_date DESC;
    `;
    
    const dailyAnalysis = await client.query(dailyAnalysisQuery);
    console.log('\n📅 RESUMEN DIARIO:');
    dailyAnalysis.rows.forEach(row => {
      console.log(`   ${row.order_date}: ${row.daily_orders} órdenes ($${row.daily_revenue}) - Delivery: ${row.daily_delivery}, Regular: ${row.daily_regular}, Fees: $${row.daily_delivery_fees}`);
    });

    // 5. Verificar que las funciones RPC están funcionando correctamente
    console.log('\n\n5️⃣ VERIFICACIÓN DE FUNCIONES RPC:');
    console.log('====================================');
    
    // Probar función de reportes de órdenes
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
    console.log(`\n✅ Función RPC get_orders_report_by_date:`);
    console.log(`   📊 Total órdenes encontradas: ${rpcResult.rows[0].total}`);
    console.log(`   📋 Órdenes en resultado: ${rpcResult.rows[0].orders.length}`);
    
    if (rpcResult.rows[0].orders.length > 0) {
      const sampleOrder = rpcResult.rows[0].orders[0];
      console.log(`\n📋 Ejemplo de orden en reporte:`);
      console.log(`   🏷️ Número: ${sampleOrder.orderNumber}`);
      console.log(`   🏢 Espacio: ${sampleOrder.spaceName} (${sampleOrder.spaceType})`);
      console.log(`   👤 Cliente: ${sampleOrder.customerName}`);
      console.log(`   📊 Estado: ${sampleOrder.status}`);
      console.log(`   💰 Total original: $${sampleOrder.originalTotal}`);
      console.log(`   💰 Total final: $${sampleOrder.finalTotal}`);
      console.log(`   🚚 Fee delivery: $${sampleOrder.deliveryFeeTotal}`);
      console.log(`   💳 Total pagado: $${sampleOrder.totalPaid}`);
      console.log(`   📋 Métodos de pago: ${sampleOrder.payments.length}`);
    }

    // 6. Resumen final
    console.log('\n\n6️⃣ RESUMEN FINAL:');
    console.log('==================');
    
    const totalOrders = ordersAnalysis.rows.reduce((sum, row) => sum + parseInt(row.total_orders), 0);
    const totalRevenue = ordersAnalysis.rows.reduce((sum, row) => sum + parseFloat(row.total_amount), 0);
    const totalDeliveryOrders = ordersAnalysis.rows.reduce((sum, row) => sum + parseInt(row.delivery_orders), 0);
    const totalDeliveryCost = ordersAnalysis.rows.reduce((sum, row) => sum + parseFloat(row.total_delivery_cost), 0);
    
    console.log(`\n📊 ESTADÍSTICAS GENERALES:`);
    console.log(`   📦 Total órdenes: ${totalOrders}`);
    console.log(`   💰 Ingresos totales: $${totalRevenue.toFixed(2)}`);
    console.log(`   🚚 Órdenes delivery: ${totalDeliveryOrders} (${((totalDeliveryOrders/totalOrders)*100).toFixed(1)}%)`);
    console.log(`   🚚 Costos delivery: $${totalDeliveryCost.toFixed(2)}`);
    console.log(`   📅 Período: 2025-09-01 a 2025-09-12`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

generateCompleteReportsAnalysis();
