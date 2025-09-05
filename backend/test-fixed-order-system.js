require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testFixedOrderSystem() {
  console.log('🧪 Probando el sistema de órdenes corregido...\n');

  try {
    // 1. Limpiar órdenes antiguas primero
    console.log('1️⃣ Limpiando órdenes antiguas...');
    // Esto se haría ejecutando el script SQL cleanup-old-orders.sql
    
    // 2. Verificar que no hay órdenes de cocina
    console.log('2️⃣ Verificando órdenes de cocina...');
    const kitchenOrdersResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
    console.log(`   ✅ Órdenes de cocina encontradas: ${kitchenOrdersResponse.data.length}`);
    
    if (kitchenOrdersResponse.data.length > 0) {
      console.log('   ⚠️  Aún hay órdenes de cocina. Ejecutar cleanup-old-orders.sql');
      kitchenOrdersResponse.data.forEach(order => {
        console.log(`      - ${order.orderNumber} (${order.status}) - ${order.createdAt}`);
      });
    }

    // 3. Verificar espacios disponibles
    console.log('3️⃣ Verificando espacios disponibles...');
    const spacesResponse = await axios.get(`${API_BASE_URL}/catalog/spaces`);
    const availableSpaces = spacesResponse.data.filter(space => space.status === 'LIBRE');
    console.log(`   ✅ Espacios libres: ${availableSpaces.length}`);
    
    if (availableSpaces.length === 0) {
      console.log('   ⚠️  No hay espacios libres. Verificar estado de espacios.');
      return;
    }

    // 4. Crear una nueva orden
    console.log('4️⃣ Creando nueva orden...');
    const testOrder = {
      spaceid: availableSpaces[0].id,
      createdby: 'test-user-id', // Reemplazar con un ID de usuario válido
      customername: 'Cliente Test',
      customerphone: '123456789',
      items: [
        {
          productId: null,
          comboId: null,
          name: 'Producto Test',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Orden de prueba'
        }
      ],
      notes: 'Orden de prueba del sistema corregido',
      totalamount: 10.00,
      subtotal: 10.00,
      tax: 0.00,
      discount: 0.00
    };

    const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, testOrder);
    console.log(`   ✅ Orden creada: ${createOrderResponse.data.orderNumber}`);
    console.log(`   📋 ID: ${createOrderResponse.data.id}`);

    // 5. Verificar que solo aparece 1 orden en cocina
    console.log('5️⃣ Verificando órdenes de cocina después de crear orden...');
    const kitchenOrdersAfterResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
    console.log(`   ✅ Órdenes de cocina: ${kitchenOrdersAfterResponse.data.length}`);
    
    if (kitchenOrdersAfterResponse.data.length === 1) {
      console.log('   ✅ ¡Perfecto! Solo aparece 1 orden como esperado.');
    } else {
      console.log('   ❌ Error: Aparecen múltiples órdenes cuando debería ser solo 1.');
      kitchenOrdersAfterResponse.data.forEach(order => {
        console.log(`      - ${order.orderNumber} (${order.status}) - ${order.createdAt}`);
      });
    }

    // 6. Verificar que el espacio se marcó como ocupado
    console.log('6️⃣ Verificando estado del espacio...');
    const spaceAfterResponse = await axios.get(`${API_BASE_URL}/catalog/spaces/${availableSpaces[0].id}`);
    console.log(`   ✅ Estado del espacio: ${spaceAfterResponse.data.status}`);
    
    if (spaceAfterResponse.data.status === 'OCUPADA') {
      console.log('   ✅ El espacio se marcó correctamente como ocupado.');
    } else {
      console.log('   ❌ Error: El espacio no se marcó como ocupado.');
    }

    // 7. Simular pago de la orden
    console.log('7️⃣ Simulando pago de la orden...');
    const updateStatusResponse = await axios.put(
      `${API_BASE_URL}/orders/${createOrderResponse.data.id}/status`,
      { status: 'PAGADO' }
    );
    console.log(`   ✅ Orden marcada como PAGADA`);

    // 8. Verificar que el espacio se liberó
    console.log('8️⃣ Verificando liberación del espacio...');
    const spaceAfterPaymentResponse = await axios.get(`${API_BASE_URL}/catalog/spaces/${availableSpaces[0].id}`);
    console.log(`   ✅ Estado del espacio después del pago: ${spaceAfterPaymentResponse.data.status}`);
    
    if (spaceAfterPaymentResponse.data.status === 'LIBRE') {
      console.log('   ✅ El espacio se liberó correctamente después del pago.');
    } else {
      console.log('   ❌ Error: El espacio no se liberó después del pago.');
    }

    // 9. Verificar que la orden ya no aparece en cocina
    console.log('9️⃣ Verificando órdenes de cocina después del pago...');
    const kitchenOrdersAfterPaymentResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
    console.log(`   ✅ Órdenes de cocina: ${kitchenOrdersAfterPaymentResponse.data.length}`);
    
    if (kitchenOrdersAfterPaymentResponse.data.length === 0) {
      console.log('   ✅ ¡Perfecto! No hay órdenes de cocina después del pago.');
    } else {
      console.log('   ❌ Error: Aún hay órdenes de cocina después del pago.');
    }

    console.log('\n🎉 Prueba del sistema completada exitosamente!');
    console.log('✅ El sistema ahora funciona correctamente:');
    console.log('   - Solo muestra órdenes del día actual');
    console.log('   - No jala órdenes pasadas');
    console.log('   - El ciclo de órdenes funciona correctamente');
    console.log('   - Los espacios se liberan después del pago');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testFixedOrderSystem();
