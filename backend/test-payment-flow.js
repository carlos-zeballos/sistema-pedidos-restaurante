require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testPaymentFlow() {
  console.log('🧪 Probando flujo completo de pago y liberación de espacios...\n');

  try {
    // 1. Obtener órdenes activas
    console.log('1️⃣ Obteniendo órdenes activas...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    // Filtrar órdenes que no estén pagadas
    const activeOrders = orders.filter(order => 
      order.status !== 'PAGADO' && order.status !== 'CANCELADO'
    );
    
    console.log(`   ✅ Órdenes activas encontradas: ${activeOrders.length}`);
    
    if (activeOrders.length === 0) {
      console.log('   ⚠️  No hay órdenes activas para probar');
      return;
    }
    
    // Mostrar órdenes activas
    activeOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber}:`);
      console.log(`      - Estado: ${order.status}`);
      console.log(`      - Mesa: ${order.space?.name || 'N/A'}`);
      console.log(`      - Total: $${order.totalAmount}`);
    });
    
    // 2. Verificar estado de espacios antes del pago
    console.log('\n2️⃣ Verificando estado de espacios antes del pago...');
    const spacesResponse = await axios.get(`${API_BASE_URL}/catalog/spaces`);
    const spaces = spacesResponse.data;
    
    console.log('   📋 Estado de espacios:');
    spaces.forEach((space, index) => {
      console.log(`   ${index + 1}. ${space.name}: ${space.status}`);
    });
    
    // 3. Seleccionar una orden para pagar
    const orderToPay = activeOrders[0];
    console.log(`\n3️⃣ Pagando orden: ${orderToPay.orderNumber}`);
    console.log(`   - Mesa: ${orderToPay.space?.name || 'N/A'}`);
    console.log(`   - Estado actual: ${orderToPay.status}`);
    
    // 4. Intentar pagar la orden (sin autenticación primero)
    console.log('\n4️⃣ Intentando pagar la orden (sin autenticación)...');
    try {
      const paymentResponse = await axios.put(`${API_BASE_URL}/orders/${orderToPay.id}/status`, {
        status: 'PAGADO'
      });
      console.log('   ✅ Pago exitoso (sin autenticación):', paymentResponse.data);
    } catch (error) {
      console.log('   ❌ Error al pagar (sin autenticación):', error.response?.status, error.response?.data?.message);
      
      if (error.response?.status === 401) {
        console.log('   🔐 Error de autenticación - el endpoint requiere login');
        
        // Intentar con endpoint de prueba si existe
        console.log('\n5️⃣ Intentando con endpoint de prueba...');
        try {
          const testPaymentResponse = await axios.put(`${API_BASE_URL}/orders/test/${orderToPay.id}/status`, {
            status: 'PAGADO'
          });
          console.log('   ✅ Pago exitoso (endpoint de prueba):', testPaymentResponse.data);
        } catch (testError) {
          console.log('   ❌ Error con endpoint de prueba:', testError.response?.status, testError.response?.data?.message);
        }
      }
    }
    
    // 5. Verificar estado de espacios después del pago
    console.log('\n6️⃣ Verificando estado de espacios después del pago...');
    const spacesAfterResponse = await axios.get(`${API_BASE_URL}/catalog/spaces`);
    const spacesAfter = spacesAfterResponse.data;
    
    console.log('   📋 Estado de espacios después del pago:');
    spacesAfter.forEach((space, index) => {
      console.log(`   ${index + 1}. ${space.name}: ${space.status}`);
    });
    
    // 6. Verificar estado de la orden después del pago
    console.log('\n7️⃣ Verificando estado de la orden después del pago...');
    const orderAfterResponse = await axios.get(`${API_BASE_URL}/orders/${orderToPay.id}`);
    const orderAfter = orderAfterResponse.data;
    
    console.log(`   📋 Orden ${orderAfter.orderNumber}:`);
    console.log(`      - Estado: ${orderAfter.status}`);
    console.log(`      - Mesa: ${orderAfter.space?.name || 'N/A'}`);
    
    // 7. Comparar estados
    console.log('\n8️⃣ Comparando estados:');
    const spaceBefore = spaces.find(s => s.id === orderToPay.spaceId);
    const spaceAfter = spacesAfter.find(s => s.id === orderToPay.spaceId);
    
    if (spaceBefore && spaceAfter) {
      console.log(`   📊 Mesa ${spaceBefore.name}:`);
      console.log(`      - Antes: ${spaceBefore.status}`);
      console.log(`      - Después: ${spaceAfter.status}`);
      console.log(`      - ¿Se liberó?: ${spaceBefore.status === 'OCUPADA' && spaceAfter.status === 'LIBRE' ? '✅ SÍ' : '❌ NO'}`);
    }
    
    console.log('\n🎯 Prueba de flujo de pago completada!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testPaymentFlow();




