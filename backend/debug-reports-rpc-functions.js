const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function debugReportsRpcFunctions() {
  console.log('🔍 Depurando funciones RPC de reportes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar funciones RPC existentes
    console.log('1️⃣ FUNCIONES RPC DE REPORTES:');
    console.log('==============================');
    
    const rpcFunctions = await client.query(`
      SELECT 
        proname as function_name,
        pg_get_function_arguments(oid) as arguments,
        pg_get_function_result(oid) as return_type
      FROM pg_proc 
      WHERE proname LIKE '%report%'
      ORDER BY proname;
    `);
    
    console.log(`📋 Funciones RPC encontradas: ${rpcFunctions.rows.length}`);
    rpcFunctions.rows.forEach((func, index) => {
      console.log(`${index + 1}. ${func.function_name}`);
      console.log(`   - Argumentos: ${func.arguments}`);
      console.log(`   - Retorna: ${func.return_type}`);
      console.log('');
    });

    // 2. Probar función get_payment_methods_report_by_date
    console.log('2️⃣ PROBANDO get_payment_methods_report_by_date:');
    console.log('===============================================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const paymentMethodsResult = await client.query(`
        SELECT * FROM get_payment_methods_report_by_date($1, $2);
      `, [today, today]);
      
      console.log(`✅ Función ejecutada exitosamente`);
      console.log(`📊 Registros retornados: ${paymentMethodsResult.rows.length}`);
      
      if (paymentMethodsResult.rows.length > 0) {
        console.log('📋 Primer registro:');
        const firstRow = paymentMethodsResult.rows[0];
        Object.keys(firstRow).forEach(key => {
          console.log(`   - ${key}: ${firstRow[key]} (${typeof firstRow[key]})`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Error en get_payment_methods_report_by_date: ${error.message}`);
    }

    // 3. Probar función get_delivery_payments_report_by_date
    console.log('\n3️⃣ PROBANDO get_delivery_payments_report_by_date:');
    console.log('===============================================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const deliveryResult = await client.query(`
        SELECT * FROM get_delivery_payments_report_by_date($1, $2);
      `, [today, today]);
      
      console.log(`✅ Función ejecutada exitosamente`);
      console.log(`📊 Registros retornados: ${deliveryResult.rows.length}`);
      
      if (deliveryResult.rows.length > 0) {
        console.log('📋 Primer registro:');
        const firstRow = deliveryResult.rows[0];
        Object.keys(firstRow).forEach(key => {
          console.log(`   - ${key}: ${firstRow[key]} (${typeof firstRow[key]})`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Error en get_delivery_payments_report_by_date: ${error.message}`);
    }

    // 4. Probar función get_orders_report_by_date
    console.log('\n4️⃣ PROBANDO get_orders_report_by_date:');
    console.log('========================================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const ordersResult = await client.query(`
        SELECT * FROM get_orders_report_by_date($1, $2, 1, 10);
      `, [today, today]);
      
      console.log(`✅ Función ejecutada exitosamente`);
      console.log(`📊 Registros retornados: ${ordersResult.rows.length}`);
      
      if (ordersResult.rows.length > 0) {
        console.log('📋 Primera orden:');
        const firstRow = ordersResult.rows[0];
        Object.keys(firstRow).forEach(key => {
          console.log(`   - ${key}: ${firstRow[key]} (${typeof firstRow[key]})`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Error en get_orders_report_by_date: ${error.message}`);
    }

    // 5. Verificar datos de pagos directamente
    console.log('\n5️⃣ VERIFICANDO DATOS DE PAGOS DIRECTAMENTE:');
    console.log('===========================================');
    
    const today = new Date().toISOString().split('T')[0];
    const directPayments = await client.query(`
      SELECT 
        pm.name as method_name,
        pm.icon,
        pm.color,
        COUNT(DISTINCT o.id) as orders_count,
        COUNT(op.id) as payments_count,
        SUM(op.amount) as total_paid,
        SUM(o."totalAmount") as original_total
      FROM "PaymentMethod" pm
      LEFT JOIN "OrderPayment" op ON pm.id = op."paymentMethodId"
      LEFT JOIN "Order" o ON op."orderId" = o.id
      WHERE o."createdAt"::date = $1::date
      AND o."deletedAt" IS NULL
      GROUP BY pm.id, pm.name, pm.icon, pm.color
      ORDER BY pm.name;
    `, [today]);
    
    console.log(`📊 Pagos directos para hoy: ${directPayments.rows.length}`);
    directPayments.rows.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.method_name}`);
      console.log(`   - Órdenes: ${payment.orders_count}`);
      console.log(`   - Pagos: ${payment.payments_count}`);
      console.log(`   - Total pagado: $${payment.total_paid || 0}`);
      console.log(`   - Total original: $${payment.original_total || 0}`);
      console.log('');
    });

    // 6. Verificar órdenes con pagos
    console.log('\n6️⃣ VERIFICANDO ÓRDENES CON PAGOS:');
    console.log('==================================');
    
    const ordersWithPayments = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        COUNT(op.id) as payment_count,
        SUM(op.amount) as total_paid,
        jsonb_agg(
          jsonb_build_object(
            'method', pm.name,
            'amount', op.amount,
            'isDelivery', op."isDeliveryService",
            'paymentDate', op."paymentDate"
          )
        ) as payments
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      LEFT JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
      WHERE o."createdAt"::date = $1::date
      AND o."deletedAt" IS NULL
      GROUP BY o.id, o."orderNumber", o."customerName", o.status, o."totalAmount"
      ORDER BY o."createdAt" DESC;
    `, [today]);
    
    console.log(`📊 Órdenes con pagos para hoy: ${ordersWithPayments.rows.length}`);
    ordersWithPayments.rows.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName}`);
      console.log(`   - Estado: ${order.status}`);
      console.log(`   - Total orden: $${order.totalAmount}`);
      console.log(`   - Pagos: ${order.payment_count} ($${order.total_paid || 0})`);
      if (order.payments && order.payments.length > 0) {
        console.log(`   - Detalle pagos:`);
        order.payments.forEach(payment => {
          if (payment.method) {
            console.log(`     * ${payment.method}: $${payment.amount} (${payment.isDelivery ? 'Delivery' : 'Pedido'})`);
          }
        });
      }
      console.log('');
    });

    console.log('\n🎯 PROBLEMAS IDENTIFICADOS:');
    console.log('============================');
    console.log('1. ❌ Funciones RPC pueden no estar calculando correctamente');
    console.log('2. ❌ ordersCount aparece como undefined en algunos casos');
    console.log('3. ❌ Los pagos no se están asociando correctamente con las órdenes');
    console.log('4. ❌ Los totales pueden no estar sumándose correctamente');

  } catch (error) {
    console.error('❌ Error durante la depuración:', error.message);
  } finally {
    await client.end();
  }
}

debugReportsRpcFunctions();
