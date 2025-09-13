const { Client } = require('pg');
const axios = require('axios');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function investigatePaymentFlow() {
  console.log('🔍 Investigando problema del flujo de pagos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Verificar órdenes activas de hoy
    console.log('1️⃣ ÓRDENES ACTIVAS DE HOY:');
    console.log('===========================');
    
    const todayOrders = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o.status,
        o."totalAmount",
        s.name as space_name,
        s.type as space_type,
        COUNT(op.id) as payment_count,
        SUM(op.amount) as total_paid
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE DATE(o."createdAt") = CURRENT_DATE
      GROUP BY o.id, o."orderNumber", o."createdAt", o."customerName", o.status, o."totalAmount", s.name, s.type
      ORDER BY o."createdAt" DESC;
    `);
    
    console.log(`📅 Órdenes creadas hoy: ${todayOrders.rows.length}`);
    todayOrders.rows.forEach(order => {
      console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.status} - $${order.totalAmount} - Pagos: ${order.payment_count} ($${order.total_paid || 0}) - ${order.space_name}`);
    });

    // 2. Verificar órdenes pendientes (que deberían aparecer como activas)
    console.log('\n2️⃣ ÓRDENES PENDIENTES (ACTIVAS):');
    console.log('=================================');
    
    const pendingOrders = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o.status,
        o."totalAmount",
        s.name as space_name,
        s.type as space_type
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o.status = 'PENDIENTE'
      ORDER BY o."createdAt" DESC;
    `);
    
    console.log(`⏳ Órdenes pendientes: ${pendingOrders.rows.length}`);
    pendingOrders.rows.forEach(order => {
      console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - $${order.totalAmount} - ${order.space_name} - ${order.createdAt}`);
    });

    // 3. Verificar órdenes marcadas como pagadas pero sin pagos
    console.log('\n3️⃣ ÓRDENES MARCADAS COMO PAGADAS SIN PAGOS:');
    console.log('============================================');
    
    const paidOrdersWithoutPayments = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."createdAt",
        o."customerName",
        o.status,
        o."totalAmount",
        s.name as space_name
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
      WHERE o.status IN ('PAGADO', 'ENTREGADO')
      AND op.id IS NULL
      AND DATE(o."createdAt") >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY o."createdAt" DESC;
    `);
    
    console.log(`❌ Órdenes marcadas como pagadas sin pagos: ${paidOrdersWithoutPayments.rows.length}`);
    paidOrdersWithoutPayments.rows.forEach(order => {
      console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.status} - $${order.totalAmount} - ${order.space_name}`);
    });

    // 4. Verificar pagos de hoy
    console.log('\n4️⃣ PAGOS REGISTRADOS HOY:');
    console.log('=========================');
    
    const todayPayments = await client.query(`
      SELECT 
        op.id,
        op.amount,
        op."paymentDate",
        op."isDeliveryService",
        pm.name as payment_method,
        o."orderNumber",
        o."customerName"
      FROM "OrderPayment" op
      JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
      JOIN "Order" o ON op."orderId" = o.id
      WHERE DATE(op."createdAt") = CURRENT_DATE
      ORDER BY op."createdAt" DESC;
    `);
    
    console.log(`💳 Pagos registrados hoy: ${todayPayments.rows.length}`);
    todayPayments.rows.forEach(payment => {
      console.log(`   - ${payment.orderNumber}: $${payment.amount} - ${payment.payment_method} - ${payment.paymentDate} - Delivery: ${payment.isDeliveryService}`);
    });

    // 5. Probar endpoints de pago
    console.log('\n5️⃣ PROBANDO ENDPOINTS DE PAGO:');
    console.log('===============================');

    try {
      // Verificar salud del backend
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend saludable:', healthResponse.data);

      // Obtener token de autenticación
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'test123'
      });
      const token = loginResponse.data.access_token;
      console.log('✅ Token obtenido');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Probar endpoint de órdenes activas
      try {
        const activeOrdersResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`, { headers });
        console.log(`✅ Órdenes de cocina: ${activeOrdersResponse.data.length} órdenes`);
        
        if (activeOrdersResponse.data.length > 0) {
          console.log('📋 Órdenes activas encontradas:');
          activeOrdersResponse.data.forEach(order => {
            console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.status} - $${order.totalAmount}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error obteniendo órdenes activas: ${error.response?.status} - ${error.response?.data?.message}`);
      }

      // Probar endpoint de reportes
      try {
        const reportsResponse = await axios.get(`${API_BASE_URL}/reports/orders`, {
          headers,
          params: {
            from: new Date().toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
            page: 1,
            limit: 10
          }
        });
        console.log(`✅ Reportes de hoy: ${reportsResponse.data.total} órdenes totales, ${reportsResponse.data.orders.length} en página`);
        
        if (reportsResponse.data.orders.length > 0) {
          console.log('📊 Órdenes en reportes de hoy:');
          reportsResponse.data.orders.forEach(order => {
            console.log(`   - ${order.orderNumber}: ${order.customerName || 'Sin cliente'} - ${order.status} - $${order.finalTotal}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error obteniendo reportes: ${error.response?.status} - ${error.response?.data?.message}`);
      }

    } catch (error) {
      console.log('❌ Error conectando con el backend:', error.message);
    }

    // 6. Verificar función RPC de creación de órdenes
    console.log('\n6️⃣ VERIFICANDO FUNCIÓN RPC DE ÓRDENES:');
    console.log('=======================================');
    
    const rpcCheck = await client.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_name = 'create_order_with_items'
      AND routine_schema = 'public';
    `);
    
    if (rpcCheck.rows.length > 0) {
      console.log('✅ Función create_order_with_items existe');
      
      // Probar la función con datos de prueba
      try {
        const testResult = await client.query(`
          SELECT * FROM create_order_with_items(
            '42d2ac16-2811-4e01-9e76-f8ab02d1aea2'::uuid,
            'Cliente Test Pago',
            null,
            0,
            '[{"productId": null, "comboId": "50e89c2d-3980-4001-84b9-73dd1944bef7", "name": "Test Combo", "unitPrice": 25.90, "totalPrice": 25.90, "quantity": 1, "notes": "Test"}]'::jsonb,
            'Test de pago',
            '9c82ca4e-b15f-4f96-ad82-aa423dd0c28c'::uuid,
            25.90,
            0,
            25.90,
            0,
            false
          );
        `);
        console.log('✅ Función RPC funciona correctamente');
        console.log(`   Orden creada: ${testResult.rows[0].ordernumber}`);
      } catch (error) {
        console.log('❌ Error probando función RPC:', error.message);
      }
    } else {
      console.log('❌ Función create_order_with_items NO EXISTE');
    }

    // 7. Resumen y diagnóstico
    console.log('\n7️⃣ DIAGNÓSTICO DEL PROBLEMA:');
    console.log('=============================');
    
    const issues = [];
    
    if (paidOrdersWithoutPayments.rows.length > 0) {
      issues.push(`${paidOrdersWithoutPayments.rows.length} órdenes marcadas como pagadas sin pagos registrados`);
    }
    
    if (pendingOrders.rows.length > 0) {
      issues.push(`${pendingOrders.rows.length} órdenes pendientes que deberían poder pagarse`);
    }
    
    if (todayPayments.rows.length === 0) {
      issues.push('No hay pagos registrados hoy');
    }
    
    if (issues.length > 0) {
      console.log('⚠️ PROBLEMAS IDENTIFICADOS:');
      issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      
      console.log('\n🔧 POSIBLES CAUSAS:');
      console.log('   1. Error en el frontend al enviar datos de pago');
      console.log('   2. Error en el backend al procesar pagos');
      console.log('   3. Error en la función RPC de pagos');
      console.log('   4. Problema de autenticación/autorización');
      console.log('   5. Error en la actualización de estado de órdenes');
    } else {
      console.log('✅ No se encontraron problemas obvios en el flujo de pagos');
    }

  } catch (error) {
    console.error('❌ Error durante la investigación:', error.message);
  } finally {
    await client.end();
  }
}

investigatePaymentFlow();

