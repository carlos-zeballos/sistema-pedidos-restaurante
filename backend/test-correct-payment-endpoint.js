const { Client } = require('pg');
const axios = require('axios');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testCorrectPaymentEndpoint() {
  console.log('🧪 Probando endpoint correcto de pagos...\n');

  try {
    await client.connect();
    console.log('✅ Conexión a base de datos exitosa');

    // 1. Obtener una orden pendiente
    console.log('1️⃣ SELECCIONANDO ORDEN PENDIENTE:');
    console.log('=================================');
    
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
      console.log('❌ No hay órdenes pendientes');
      return;
    }
    
    const order = pendingOrder.rows[0];
    console.log(`📋 Orden: ${order.orderNumber} - $${order.totalAmount} - ${order.space_name}`);

    // 2. Obtener métodos de pago
    const paymentMethods = await client.query(`
      SELECT id, name FROM "PaymentMethod" WHERE "isActive" = true LIMIT 1;
    `);
    
    const paymentMethod = paymentMethods.rows[0];
    console.log(`💳 Método de pago: ${paymentMethod.name}`);

    // 3. Probar endpoint correcto
    console.log('\n2️⃣ PROBANDO ENDPOINT CORRECTO:');
    console.log('==============================');

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

      // Probar endpoint /payments/register
      const paymentData = {
        orderId: order.id,
        paymentMethodId: paymentMethod.id,
        amount: order.totalAmount,
        isDeliveryService: order.space_type === 'DELIVERY',
        notes: 'Pago de prueba'
      };

      console.log('📤 Enviando pago a /payments/register...');
      const registerResponse = await axios.post(`${API_BASE_URL}/payments/register`, paymentData, { headers });
      console.log('✅ Pago registrado exitosamente:', registerResponse.data);

      // Verificar cambio de estado
      const updatedOrder = await client.query(`
        SELECT status, COUNT(op.id) as payment_count
        FROM "Order" o
        LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
        WHERE o.id = $1
        GROUP BY o.status;
      `, [order.id]);
      
      console.log(`📊 Estado actualizado: ${updatedOrder.rows[0].status} - Pagos: ${updatedOrder.rows[0].payment_count}`);

    } catch (error) {
      console.log(`❌ Error con /payments/register: ${error.response?.status} - ${error.response?.data?.message}`);
      
      // Probar endpoint /payments/complete
      try {
        console.log('\n📤 Probando /payments/complete...');
        const completeData = {
          orderId: order.id,
          paymentMethodId: paymentMethod.id,
          totalAmount: order.totalAmount,
          notes: 'Pago completo de prueba'
        };

        const completeResponse = await axios.post(`${API_BASE_URL}/payments/complete`, completeData, { headers });
        console.log('✅ Pago completo exitoso:', completeResponse.data);

        // Verificar cambio de estado
        const updatedOrder = await client.query(`
          SELECT status, COUNT(op.id) as payment_count
          FROM "Order" o
          LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
          WHERE o.id = $1
          GROUP BY o.status;
        `, [order.id]);
        
        console.log(`📊 Estado actualizado: ${updatedOrder.rows[0].status} - Pagos: ${updatedOrder.rows[0].payment_count}`);

      } catch (completeError) {
        console.log(`❌ Error con /payments/complete: ${completeError.response?.status} - ${completeError.response?.data?.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await client.end();
  }
}

testCorrectPaymentEndpoint();


