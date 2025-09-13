const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function investigateReportsDateFilter() {
  console.log('🔍 Investigando filtros de fecha en reportes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar órdenes de hoy específicamente
    console.log('1️⃣ ÓRDENES DE HOY (12/09/2025):');
    console.log('=================================');
    
    const todayOrders = await client.query(`
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
      WHERE DATE(o."createdAt") = '2025-09-12'
      ORDER BY o."createdAt" DESC;
    `);
    
    console.log(`📊 Total órdenes de hoy: ${todayOrders.rows.length}\n`);
    
    todayOrders.rows.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - ${order.status} - $${order.totalAmount} - ${order.space_name}`);
    });

    // 2. Verificar pagos de hoy específicamente
    console.log('\n2️⃣ PAGOS DE HOY (12/09/2025):');
    console.log('===============================');
    
    const todayPayments = await client.query(`
      SELECT 
        op.id,
        op."orderId",
        op.amount,
        op."paymentDate",
        op."isDeliveryService",
        pm.name as payment_method,
        o."orderNumber",
        o."customerName"
      FROM "OrderPayment" op
      JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
      JOIN "Order" o ON op."orderId" = o.id
      WHERE DATE(op."paymentDate") = '2025-09-12'
      ORDER BY op."paymentDate" DESC;
    `);
    
    console.log(`💳 Total pagos de hoy: ${todayPayments.rows.length}\n`);
    
    todayPayments.rows.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.orderNumber} - ${payment.customerName} - ${payment.payment_method} - $${payment.amount} - ${payment.paymentDate}`);
    });

    // 3. Verificar la función RPC de reportes por método de pago
    console.log('\n3️⃣ PROBANDO FUNCIÓN RPC DE REPORTES:');
    console.log('=====================================');
    
    try {
      // Probar con filtro de fecha de hoy
      const reportToday = await client.query(`
        SELECT * FROM get_payment_methods_report('2025-09-12', '2025-09-12');
      `);
      
      console.log(`📊 Reporte RPC para hoy: ${reportToday.rows.length} registros\n`);
      
      reportToday.rows.forEach((report, index) => {
        console.log(`${index + 1}. ${report.payment_method} - ${report.order_count} órdenes - $${report.total_amount}`);
      });
      
    } catch (error) {
      console.log(`❌ Error en función RPC: ${error.message}`);
    }

    // 4. Verificar pagos sin filtro de fecha (todos los pagos)
    console.log('\n4️⃣ TODOS LOS PAGOS (SIN FILTRO):');
    console.log('=================================');
    
    const allPayments = await client.query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(DISTINCT op."orderId") as unique_orders,
        COUNT(DISTINCT pm.name) as payment_methods
      FROM "OrderPayment" op
      JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id;
    `);
    
    const summary = allPayments.rows[0];
    console.log(`📊 Resumen total:`);
    console.log(`   - Total pagos: ${summary.total_payments}`);
    console.log(`   - Órdenes únicas: ${summary.unique_orders}`);
    console.log(`   - Métodos de pago: ${summary.payment_methods}`);

    // 5. Verificar pagos por método de pago (sin filtro de fecha)
    console.log('\n5️⃣ PAGOS POR MÉTODO DE PAGO (SIN FILTRO):');
    console.log('==========================================');
    
    const paymentsByMethod = await client.query(`
      SELECT 
        pm.name as payment_method,
        COUNT(*) as payment_count,
        COUNT(DISTINCT op."orderId") as order_count,
        SUM(op.amount) as total_amount
      FROM "OrderPayment" op
      JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
      GROUP BY pm.name
      ORDER BY total_amount DESC;
    `);
    
    paymentsByMethod.rows.forEach((method, index) => {
      console.log(`${index + 1}. ${method.payment_method}: ${method.payment_count} pagos, ${method.order_count} órdenes, $${method.total_amount}`);
    });

    // 6. Verificar si hay pagos duplicados o problemas de datos
    console.log('\n6️⃣ VERIFICANDO DUPLICADOS Y PROBLEMAS:');
    console.log('=======================================');
    
    const duplicatePayments = await client.query(`
      SELECT 
        op."orderId",
        o."orderNumber",
        COUNT(*) as payment_count,
        SUM(op.amount) as total_paid,
        o."totalAmount" as order_total
      FROM "OrderPayment" op
      JOIN "Order" o ON op."orderId" = o.id
      GROUP BY op."orderId", o."orderNumber", o."totalAmount"
      HAVING COUNT(*) > 1
      ORDER BY payment_count DESC;
    `);
    
    if (duplicatePayments.rows.length > 0) {
      console.log(`⚠️ Órdenes con múltiples pagos: ${duplicatePayments.rows.length}\n`);
      duplicatePayments.rows.forEach((dup, index) => {
        console.log(`${index + 1}. ${dup.orderNumber}: ${dup.payment_count} pagos, $${dup.total_paid} pagado, $${dup.order_total} total`);
      });
    } else {
      console.log('✅ No hay órdenes con múltiples pagos');
    }

    // 7. Verificar la función RPC específica que usa el frontend
    console.log('\n7️⃣ VERIFICANDO FUNCIÓN RPC ESPECÍFICA:');
    console.log('=======================================');
    
    try {
      // Verificar si existe la función get_payment_methods_report
      const functionExists = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_proc 
          WHERE proname = 'get_payment_methods_report'
        );
      `);
      
      console.log(`📋 Función get_payment_methods_report existe: ${functionExists.rows[0].exists}`);
      
      if (functionExists.rows[0].exists) {
        // Ver la definición de la función
        const functionDef = await client.query(`
          SELECT pg_get_functiondef(oid) as definition
          FROM pg_proc 
          WHERE proname = 'get_payment_methods_report';
        `);
        
        console.log('📋 Definición de la función:');
        console.log(functionDef.rows[0].definition);
      }
      
    } catch (error) {
      console.log(`❌ Error verificando función: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
  } finally {
    await client.end();
  }
}

investigateReportsDateFilter();

