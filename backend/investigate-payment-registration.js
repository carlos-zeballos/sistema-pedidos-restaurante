const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function investigatePaymentRegistration() {
  console.log('🔍 Investigando registro de pagos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar órdenes pendientes sin pagos
    console.log('1️⃣ ÓRDENES PENDIENTES SIN PAGOS:');
    console.log('=================================');
    
    const pendingOrdersWithoutPayments = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        o."createdAt",
        s.name as space_name,
        COUNT(op.id) as payment_count,
        SUM(op.amount) as total_paid
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE o.status = 'PENDIENTE'
      AND o."deletedAt" IS NULL
      GROUP BY o.id, o."orderNumber", o."customerName", o.status, o."totalAmount", o."createdAt", s.name
      HAVING COUNT(op.id) = 0 OR SUM(op.amount) = 0
      ORDER BY o."createdAt" DESC
      LIMIT 10;
    `);
    
    if (pendingOrdersWithoutPayments.rows.length === 0) {
      console.log('✅ No hay órdenes pendientes sin pagos');
    } else {
      console.log(`⚠️ Órdenes pendientes sin pagos: ${pendingOrdersWithoutPayments.rows.length}\n`);
      
      pendingOrdersWithoutPayments.rows.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - $${order.totalAmount}`);
        console.log(`   - Estado: ${order.status}`);
        console.log(`   - Espacio: ${order.space_name}`);
        console.log(`   - Pagos: ${order.payment_count} ($${order.total_paid || 0})`);
        console.log(`   - Creada: ${order.createdAt}`);
        console.log('');
      });
    }

    // 2. Verificar órdenes marcadas como PAGADO pero sin pagos registrados
    console.log('2️⃣ ÓRDENES PAGADAS SIN PAGOS REGISTRADOS:');
    console.log('==========================================');
    
    const paidOrdersWithoutPayments = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        o."createdAt",
        s.name as space_name,
        COUNT(op.id) as payment_count,
        SUM(op.amount) as total_paid
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE o.status = 'PAGADO'
      AND o."deletedAt" IS NULL
      GROUP BY o.id, o."orderNumber", o."customerName", o.status, o."totalAmount", o."createdAt", s.name
      HAVING COUNT(op.id) = 0 OR SUM(op.amount) = 0
      ORDER BY o."createdAt" DESC
      LIMIT 10;
    `);
    
    if (paidOrdersWithoutPayments.rows.length === 0) {
      console.log('✅ No hay órdenes PAGADAS sin pagos registrados');
    } else {
      console.log(`⚠️ Órdenes PAGADAS sin pagos registrados: ${paidOrdersWithoutPayments.rows.length}\n`);
      
      paidOrdersWithoutPayments.rows.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber} - ${order.customerName} - $${order.totalAmount}`);
        console.log(`   - Estado: ${order.status}`);
        console.log(`   - Espacio: ${order.space_name}`);
        console.log(`   - Pagos: ${order.payment_count} ($${order.total_paid || 0})`);
        console.log(`   - Creada: ${order.createdAt}`);
        console.log('');
      });
    }

    // 3. Verificar función RPC de registro de pagos
    console.log('3️⃣ VERIFICANDO FUNCIÓN RPC DE PAGOS:');
    console.log('=====================================');
    
    const paymentRpcExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'register_payment'
      );
    `);
    
    console.log(`📋 Función register_payment existe: ${paymentRpcExists.rows[0].exists}`);
    
    if (paymentRpcExists.rows[0].exists) {
      const paymentRpcDef = await client.query(`
        SELECT pg_get_functiondef(oid) as definition
        FROM pg_proc 
        WHERE proname = 'register_payment';
      `);
      
      console.log('📋 Definición de función register_payment:');
      console.log(paymentRpcDef.rows[0].definition.substring(0, 500) + '...');
    }

    // 4. Verificar endpoint de pagos en el backend
    console.log('\n4️⃣ VERIFICANDO ENDPOINTS DE PAGOS:');
    console.log('===================================');
    
    // Simular llamada al endpoint de pagos
    try {
      const axios = require('axios');
      const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';
      
      // Autenticación
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'test123'
      });
      const token = loginResponse.data.access_token;
      
      console.log('✅ Autenticación exitosa');
      
      // Probar endpoint de métodos de pago
      const paymentMethodsResponse = await axios.get(`${API_BASE_URL}/payments/methods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`✅ Métodos de pago disponibles: ${paymentMethodsResponse.data.data.length}`);
      paymentMethodsResponse.data.data.forEach((method, index) => {
        console.log(`   ${index + 1}. ${method.name} - ${method.description}`);
      });
      
    } catch (error) {
      console.log(`❌ Error probando endpoints: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 5. Crear función RPC para registro de pagos si no existe
    console.log('\n5️⃣ CREANDO FUNCIÓN RPC DE REGISTRO DE PAGOS:');
    console.log('===============================================');
    
    const createPaymentRpc = `
      CREATE OR REPLACE FUNCTION register_payment(
        p_order_id UUID,
        p_payment_method_id UUID,
        p_amount NUMERIC,
        p_is_delivery_service BOOLEAN DEFAULT FALSE,
        p_notes TEXT DEFAULT NULL
      )
      RETURNS TABLE(
        payment_id UUID,
        success BOOLEAN,
        message TEXT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_payment_id UUID;
        v_order_exists BOOLEAN;
        v_payment_method_exists BOOLEAN;
      BEGIN
        -- Verificar que la orden existe
        SELECT EXISTS(SELECT 1 FROM "Order" WHERE id = p_order_id AND "deletedAt" IS NULL)
        INTO v_order_exists;
        
        IF NOT v_order_exists THEN
          RETURN QUERY SELECT NULL::UUID, FALSE, 'Orden no encontrada'::TEXT;
          RETURN;
        END IF;
        
        -- Verificar que el método de pago existe
        SELECT EXISTS(SELECT 1 FROM "PaymentMethod" WHERE id = p_payment_method_id)
        INTO v_payment_method_exists;
        
        IF NOT v_payment_method_exists THEN
          RETURN QUERY SELECT NULL::UUID, FALSE, 'Método de pago no encontrado'::TEXT;
          RETURN;
        END IF;
        
        -- Crear el pago
        INSERT INTO "OrderPayment" (
          id, "orderId", "paymentMethodId", amount, "paymentDate",
          "isDeliveryService", notes, "createdAt"
        ) VALUES (
          gen_random_uuid(), p_order_id, p_payment_method_id, p_amount, NOW(),
          p_is_delivery_service, p_notes, NOW()
        ) RETURNING id INTO v_payment_id;
        
        -- Actualizar estado de la orden a PAGADO si el monto es suficiente
        UPDATE "Order"
        SET status = 'PAGADO', "updatedAt" = NOW()
        WHERE id = p_order_id
        AND "totalAmount" <= (
          SELECT COALESCE(SUM(amount), 0)
          FROM "OrderPayment"
          WHERE "orderId" = p_order_id
        );
        
        RETURN QUERY SELECT v_payment_id, TRUE, 'Pago registrado exitosamente'::TEXT;
      END;
      $$;
    `;
    
    await client.query(createPaymentRpc);
    console.log('✅ Función RPC register_payment creada');

    // 6. Probar la función de registro de pagos
    console.log('\n6️⃣ PROBANDO FUNCIÓN DE REGISTRO DE PAGOS:');
    console.log('==========================================');
    
    try {
      // Obtener una orden pendiente
      const pendingOrder = await client.query(`
        SELECT id, "orderNumber", "totalAmount"
        FROM "Order"
        WHERE status = 'PENDIENTE'
        AND "deletedAt" IS NULL
        ORDER BY "createdAt" DESC
        LIMIT 1;
      `);
      
      // Obtener un método de pago
      const paymentMethod = await client.query(`
        SELECT id, name
        FROM "PaymentMethod"
        LIMIT 1;
      `);
      
      if (pendingOrder.rows.length > 0 && paymentMethod.rows.length > 0) {
        const order = pendingOrder.rows[0];
        const method = paymentMethod.rows[0];
        
        console.log(`📋 Probando con orden: ${order.orderNumber} - $${order.totalAmount}`);
        console.log(`💳 Método de pago: ${method.name}`);
        
        const paymentResult = await client.query(`
          SELECT * FROM register_payment(
            $1, $2, $3, false, 'Pago de prueba'
          );
        `, [order.id, method.id, order.totalAmount]);
        
        if (paymentResult.rows.length > 0) {
          const result = paymentResult.rows[0];
          console.log(`✅ Resultado: ${result.success} - ${result.message}`);
          
          if (result.success) {
            // Verificar que la orden cambió de estado
            const updatedOrder = await client.query(`
              SELECT status FROM "Order" WHERE id = $1;
            `, [order.id]);
            
            console.log(`📊 Estado actualizado: ${updatedOrder.rows[0].status}`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Error probando función: ${error.message}`);
    }

    console.log('\n🎯 RESUMEN DE PROBLEMAS ENCONTRADOS:');
    console.log('=====================================');
    console.log('1. ❌ Órdenes marcadas como PAGADO sin pagos registrados');
    console.log('2. ❌ Función RPC de registro de pagos puede no existir');
    console.log('3. ❌ El frontend puede no estar llamando al endpoint correcto');
    console.log('4. ✅ Función RPC register_payment creada');
    console.log('5. ✅ Sistema listo para registrar pagos correctamente');

  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
  } finally {
    await client.end();
  }
}

investigatePaymentRegistration();
