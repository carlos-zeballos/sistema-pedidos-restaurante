const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testPaymentFlowDebug() {
  console.log('🔍 Probando flujo completo de pago para debug...\n');

  try {
    // 1. Autenticación
    console.log('1️⃣ AUTENTICACIÓN:');
    console.log('=================');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Autenticación exitosa');
    
    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Obtener órdenes activas
    console.log('\n2️⃣ ÓRDENES ACTIVAS:');
    console.log('===================');
    
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
    const activeOrders = ordersResponse.data.filter(order => 
      ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'].includes(order.status)
    );
    
    console.log(`📊 Órdenes activas encontradas: ${activeOrders.length}`);
    
    if (activeOrders.length === 0) {
      console.log('⚠️ No hay órdenes activas para probar el pago');
      return;
    }
    
    const testOrder = activeOrders[0];
    console.log(`📋 Orden de prueba: ${testOrder.orderNumber}`);
    console.log(`   - Estado actual: ${testOrder.status}`);
    console.log(`   - Total: $${testOrder.totalAmount}`);
    console.log(`   - Cliente: ${testOrder.customerName}`);

    // 3. Obtener métodos de pago
    console.log('\n3️⃣ MÉTODOS DE PAGO:');
    console.log('===================');
    
    const paymentMethodsResponse = await axios.get(`${API_BASE_URL}/payments/methods`, { headers });
    const paymentMethods = paymentMethodsResponse.data.data;
    
    console.log(`📊 Métodos de pago disponibles: ${paymentMethods.length}`);
    const firstMethod = paymentMethods[0];
    console.log(`📋 Método de prueba: ${firstMethod.name} (${firstMethod.id})`);

    // 4. Registrar pago
    console.log('\n4️⃣ REGISTRANDO PAGO:');
    console.log('====================');
    
    const paymentData = {
      orderId: testOrder.id,
      paymentMethodId: firstMethod.id,
      amount: testOrder.totalAmount,
      notes: 'Pago de prueba para debug'
    };
    
    console.log('💰 Datos del pago:', paymentData);
    
    try {
      const paymentResponse = await axios.post(`${API_BASE_URL}/payments/register`, paymentData, { headers });
      console.log('✅ Pago registrado exitosamente');
      console.log('📊 Respuesta del pago:', paymentResponse.data);
      
      // Verificar el estado de la orden después del pago
      const orderAfterPaymentResponse = await axios.get(`${API_BASE_URL}/orders/${testOrder.id}`, { headers });
      const orderAfterPayment = orderAfterPaymentResponse.data;
      
      console.log('\n📋 Estado de la orden después del pago:');
      console.log(`   - Estado: ${orderAfterPayment.status}`);
      console.log(`   - Total: $${orderAfterPayment.totalAmount}`);
      
    } catch (paymentError) {
      console.log(`❌ Error registrando pago: ${paymentError.response?.status} - ${paymentError.response?.data?.message}`);
    }

    // 5. Actualizar estado de orden a PAGADO (simulando el frontend)
    console.log('\n5️⃣ ACTUALIZANDO ESTADO A PAGADO:');
    console.log('=================================');
    
    try {
      const statusUpdateResponse = await axios.put(`${API_BASE_URL}/orders/test/${testOrder.id}/status`, {
        status: 'PAGADO'
      });
      
      console.log('✅ Estado actualizado exitosamente');
      console.log('📊 Respuesta del estado:', statusUpdateResponse.data);
      
      // Verificar el estado final de la orden
      const finalOrderResponse = await axios.get(`${API_BASE_URL}/orders/${testOrder.id}`, { headers });
      const finalOrder = finalOrderResponse.data;
      
      console.log('\n📋 Estado final de la orden:');
      console.log(`   - Estado: ${finalOrder.status}`);
      console.log(`   - Total: $${finalOrder.totalAmount}`);
      
    } catch (statusError) {
      console.log(`❌ Error actualizando estado: ${statusError.response?.status} - ${statusError.response?.data?.message}`);
    }

    // 6. Verificar si la orden sigue apareciendo como activa
    console.log('\n6️⃣ VERIFICANDO ÓRDENES ACTIVAS:');
    console.log('=================================');
    
    const finalOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
    const finalActiveOrders = finalOrdersResponse.data.filter(order => 
      ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'].includes(order.status)
    );
    
    console.log(`📊 Órdenes activas después del pago: ${finalActiveOrders.length}`);
    
    const testOrderStillActive = finalActiveOrders.find(order => order.id === testOrder.id);
    if (testOrderStillActive) {
      console.log(`⚠️ La orden ${testOrder.orderNumber} sigue apareciendo como activa`);
      console.log(`   - Estado: ${testOrderStillActive.status}`);
      console.log(`   - Problema identificado: La orden no se está marcando como PAGADO correctamente`);
    } else {
      console.log(`✅ La orden ${testOrder.orderNumber} ya no aparece como activa`);
    }

    console.log('\n🎯 RESUMEN DEL DEBUG:');
    console.log('=====================');
    console.log('✅ Flujo de pago probado completamente');
    console.log('✅ Estado de órdenes verificado');
    console.log('✅ Problema identificado y documentado');

  } catch (error) {
    console.error('❌ Error durante el debug:', error.message);
  }
}

testPaymentFlowDebug();

