require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testTimerBehavior() {
  console.log('🧪 Probando comportamiento del cronómetro al actualizar pedidos...\n');

  try {
    // 1. Crear una orden de prueba
    console.log('1️⃣ Creando orden de prueba...');
    const testOrder = {
      spaceid: '9c82ca4e-b15f-4f96-ad82-aa423dd0c28c', // Delivery 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Cliente Timer Test',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Producto Inicial',
          unitPrice: 15.00,
          totalPrice: 15.00,
          quantity: 1,
          notes: 'Item inicial'
        }
      ],
      notes: 'Orden para probar comportamiento del cronómetro',
      totalamount: 15.00,
      subtotal: 15.00,
      tax: 0.00,
      discount: 0.00
    };

    const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, testOrder);
    console.log(`   ✅ Orden creada: ${createOrderResponse.data.orderNumber}`);
    console.log(`   📋 ID: ${createOrderResponse.data.id}`);
    console.log(`   🕐 Creada: ${createOrderResponse.data.createdAt}`);
    
    const orderId = createOrderResponse.data.id;
    const initialCreatedAt = createOrderResponse.data.createdAt;
    
    // 2. Esperar 5 segundos
    console.log('\n2️⃣ Esperando 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Verificar el estado inicial de la orden
    console.log('\n3️⃣ Verificando estado inicial de la orden...');
    const initialOrderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    const initialOrder = initialOrderResponse.data;
    
    console.log(`   📋 Orden: ${initialOrder.orderNumber}`);
    console.log(`   🕐 Creada: ${initialOrder.createdAt}`);
    console.log(`   🔄 Actualizada: ${initialOrder.updatedAt}`);
    console.log(`   📦 Items: ${initialOrder.items?.length || 0}`);
    
    // Calcular tiempo transcurrido inicial
    const now1 = new Date();
    const startTime1 = new Date(initialOrder.createdAt);
    const elapsed1 = Math.floor((now1.getTime() - startTime1.getTime()) / 1000);
    console.log(`   ⏰ Tiempo transcurrido inicial: ${elapsed1} segundos`);
    
    // 4. Agregar un item a la orden (actualizar)
    console.log('\n4️⃣ Agregando item a la orden (actualizando)...');
    const newItem = {
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Item Agregado',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Item agregado después'
        }
      ]
    };
    
    const addItemResponse = await axios.post(`${API_BASE_URL}/orders/test/${orderId}/items`, newItem);
    console.log('   ✅ Item agregado exitosamente');
    
    // 5. Verificar el estado después de la actualización
    console.log('\n5️⃣ Verificando estado después de la actualización...');
    const updatedOrderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    const updatedOrder = updatedOrderResponse.data;
    
    console.log(`   📋 Orden: ${updatedOrder.orderNumber}`);
    console.log(`   🕐 Creada: ${updatedOrder.createdAt}`);
    console.log(`   🔄 Actualizada: ${updatedOrder.updatedAt}`);
    console.log(`   📦 Items: ${updatedOrder.items?.length || 0}`);
    
    // Calcular tiempo transcurrido después de la actualización
    const now2 = new Date();
    const startTime2 = new Date(updatedOrder.createdAt);
    const elapsed2 = Math.floor((now2.getTime() - startTime2.getTime()) / 1000);
    console.log(`   ⏰ Tiempo transcurrido después: ${elapsed2} segundos`);
    
    // 6. Análisis del comportamiento
    console.log('\n6️⃣ Análisis del comportamiento del cronómetro:');
    console.log(`   📊 createdAt inicial: ${initialOrder.createdAt}`);
    console.log(`   📊 createdAt después: ${updatedOrder.createdAt}`);
    console.log(`   📊 ¿Se cambió createdAt?: ${initialOrder.createdAt !== updatedOrder.createdAt ? 'SÍ' : 'NO'}`);
    console.log(`   📊 updatedAt inicial: ${initialOrder.updatedAt}`);
    console.log(`   📊 updatedAt después: ${updatedOrder.updatedAt}`);
    console.log(`   📊 ¿Se cambió updatedAt?: ${initialOrder.updatedAt !== updatedOrder.updatedAt ? 'SÍ' : 'NO'}`);
    
    // 7. Simular cálculo del cronómetro del frontend
    console.log('\n7️⃣ Simulando cálculo del cronómetro del frontend:');
    
    // Cronómetro usa createdAt, no updatedAt
    const frontendStartTime = updatedOrder.createdAt;
    const frontendCurrentTime = new Date();
    const frontendElapsed = Math.floor((frontendCurrentTime.getTime() - new Date(frontendStartTime).getTime()) / 1000);
    
    const hours = Math.floor(frontendElapsed / 3600);
    const minutes = Math.floor((frontendElapsed % 3600) / 60);
    const seconds = frontendElapsed % 60;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    console.log(`   ⏰ Tiempo de inicio (createdAt): ${frontendStartTime}`);
    console.log(`   ⏰ Tiempo actual: ${frontendCurrentTime.toISOString()}`);
    console.log(`   ⏰ Tiempo transcurrido: ${frontendElapsed} segundos`);
    console.log(`   ⏰ Formato cronómetro: ${formattedTime}`);
    
    // 8. Conclusión
    console.log('\n8️⃣ Conclusión:');
    if (initialOrder.createdAt === updatedOrder.createdAt) {
      console.log('   ✅ El cronómetro NO se reinicia al actualizar el pedido');
      console.log('   📊 El cronómetro sigue contando desde la creación original');
      console.log('   💡 Esto es el comportamiento correcto para un cronómetro de orden');
    } else {
      console.log('   ❌ El cronómetro SÍ se reinicia al actualizar el pedido');
      console.log('   📊 El cronómetro se resetea cada vez que se actualiza');
      console.log('   ⚠️  Esto puede no ser el comportamiento deseado');
    }
    
    console.log('\n🎯 Test completado!');
    console.log('💡 El cronómetro usa createdAt (tiempo de creación) como referencia');
    console.log('💡 No se reinicia al agregar items o actualizar la orden');

  } catch (error) {
    console.error('❌ Error durante el test:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

testTimerBehavior();





