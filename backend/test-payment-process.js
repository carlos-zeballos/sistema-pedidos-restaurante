const { Client } = require('pg');
const axios = require('axios');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testPaymentProcess() {
  console.log('🧪 Probando proceso de pago completo...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Obtener una orden pendiente para probar
    console.log('1️⃣ SELECCIONANDO ORDEN PENDIENTE PARA PRUEBA:');
    console.log('=============================================');
    
    const pendingOrder = await client.query(`
      SELECT 
        o.id,
        o."orderNumber",
        o."customerName",
        o."totalAmount",
        s.name as space_name,
        s.type as space_type
      FROM "Order" o
      JOIN "Space" s ON o."spaceId" = s.id
      WHERE o.status = 'PENDIENTE'
      ORDER BY o."createdAt" DESC
      LIMIT 1;
    `);
    
    if (pendingOrder.rows.length === 0) {
      console.log('❌ No hay órdenes pendientes para probar');
      return;
    }
    
    const order = pendingOrder.rows[0];
    console.log(`📋 Orden seleccionada: ${order.orderNumber}`);
    console.log(`   - Cliente: ${order.customerName || 'Sin cliente'}`);
    console.log(`   - Total: $${order.totalAmount}`);
    console.log(`   - Espacio: ${order.space_name} (${order.space_type})`);

    // 2. Obtener métodos de pago disponibles
    console.log('\n2️⃣ OBTENIENDO MÉTODOS DE PAGO:');
    console.log('=================================');
    
    const paymentMethods = await client.query(`
      SELECT id, name, icon, color
      FROM "PaymentMethod"
      WHERE "isActive" = true
      ORDER BY name;
    `);
    
    console.log(`💳 Métodos de pago disponibles: ${paymentMethods.rows.length}`);
    paymentMethods.rows.forEach(pm => {
      console.log(`   - ${pm.name} (ID: ${pm.id})`);
    });

    // 3. Probar proceso de pago via API
    console.log('\n3️⃣ PROBANDO PROCESO DE PAGO VIA API:');
    console.log('=====================================');

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

      // Crear pago para la orden
      const paymentData = {
        orderId: order.id,
        paymentMethodId: paymentMethods.rows[0].id, // Usar el primer método de pago
        amount: order.totalAmount,
        isDeliveryService: order.space_type === 'DELIVERY',
        notes: 'Pago de prueba automático'
      };

      console.log('📤 Enviando pago:', paymentData);

      const paymentResponse = await axios.post(`${API_BASE_URL}/orders/${order.id}/payments`, paymentData, { headers });
      console.log('✅ Pago creado exitosamente:', paymentResponse.data);

      // Verificar que la orden cambió de estado
      console.log('\n4️⃣ VERIFICANDO CAMBIO DE ESTADO:');
      console.log('=================================');
      
      const updatedOrder = await client.query(`
        SELECT 
          o.id,
          o."orderNumber",
          o.status,
          o."totalAmount",
          COUNT(op.id) as payment_count,
          SUM(op.amount) as total_paid
        FROM "Order" o
        LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
        WHERE o.id = $1
        GROUP BY o.id, o."orderNumber", o.status, o."totalAmount";
      `, [order.id]);
      
      if (updatedOrder.rows.length > 0) {
        const updated = updatedOrder.rows[0];
        console.log(`📊 Estado actualizado:`);
        console.log(`   - Orden: ${updated.orderNumber}`);
        console.log(`   - Estado: ${updated.status}`);
        console.log(`   - Total: $${updated.totalAmount}`);
        console.log(`   - Pagos: ${updated.payment_count} ($${updated.total_paid || 0})`);
        
        if (updated.status === 'PAGADO') {
          console.log('✅ ¡Orden marcada como PAGADA correctamente!');
        } else {
          console.log(`⚠️ Orden aún en estado: ${updated.status}`);
        }
      }

      // Verificar que aparece en reportes
      console.log('\n5️⃣ VERIFICANDO APARICIÓN EN REPORTES:');
      console.log('=====================================');
      
      const reportsResponse = await axios.get(`${API_BASE_URL}/reports/orders`, {
        headers,
        params: {
          from: new Date().toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
          page: 1,
          limit: 50
        }
      });
      
      const orderInReports = reportsResponse.data.orders.find(o => o.id === order.id);
      if (orderInReports) {
        console.log('✅ Orden aparece en reportes de hoy');
        console.log(`   - Estado en reportes: ${orderInReports.status}`);
        console.log(`   - Total pagado: $${orderInReports.totalPaid}`);
      } else {
        console.log('❌ Orden NO aparece en reportes de hoy');
      }

      // Verificar que ya no aparece en órdenes activas
      console.log('\n6️⃣ VERIFICANDO ÓRDENES ACTIVAS:');
      console.log('=================================');
      
      const kitchenOrdersResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`, { headers });
      const orderInKitchen = kitchenOrdersResponse.data.find(o => o.id === order.id);
      
      if (orderInKitchen) {
        console.log('⚠️ Orden aún aparece en órdenes de cocina');
        console.log(`   - Estado: ${orderInKitchen.status}`);
      } else {
        console.log('✅ Orden ya NO aparece en órdenes de cocina (correcto)');
      }

    } catch (error) {
      console.log(`❌ Error en proceso de pago: ${error.response?.status} - ${error.response?.data?.message}`);
      console.log('   Detalles:', error.response?.data);
    }

    // 7. Probar crear una nueva orden y pagarla
    console.log('\n7️⃣ PROBANDO CREAR Y PAGAR ORDEN NUEVA:');
    console.log('=======================================');

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

      // Obtener espacio disponible
      const spaceResponse = await axios.get(`${API_BASE_URL}/catalog/spaces`, { headers });
      const availableSpace = spaceResponse.data.find(s => s.isActive && s.status === 'LIBRE');
      
      if (!availableSpace) {
        console.log('❌ No hay espacios disponibles para crear orden');
        return;
      }

      // Obtener producto disponible
      const productsResponse = await axios.get(`${API_BASE_URL}/catalog/products`, { headers });
      const availableProduct = productsResponse.data.find(p => p.isEnabled && p.isAvailable);
      
      if (!availableProduct) {
        console.log('❌ No hay productos disponibles para crear orden');
        return;
      }

      // Crear nueva orden
      const newOrderData = {
        spaceId: availableSpace.id,
        createdBy: '42d2ac16-2811-4e01-9e76-f8ab02d1aea2', // testuser ID
        customerName: 'Cliente Test Pago',
        items: [{
          productId: availableProduct.id,
          comboId: null,
          name: availableProduct.name,
          unitPrice: availableProduct.price,
          totalPrice: availableProduct.price,
          quantity: 1,
          notes: 'Test de pago'
        }],
        totalAmount: availableProduct.price,
        subtotal: availableProduct.price,
        tax: 0,
        discount: 0,
        deliveryCost: 0,
        isDelivery: false
      };

      console.log('📤 Creando nueva orden:', newOrderData.customerName);
      const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, newOrderData, { headers });
      console.log('✅ Orden creada:', createOrderResponse.data);

      const newOrderId = createOrderResponse.data.id;
      const newOrderNumber = createOrderResponse.data.orderNumber;

      // Pagar la nueva orden
      const paymentData = {
        orderId: newOrderId,
        paymentMethodId: paymentMethods.rows[0].id,
        amount: availableProduct.price,
        isDeliveryService: false,
        notes: 'Pago de prueba'
      };

      console.log('💳 Pagando nueva orden...');
      const paymentResponse = await axios.post(`${API_BASE_URL}/orders/${newOrderId}/payments`, paymentData, { headers });
      console.log('✅ Pago procesado:', paymentResponse.data);

      // Verificar estado final
      const finalOrderResponse = await axios.get(`${API_BASE_URL}/orders/${newOrderId}`, { headers });
      console.log('📊 Estado final de la orden:');
      console.log(`   - Número: ${finalOrderResponse.data.orderNumber}`);
      console.log(`   - Estado: ${finalOrderResponse.data.status}`);
      console.log(`   - Total: $${finalOrderResponse.data.totalAmount}`);

    } catch (error) {
      console.log(`❌ Error en prueba de orden nueva: ${error.response?.status} - ${error.response?.data?.message}`);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  } finally {
    await client.end();
  }
}

testPaymentProcess();
