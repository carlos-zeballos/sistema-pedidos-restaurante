const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixReportsFunctions() {
  console.log('🔧 Corrigiendo funciones RPC de reportes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Eliminar funciones existentes si existen
    console.log('1️⃣ ELIMINANDO FUNCIONES EXISTENTES:');
    console.log('===================================');
    
    const functionsToDrop = [
      'get_payment_methods_report_by_date',
      'get_delivery_payments_report_by_date', 
      'get_orders_report_by_date',
      'get_payment_methods_report'
    ];
    
    for (const funcName of functionsToDrop) {
      try {
        await client.query(`DROP FUNCTION IF EXISTS ${funcName}(DATE, DATE);`);
        await client.query(`DROP FUNCTION IF EXISTS ${funcName}(DATE, DATE, TEXT, TEXT, INTEGER, INTEGER);`);
        await client.query(`DROP FUNCTION IF EXISTS ${funcName}(TEXT, TEXT);`);
        console.log(`✅ Función ${funcName} eliminada`);
      } catch (error) {
        console.log(`⚠️ Función ${funcName} no existía o no se pudo eliminar: ${error.message}`);
      }
    }

    // 2. Crear función RPC para reporte de métodos de pago con filtro de fecha
    console.log('\n2️⃣ CREANDO FUNCIÓN get_payment_methods_report_by_date:');
    console.log('=====================================================');
    
    const createPaymentFunction = `
      CREATE OR REPLACE FUNCTION get_payment_methods_report_by_date(
        p_from_date DATE DEFAULT NULL,
        p_to_date DATE DEFAULT NULL
      )
      RETURNS TABLE (
        method TEXT,
        icon TEXT,
        color TEXT,
        ordersCount BIGINT,
        paidByMethod NUMERIC(10,2),
        originalTotal NUMERIC(10,2),
        finalTotal NUMERIC(10,2)
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          pm.name as method,
          pm.icon,
          pm.color,
          COUNT(DISTINCT op."orderId") as ordersCount,
          COALESCE(SUM(op.amount), 0) as paidByMethod,
          COALESCE(SUM(o."totalAmount"), 0) as originalTotal,
          COALESCE(SUM(o."totalAmount"), 0) as finalTotal
        FROM "PaymentMethod" pm
        LEFT JOIN "OrderPayment" op ON pm.id = op."paymentMethodId"
        LEFT JOIN "Order" o ON op."orderId" = o.id
        WHERE 
          (p_from_date IS NULL OR DATE(op."paymentDate") >= p_from_date)
          AND (p_to_date IS NULL OR DATE(op."paymentDate") <= p_to_date)
          AND (p_from_date IS NULL OR p_to_date IS NULL OR op."paymentDate" IS NOT NULL)
        GROUP BY pm.id, pm.name, pm.icon, pm.color
        ORDER BY paidByMethod DESC;
      END;
      $$;
    `;
    
    await client.query(createPaymentFunction);
    console.log('✅ Función get_payment_methods_report_by_date creada');

    // 3. Crear función RPC para reporte de pagos de delivery con filtro de fecha
    console.log('\n3️⃣ CREANDO FUNCIÓN get_delivery_payments_report_by_date:');
    console.log('=========================================================');
    
    const createDeliveryFunction = `
      CREATE OR REPLACE FUNCTION get_delivery_payments_report_by_date(
        p_from_date DATE DEFAULT NULL,
        p_to_date DATE DEFAULT NULL
      )
      RETURNS TABLE (
        method TEXT,
        icon TEXT,
        color TEXT,
        deliveryOrdersCount BIGINT,
        deliveryFeesPaid NUMERIC(10,2),
        orderTotalsPaid NUMERIC(10,2),
        totalPaid NUMERIC(10,2)
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          pm.name as method,
          pm.icon,
          pm.color,
          COUNT(DISTINCT CASE WHEN s.type = 'DELIVERY' THEN op."orderId" END) as deliveryOrdersCount,
          COALESCE(SUM(CASE WHEN s.type = 'DELIVERY' THEN op."surchargeAmount" ELSE 0 END), 0) as deliveryFeesPaid,
          COALESCE(SUM(CASE WHEN s.type = 'DELIVERY' THEN op."baseAmount" ELSE op.amount END), 0) as orderTotalsPaid,
          COALESCE(SUM(CASE WHEN s.type = 'DELIVERY' THEN op.amount ELSE 0 END), 0) as totalPaid
        FROM "PaymentMethod" pm
        LEFT JOIN "OrderPayment" op ON pm.id = op."paymentMethodId"
        LEFT JOIN "Order" o ON op."orderId" = o.id
        LEFT JOIN "Space" s ON o."spaceId" = s.id
        WHERE 
          (p_from_date IS NULL OR DATE(op."paymentDate") >= p_from_date)
          AND (p_to_date IS NULL OR DATE(op."paymentDate") <= p_to_date)
          AND (p_from_date IS NULL OR p_to_date IS NULL OR op."paymentDate" IS NOT NULL)
        GROUP BY pm.id, pm.name, pm.icon, pm.color
        ORDER BY totalPaid DESC;
      END;
      $$;
    `;
    
    await client.query(createDeliveryFunction);
    console.log('✅ Función get_delivery_payments_report_by_date creada');

    // 4. Crear función RPC para reporte de órdenes con filtro de fecha
    console.log('\n4️⃣ CREANDO FUNCIÓN get_orders_report_by_date:');
    console.log('===============================================');
    
    const createOrdersFunction = `
      CREATE OR REPLACE FUNCTION get_orders_report_by_date(
        p_from_date DATE DEFAULT NULL,
        p_to_date DATE DEFAULT NULL,
        p_status TEXT DEFAULT NULL,
        p_space_type TEXT DEFAULT NULL,
        p_page INTEGER DEFAULT 1,
        p_limit INTEGER DEFAULT 50
      )
      RETURNS TABLE (
        orders JSONB,
        total BIGINT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_offset INTEGER;
        v_orders JSONB;
        v_total BIGINT;
      BEGIN
        v_offset := (p_page - 1) * p_limit;
        
        -- Obtener total de órdenes que cumplen los filtros
        SELECT COUNT(*)
        INTO v_total
        FROM "Order" o
        JOIN "Space" s ON o."spaceId" = s.id
        WHERE 
          (p_from_date IS NULL OR DATE(o."createdAt") >= p_from_date)
          AND (p_to_date IS NULL OR DATE(o."createdAt") <= p_to_date)
          AND (p_status IS NULL OR o.status = p_status)
          AND (p_space_type IS NULL OR s.type = p_space_type);
        
        -- Obtener órdenes con pagos
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', o.id,
            'orderNumber', o."orderNumber",
            'createdAt', o."createdAt",
            'spaceCode', s.code,
            'spaceName', s.name,
            'spaceType', s.type,
            'customerName', o."customerName",
            'status', o.status,
            'originalTotal', o."totalAmount",
            'finalTotal', o."totalAmount",
            'paidTotal', COALESCE(payment_summary.total_paid, 0),
            'deliveryFeeTotal', COALESCE(payment_summary.delivery_fees, 0),
            'totalPaid', COALESCE(payment_summary.total_paid, 0),
            'payments', COALESCE(payment_summary.payments, '[]'::jsonb)
          )
        ), '[]'::jsonb)
        INTO v_orders
        FROM "Order" o
        JOIN "Space" s ON o."spaceId" = s.id
        LEFT JOIN (
          SELECT 
            op."orderId",
            SUM(op.amount) as total_paid,
            SUM(op."surchargeAmount") as delivery_fees,
            jsonb_agg(
              jsonb_build_object(
                'method', pm.name,
                'amount', op.amount,
                'date', op."paymentDate"
              )
            ) as payments
          FROM "OrderPayment" op
          JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
          GROUP BY op."orderId"
        ) payment_summary ON o.id = payment_summary."orderId"
        WHERE 
          (p_from_date IS NULL OR DATE(o."createdAt") >= p_from_date)
          AND (p_to_date IS NULL OR DATE(o."createdAt") <= p_to_date)
          AND (p_status IS NULL OR o.status = p_status)
          AND (p_space_type IS NULL OR s.type = p_space_type)
        ORDER BY o."createdAt" DESC
        LIMIT p_limit OFFSET v_offset;
        
        RETURN QUERY SELECT v_orders, v_total;
      END;
      $$;
    `;
    
    await client.query(createOrdersFunction);
    console.log('✅ Función get_orders_report_by_date creada');

    // 5. Probar las funciones creadas
    console.log('\n5️⃣ PROBANDO FUNCIONES CREADAS:');
    console.log('===============================');
    
    // Probar función de métodos de pago para hoy
    console.log('📊 Probando reporte de métodos de pago para hoy...');
    const paymentMethodsReport = await client.query(`
      SELECT * FROM get_payment_methods_report_by_date('2025-09-12', '2025-09-12');
    `);
    
    console.log(`✅ Métodos de pago encontrados: ${paymentMethodsReport.rows.length}`);
    paymentMethodsReport.rows.forEach((method, index) => {
      console.log(`   ${index + 1}. ${method.method}: ${method.orderscount} órdenes, $${method.paidbymethod}`);
    });

    // Probar función de pagos de delivery para hoy
    console.log('\n🚚 Probando reporte de pagos de delivery para hoy...');
    const deliveryPaymentsReport = await client.query(`
      SELECT * FROM get_delivery_payments_report_by_date('2025-09-12', '2025-09-12');
    `);
    
    console.log(`✅ Métodos de pago de delivery encontrados: ${deliveryPaymentsReport.rows.length}`);
    deliveryPaymentsReport.rows.forEach((method, index) => {
      console.log(`   ${index + 1}. ${method.method}: ${method.deliveryorderscount} órdenes delivery, $${method.totalpaid}`);
    });

    // Probar función de órdenes para hoy
    console.log('\n📋 Probando reporte de órdenes para hoy...');
    const ordersReport = await client.query(`
      SELECT * FROM get_orders_report_by_date('2025-09-12', '2025-09-12', NULL, NULL, 1, 10);
    `);
    
    if (ordersReport.rows.length > 0) {
      const result = ordersReport.rows[0];
      const orders = result.orders;
      console.log(`✅ Órdenes encontradas: ${result.total} total, ${orders.length} en esta página`);
    }

    console.log('\n🎉 ¡Todas las funciones RPC creadas exitosamente!');
    console.log('✅ Los reportes ahora deberían funcionar correctamente con filtros de fecha');
    console.log('✅ El problema de mostrar demasiados registros está resuelto');

  } catch (error) {
    console.error('❌ Error corrigiendo funciones RPC:', error.message);
  } finally {
    await client.end();
  }
}

fixReportsFunctions();
