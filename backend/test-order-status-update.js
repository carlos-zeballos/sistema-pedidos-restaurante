const { Client } = require('pg');
const axios = require('axios');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testOrderStatusUpdate() {
  console.log('🧪 Probando actualización de estado de órdenes...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Obtener una orden pendiente con pago
    console.log('1️⃣ SELECCIONANDO ORDEN PENDIENTE CON PAGO:');
    console.log('==========================================');
    
    const pendingOrderWithPayment = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o.status,
        o."totalAmount",
        COUNT(op.id) as payment_count,
        SUM(op.amount) as total_paid
      FROM "Order" o
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE o.status = 'PENDIENTE'
      GROUP BY o.id, o."orderNumber", o."customerName", o.status, o."totalAmount"
      HAVING COUNT(op.id) > 0
      ORDER BY o."createdAt" DESC
      LIMIT 1;
    `);
    
    if (pendingOrderWithPayment.rows.length === 0) {
      console.log('❌ No hay órdenes pendientes con pagos');
      return;
    }
    
    const order = pendingOrderWithPayment.rows[0];
    console.log(`📋 Orden: ${order.orderNumber}`);
    console.log(`   - Estado: ${order.status}`);
    console.log(`   - Total: $${order.totalAmount}`);
    console.log(`   - Pagos: ${order.payment_count} ($${order.total_paid})`);

    // 2. Probar endpoints de actualización de estado
    console.log('\n2️⃣ PROBANDO ENDPOINTS DE ACTUALIZACIÓN:');
    console.log('=======================================');

    try {
      // Autenticación
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'test123'
      });
      const token = loginResponse.data.access_token;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Probar endpoint /orders/test/{id}/status (el que usa el frontend)
      console.log('📤 Probando /orders/test/{id}/status...');
      try {
        const testStatusResponse = await axios.put(`${API_BASE_URL}/orders/test/${order.id}/status`, {
          status: 'PAGADO'
        }, { headers });
        console.log('✅ /orders/test/{id}/status funciona:', testStatusResponse.data);
      } catch (error) {
        console.log(`❌ /orders/test/{id}/status falla: ${error.response?.status} - ${error.response?.data?.message}`);
      }

      // Probar endpoint /orders/{id}/status (endpoint estándar)
      console.log('\n📤 Probando /orders/{id}/status...');
      try {
        const standardStatusResponse = await axios.put(`${API_BASE_URL}/orders/${order.id}/status`, {
          status: 'PAGADO'
        }, { headers });
        console.log('✅ /orders/{id}/status funciona:', standardStatusResponse.data);
      } catch (error) {
        console.log(`❌ /orders/{id}/status falla: ${error.response?.status} - ${error.response?.data?.message}`);
      }

      // Verificar si el estado cambió
      const updatedOrder = await client.query(`
        SELECT status FROM "Order" WHERE id = $1;
      `, [order.id]);
      
      console.log(`📊 Estado actual: ${updatedOrder.rows[0].status}`);

    } catch (error) {
      console.log(`❌ Error general: ${error.message}`);
    }

    // 3. Verificar qué endpoints existen en el backend
    console.log('\n3️⃣ VERIFICANDO ENDPOINTS DISPONIBLES:');
    console.log('=====================================');

    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'test123'
      });
      const token = loginResponse.data.access_token;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Probar diferentes endpoints
      const endpoints = [
        `/orders/${order.id}/status`,
        `/orders/test/${order.id}/status`,
        `/orders/${order.id}`,
        `/orders/test/${order.id}`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.put(`${API_BASE_URL}${endpoint}`, {
            status: 'PAGADO'
          }, { headers });
          console.log(`✅ ${endpoint}: ${response.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message}`);
        }
      }

    } catch (error) {
      console.log(`❌ Error verificando endpoints: ${error.message}`);
    }

    // 4. Crear función RPC para actualizar estado automáticamente
    console.log('\n4️⃣ CREANDO FUNCIÓN RPC PARA ACTUALIZAR ESTADO:');
    console.log('===============================================');
    
    const createUpdateStatusRpc = `
      CREATE OR REPLACE FUNCTION update_order_status_after_payment(
        p_order_id UUID
      )
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, pg_temp
      AS $$
      DECLARE
        v_order_total NUMERIC(10,2);
        v_paid_total NUMERIC(10,2);
        v_status TEXT;
      BEGIN
        -- Obtener total de la orden
        SELECT "totalAmount" INTO v_order_total
        FROM "Order"
        WHERE id = p_order_id;
        
        -- Obtener total pagado
        SELECT COALESCE(SUM(amount), 0) INTO v_paid_total
        FROM "OrderPayment"
        WHERE "orderId" = p_order_id;
        
        -- Determinar nuevo estado
        IF v_paid_total >= v_order_total THEN
          v_status := 'PAGADO';
        ELSE
          v_status := 'PENDIENTE';
        END IF;
        
        -- Actualizar estado de la orden
        UPDATE "Order"
        SET status = v_status, "updatedAt" = NOW()
        WHERE id = p_order_id;
        
        RETURN TRUE;
      END;
      $$;
    `;
    
    await client.query(createUpdateStatusRpc);
    console.log('✅ Función update_order_status_after_payment creada');

    // Probar la función
    const testRpcResult = await client.query(`
      SELECT update_order_status_after_payment($1);
    `, [order.id]);
    
    console.log('✅ Función RPC ejecutada:', testRpcResult.rows[0].update_order_status_after_payment);

    // Verificar estado final
    const finalOrder = await client.query(`
      SELECT status FROM "Order" WHERE id = $1;
    `, [order.id]);
    
    console.log(`📊 Estado final: ${finalOrder.rows[0].status}`);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  } finally {
    await client.end();
  }
}

testOrderStatusUpdate();

