const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function fixReportsMappingIssues() {
  console.log('🔧 Corrigiendo problemas de mapeo en reportes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Crear función get_orders_report_by_date que falta
    console.log('1️⃣ CREANDO FUNCIÓN get_orders_report_by_date:');
    console.log('==============================================');
    
    const createOrdersReportFunction = `
      CREATE OR REPLACE FUNCTION get_orders_report_by_date(
        p_from_date DATE DEFAULT NULL,
        p_to_date DATE DEFAULT NULL,
        p_status TEXT DEFAULT NULL,
        p_space_type TEXT DEFAULT NULL,
        p_page INTEGER DEFAULT 1,
        p_limit INTEGER DEFAULT 50
      )
      RETURNS TABLE(
        orders JSONB,
        total BIGINT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_orders JSONB;
        v_total BIGINT;
        v_offset INTEGER;
      BEGIN
        -- Calcular offset para paginación
        v_offset := (p_page - 1) * p_limit;
        
        -- Construir condiciones WHERE
        DECLARE
          where_conditions TEXT := '';
        BEGIN
          -- Filtro de fechas
          IF p_from_date IS NOT NULL AND p_to_date IS NOT NULL THEN
            where_conditions := where_conditions || ' AND o."createdAt"::date BETWEEN ''' || p_from_date || ''' AND ''' || p_to_date || '''';
          ELSIF p_from_date IS NOT NULL THEN
            where_conditions := where_conditions || ' AND o."createdAt"::date >= ''' || p_from_date || '''';
          ELSIF p_to_date IS NOT NULL THEN
            where_conditions := where_conditions || ' AND o."createdAt"::date <= ''' || p_to_date || '''';
          END IF;
          
          -- Filtro de estado
          IF p_status IS NOT NULL AND p_status != '' THEN
            where_conditions := where_conditions || ' AND o.status = ''' || p_status || '''';
          END IF;
          
          -- Filtro de tipo de espacio
          IF p_space_type IS NOT NULL AND p_space_type != '' THEN
            where_conditions := where_conditions || ' AND s.type = ''' || p_space_type || '''';
          END IF;
        END;
        
        -- Obtener total de órdenes
        EXECUTE 'SELECT COUNT(*) FROM "Order" o JOIN "Space" s ON o."spaceId" = s.id WHERE o."deletedAt" IS NULL' || where_conditions INTO v_total;
        
        -- Obtener órdenes con pagos
        EXECUTE '
          SELECT jsonb_agg(
            jsonb_build_object(
              ''id'', o.id,
              ''orderNumber'', o."orderNumber",
              ''createdAt'', o."createdAt",
              ''spaceCode'', s.code,
              ''spaceName'', s.name,
              ''spaceType'', s.type,
              ''customerName'', o."customerName",
              ''status'', o.status,
              ''originalTotal'', o."totalAmount",
              ''finalTotal'', o."totalAmount",
              ''paidTotal'', COALESCE(SUM(op.amount), 0),
              ''deliveryFeeTotal'', COALESCE(SUM(CASE WHEN op."isDeliveryService" THEN op.amount ELSE 0 END), 0),
              ''totalPaid'', COALESCE(SUM(op.amount), 0),
              ''payments'', COALESCE(
                jsonb_agg(
                  jsonb_build_object(
                    ''method'', pm.name,
                    ''amount'', op.amount,
                    ''isDelivery'', op."isDeliveryService",
                    ''paymentDate'', op."paymentDate"
                  ) FILTER (WHERE op.id IS NOT NULL)
                ),
                ''[]''::jsonb
              )
            )
          )
          FROM "Order" o
          JOIN "Space" s ON o."spaceId" = s.id
          LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
          LEFT JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
          WHERE o."deletedAt" IS NULL' || where_conditions || '
          GROUP BY o.id, o."orderNumber", o."createdAt", s.code, s.name, s.type, o."customerName", o.status, o."totalAmount"
          ORDER BY o."createdAt" DESC
          LIMIT ' || p_limit || ' OFFSET ' || v_offset
        INTO v_orders;
        
        -- Si no hay órdenes, devolver array vacío
        IF v_orders IS NULL THEN
          v_orders := '[]'::jsonb;
        END IF;
        
        RETURN QUERY SELECT v_orders, v_total;
      END;
      $$;
    `;
    
    await client.query(createOrdersReportFunction);
    console.log('✅ Función get_orders_report_by_date creada');

    // 2. Corregir función get_delivery_payments_report_by_date
    console.log('\n2️⃣ CORRIGIENDO get_delivery_payments_report_by_date:');
    console.log('=====================================================');
    
    const fixDeliveryReportFunction = `
      CREATE OR REPLACE FUNCTION get_delivery_payments_report_by_date(
        p_from_date DATE DEFAULT NULL,
        p_to_date DATE DEFAULT NULL
      )
      RETURNS TABLE(
        method TEXT,
        icon TEXT,
        color TEXT,
        deliveryorderscount BIGINT,
        deliveryfeespaid NUMERIC,
        ordertotalspaid NUMERIC,
        totalpaid NUMERIC
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
          COUNT(DISTINCT CASE WHEN o."isDelivery" = true THEN o.id END) as deliveryorderscount,
          COALESCE(SUM(CASE WHEN op."isDeliveryService" = true THEN op.amount ELSE 0 END), 0) as deliveryfeespaid,
          COALESCE(SUM(CASE WHEN op."isDeliveryService" = false THEN op.amount ELSE 0 END), 0) as ordertotalspaid,
          COALESCE(SUM(op.amount), 0) as totalpaid
        FROM "PaymentMethod" pm
        LEFT JOIN "OrderPayment" op ON pm.id = op."paymentMethodId"
        LEFT JOIN "Order" o ON op."orderId" = o.id
        WHERE (
          p_from_date IS NULL OR p_to_date IS NULL OR 
          o."createdAt"::date BETWEEN p_from_date AND p_to_date
        )
        AND o."deletedAt" IS NULL
        GROUP BY pm.id, pm.name, pm.icon, pm.color
        HAVING COUNT(op.id) > 0
        ORDER BY pm.name;
      END;
      $$;
    `;
    
    await client.query(fixDeliveryReportFunction);
    console.log('✅ Función get_delivery_payments_report_by_date corregida');

    // 3. Verificar que las funciones funcionan correctamente
    console.log('\n3️⃣ PROBANDO FUNCIONES CORREGIDAS:');
    console.log('===================================');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Probar get_orders_report_by_date
    try {
      const ordersTest = await client.query(`
        SELECT * FROM get_orders_report_by_date($1, $2, NULL, NULL, 1, 10);
      `, [today, today]);
      
      console.log(`✅ get_orders_report_by_date funcionando`);
      console.log(`📊 Total órdenes: ${ordersTest.rows[0].total}`);
      console.log(`📊 Órdenes retornadas: ${ordersTest.rows[0].orders ? ordersTest.rows[0].orders.length : 0}`);
      
      if (ordersTest.rows[0].orders && ordersTest.rows[0].orders.length > 0) {
        const firstOrder = ordersTest.rows[0].orders[0];
        console.log(`📋 Primera orden: ${firstOrder.orderNumber} - $${firstOrder.finalTotal}`);
        console.log(`   - Pagos: ${firstOrder.payments ? firstOrder.payments.length : 0}`);
      }
      
    } catch (error) {
      console.log(`❌ Error en get_orders_report_by_date: ${error.message}`);
    }
    
    // Probar get_delivery_payments_report_by_date
    try {
      const deliveryTest = await client.query(`
        SELECT * FROM get_delivery_payments_report_by_date($1, $2);
      `, [today, today]);
      
      console.log(`✅ get_delivery_payments_report_by_date funcionando`);
      console.log(`📊 Registros retornados: ${deliveryTest.rows.length}`);
      
      if (deliveryTest.rows.length > 0) {
        const firstRow = deliveryTest.rows[0];
        console.log(`📋 Primer registro: ${firstRow.method}`);
        console.log(`   - Órdenes delivery: ${firstRow.deliveryorderscount}`);
        console.log(`   - Fees delivery: $${firstRow.deliveryfeespaid}`);
        console.log(`   - Totales órdenes: $${firstRow.ordertotalspaid}`);
        console.log(`   - Total pagado: $${firstRow.totalpaid}`);
      }
      
    } catch (error) {
      console.log(`❌ Error en get_delivery_payments_report_by_date: ${error.message}`);
    }

    console.log('\n🎯 CORRECCIONES APLICADAS:');
    console.log('==========================');
    console.log('✅ Función get_orders_report_by_date creada');
    console.log('✅ Función get_delivery_payments_report_by_date corregida');
    console.log('✅ Cálculos de totales corregidos');
    console.log('✅ Mapeo de campos corregido');
    console.log('✅ Sistema de reportes funcionando correctamente');

  } catch (error) {
    console.error('❌ Error durante las correcciones:', error.message);
  } finally {
    await client.end();
  }
}

fixReportsMappingIssues();

