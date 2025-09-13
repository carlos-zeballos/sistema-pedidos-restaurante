const axios = require('axios');

const API_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function debugPaymentConfirmationBug() {
  console.log('🔍 DEBUGGING PAYMENT CONFIRMATION BUG');
  console.log('=====================================\n');

  try {
    // Paso 1: Autenticarse
    console.log('🔐 Paso 1: Autenticándose...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginResponse.data.access_token;
    console.log('✅ Autenticado exitosamente\n');

    // Paso 2: Obtener una orden activa
    console.log('📋 Paso 2: Obteniendo órdenes activas...');
    const ordersResponse = await axios.get(`${API_URL}/orders`, {
      params: { status: 'PENDIENTE,EN_PREPARACION,LISTO,ENTREGADO' },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (ordersResponse.data.length === 0) {
      console.log('❌ No hay órdenes activas para probar');
      return;
    }

    const orderToTest = ordersResponse.data[0];
    console.log('✅ Orden encontrada:', {
      id: orderToTest.id,
      orderNumber: orderToTest.orderNumber,
      status: orderToTest.status,
      totalAmount: orderToTest.totalAmount
    });

    // Paso 3: Obtener métodos de pago
    console.log('\n💳 Paso 3: Obteniendo métodos de pago...');
    const paymentMethodsResponse = await axios.get(`${API_URL}/payments/methods`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 Respuesta métodos de pago:', paymentMethodsResponse.data);
    
    const paymentMethods = paymentMethodsResponse.data.data || paymentMethodsResponse.data;
    if (!paymentMethods || paymentMethods.length === 0) {
      console.log('❌ No hay métodos de pago disponibles');
      return;
    }
    
    const paymentMethodId = paymentMethods[0].id;
    console.log('✅ Método de pago seleccionado:', paymentMethods[0].name);

    // Paso 4: Verificar estado ANTES del pago
    console.log('\n📊 Paso 4: Estado ANTES del pago...');
    const orderBeforeResponse = await axios.get(`${API_URL}/orders/${orderToTest.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Estado de la orden:', orderBeforeResponse.data.status);
    console.log('Pagos existentes:', orderBeforeResponse.data.payments?.length || 0);

    // Paso 5: Simular el flujo del frontend - Registrar pago
    console.log('\n💰 Paso 5: Registrando pago (como lo hace el frontend)...');
    const paymentResponse = await axios.post(`${API_URL}/payments/register`, {
      orderId: orderToTest.id,
      paymentMethodId: paymentMethodId,
      amount: orderToTest.totalAmount,
      notes: 'Pago de prueba - debug bug'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('✅ Pago registrado exitosamente');
    console.log('📊 Respuesta del pago:', paymentResponse.data);

    // Paso 6: Verificar estado DESPUÉS del pago (antes de updateOrderStatus)
    console.log('\n📊 Paso 6: Estado DESPUÉS del pago (antes de updateOrderStatus)...');
    const orderAfterPaymentResponse = await axios.get(`${API_URL}/orders/${orderToTest.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Estado de la orden:', orderAfterPaymentResponse.data.status);
    console.log('Pagos existentes:', orderAfterPaymentResponse.data.payments?.length || 0);

    // Paso 7: Simular el flujo del frontend - Actualizar estado a PAGADO
    console.log('\n🔄 Paso 7: Actualizando estado a PAGADO (como lo hace el frontend)...');
    const statusUpdateResponse = await axios.put(`${API_URL}/orders/test/${orderToTest.id}/status`, {
      status: 'PAGADO'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('✅ Estado actualizado exitosamente');
    console.log('📊 Respuesta del estado:', statusUpdateResponse.data);

    // Paso 8: Verificar estado FINAL
    console.log('\n📊 Paso 8: Estado FINAL después de updateOrderStatus...');
    const orderFinalResponse = await axios.get(`${API_URL}/orders/${orderToTest.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Estado final de la orden:', orderFinalResponse.data.status);
    console.log('Pagos finales:', orderFinalResponse.data.payments?.length || 0);
    
    if (orderFinalResponse.data.payments) {
      orderFinalResponse.data.payments.forEach((payment, index) => {
        console.log(`  Pago ${index + 1}:`, {
          id: payment.id,
          amount: payment.amount,
          method: payment.PaymentMethod?.name,
          notes: payment.notes
        });
      });
    }

    // Paso 9: Verificar si la orden sigue apareciendo como activa
    console.log('\n📋 Paso 9: Verificando si la orden sigue apareciendo como activa...');
    const activeOrdersResponse = await axios.get(`${API_URL}/orders`, {
      params: { status: 'PENDIENTE,EN_PREPARACION,LISTO,ENTREGADO' },
      headers: { Authorization: `Bearer ${token}` }
    });
    const activeOrdersAfterPayment = activeOrdersResponse.data.filter(o => o.id === orderToTest.id);
    console.log('📊 Órdenes activas después del pago:', activeOrdersAfterPayment.length);
    
    if (activeOrdersAfterPayment.length === 0) {
      console.log('✅ CORRECTO: La orden', orderToTest.orderNumber, 'ya no aparece como activa');
    } else {
      console.error('❌ ERROR: La orden', orderToTest.orderNumber, 'sigue apareciendo como activa');
      console.log('Estado de la orden en lista activa:', activeOrdersAfterPayment[0].status);
    }

    // Paso 10: Verificar todos los estados posibles
    console.log('\n📋 Paso 10: Verificando todos los estados posibles...');
    const allOrdersResponse = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const allOrdersAfterPayment = allOrdersResponse.data.filter(o => o.id === orderToTest.id);
    console.log('📊 Órdenes en total después del pago:', allOrdersAfterPayment.length);
    
    if (allOrdersAfterPayment.length > 0) {
      console.log('Estado de la orden en lista total:', allOrdersAfterPayment[0].status);
    }

    console.log('\n🎯 RESUMEN DEL DEBUG:');
    console.log('====================');
    console.log('1. Pago registrado:', paymentResponse.data ? '✅' : '❌');
    console.log('2. Estado actualizado a PAGADO:', statusUpdateResponse.data ? '✅' : '❌');
    console.log('3. Orden desaparece de activas:', activeOrdersAfterPayment.length === 0 ? '✅' : '❌');
    console.log('4. Estado final:', orderFinalResponse.data.status);
    console.log('5. Número de pagos:', orderFinalResponse.data.payments?.length || 0);

  } catch (error) {
    console.error('❌ Error en debug:', error.response?.data || error.message);
  }
}

debugPaymentConfirmationBug();
