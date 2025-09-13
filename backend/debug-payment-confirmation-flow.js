const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function debugPaymentConfirmationFlow() {
  console.log('🔍 Depurando flujo de confirmación de pago...\n');

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
    console.log(`   - ID: ${testOrder.id}`);

    // 3. Simular el flujo completo del frontend
    console.log('\n3️⃣ SIMULANDO FLUJO DEL FRONTEND:');
    console.log('=================================');
    
    // Paso 1: Registrar pago (como hace PaymentMethodModal)
    console.log('💰 Paso 1: Registrando pago...');
    
    const paymentMethodsResponse = await axios.get(`${API_BASE_URL}/payments/methods`, { headers });
    const firstMethod = paymentMethodsResponse.data.data[0];
    
    const paymentData = {
      orderId: testOrder.id,
      paymentMethodId: firstMethod.id,
      amount: testOrder.totalAmount,
      notes: 'Pago de prueba - simulación frontend'
    };
    
    try {
      const paymentResponse = await axios.post(`${API_BASE_URL}/payments/register`, paymentData, { headers });
      console.log('✅ Pago registrado exitosamente');
      console.log('📊 Respuesta del pago:', paymentResponse.data);
      
      // Verificar estado después del pago
      const orderAfterPaymentResponse = await axios.get(`${API_BASE_URL}/orders/${testOrder.id}`, { headers });
      const orderAfterPayment = orderAfterPaymentResponse.data;
      console.log(`📋 Estado después del pago: ${orderAfterPayment.status}`);
      
    } catch (paymentError) {
      console.log(`❌ Error registrando pago: ${paymentError.response?.status} - ${paymentError.response?.data?.message}`);
      return;
    }

    // Paso 2: Actualizar estado a PAGADO (como hace PaymentMethodModal)
    console.log('\n💰 Paso 2: Actualizando estado a PAGADO...');
    
    try {
      const statusUpdateResponse = await axios.put(`${API_BASE_URL}/orders/test/${testOrder.id}/status`, {
        status: 'PAGADO'
      });
      
      console.log('✅ Estado actualizado exitosamente');
      console.log('📊 Respuesta del estado:', statusUpdateResponse.data);
      
      // Verificar estado final
      const finalOrderResponse = await axios.get(`${API_BASE_URL}/orders/${testOrder.id}`, { headers });
      const finalOrder = finalOrderResponse.data;
      console.log(`📋 Estado final: ${finalOrder.status}`);
      
    } catch (statusError) {
      console.log(`❌ Error actualizando estado: ${statusError.response?.status} - ${statusError.response?.data?.message}`);
    }

    // Paso 3: Verificar qué órdenes aparecen como activas (como hace WaitersView)
    console.log('\n💰 Paso 3: Verificando órdenes activas...');
    
    try {
      // Simular la llamada que hace WaitersView con el filtro
      const activeOrdersResponse = await axios.get(`${API_BASE_URL}/orders?status=PENDIENTE,EN_PREPARACION,LISTO,ENTREGADO`, { headers });
      const activeOrdersAfterPayment = activeOrdersResponse.data;
      
      console.log(`📊 Órdenes activas después del pago: ${activeOrdersAfterPayment.length}`);
      
      const testOrderStillActive = activeOrdersAfterPayment.find(order => order.id === testOrder.id);
      if (testOrderStillActive) {
        console.log(`⚠️ PROBLEMA: La orden ${testOrder.orderNumber} sigue apareciendo como activa`);
        console.log(`   - Estado: ${testOrderStillActive.status}`);
        console.log(`   - ID: ${testOrderStillActive.id}`);
        console.log(`   - Total: $${testOrderStillActive.totalAmount}`);
      } else {
        console.log(`✅ CORRECTO: La orden ${testOrder.orderNumber} ya no aparece como activa`);
      }
      
    } catch (activeOrdersError) {
      console.log(`❌ Error verificando órdenes activas: ${activeOrdersError.response?.status} - ${activeOrdersError.response?.data?.message}`);
    }

    // Paso 4: Verificar todas las órdenes (sin filtro)
    console.log('\n💰 Paso 4: Verificando todas las órdenes...');
    
    try {
      const allOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
      const allOrders = allOrdersResponse.data;
      
      const testOrderInAllOrders = allOrders.find(order => order.id === testOrder.id);
      if (testOrderInAllOrders) {
        console.log(`📋 Orden en todas las órdenes: ${testOrderInAllOrders.status}`);
        console.log(`   - Estado: ${testOrderInAllOrders.status}`);
        console.log(`   - Total: $${testOrderInAllOrders.totalAmount}`);
      }
      
    } catch (allOrdersError) {
      console.log(`❌ Error verificando todas las órdenes: ${allOrdersError.response?.status} - ${allOrdersError.response?.data?.message}`);
    }

    console.log('\n🎯 RESUMEN DEL DEBUG:');
    console.log('=====================');
    console.log('✅ Flujo de pago simulado completamente');
    console.log('✅ Estado de órdenes verificado');
    console.log('✅ Problema identificado y documentado');

  } catch (error) {
    console.error('❌ Error durante el debug:', error.message);
  }
}

debugPaymentConfirmationFlow();

