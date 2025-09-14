require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function createTestOrderForTimer() {
  console.log('🧪 Creando orden de prueba para probar cronómetro...\n');

  try {
    // 1. Crear una orden de prueba
    console.log('1️⃣ Creando orden de prueba...');
    const testOrder = {
      spaceid: '9c82ca4e-b15f-4f96-ad82-aa423dd0c28c', // Delivery 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Cliente Cronómetro Test',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Producto Test Cronómetro',
          unitPrice: 20.00,
          totalPrice: 20.00,
          quantity: 1,
          notes: 'Orden para probar cronómetro'
        }
      ],
      notes: 'Orden de prueba para cronómetro',
      totalamount: 20.00,
      subtotal: 20.00,
      tax: 0.00,
      discount: 0.00
    };

    const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, testOrder);
    console.log(`   ✅ Orden creada: ${createOrderResponse.data.orderNumber}`);
    console.log(`   📋 ID: ${createOrderResponse.data.id}`);
    console.log(`   🕐 Creada: ${createOrderResponse.data.createdAt}`);
    
    const orderId = createOrderResponse.data.id;
    
    // 2. Verificar la orden creada
    console.log('\n2️⃣ Verificando orden creada...');
    const orderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    const order = orderResponse.data;
    
    console.log(`   📋 Orden: ${order.orderNumber}`);
    console.log(`   🕐 Creada: ${order.createdAt}`);
    console.log(`   📊 Estado: ${order.status}`);
    console.log(`   🏠 Mesa: ${order.space?.name || 'N/A'}`);
    console.log(`   📦 Items: ${order.items?.length || 0}`);
    
    // 3. Simular cálculo del cronómetro
    console.log('\n3️⃣ Simulando cálculo del cronómetro...');
    const now = new Date();
    const startTime = order.createdAt;
    const startTimeDate = new Date(startTime);
    const elapsedMs = now.getTime() - startTimeDate.getTime();
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    console.log(`   ⏰ Tiempo actual: ${now.toISOString()}`);
    console.log(`   ⏰ Tiempo de inicio: ${startTime}`);
    console.log(`   ⏰ Tiempo de inicio (parsed): ${startTimeDate.toISOString()}`);
    console.log(`   ⏰ Diferencia (ms): ${elapsedMs}`);
    console.log(`   ⏰ Tiempo transcurrido: ${elapsedSeconds} segundos`);
    console.log(`   ⏰ Formato cronómetro: ${formattedTime}`);
    
    // 4. Verificar si hay problemas
    if (elapsedMs < 0) {
      console.log(`   ❌ PROBLEMA: Tiempo negativo (zona horaria)`);
    } else if (elapsedMs === 0) {
      console.log(`   ⚠️  ADVERTENCIA: Tiempo 0 (puede ser problema de precisión)`);
    } else {
      console.log(`   ✅ Cronómetro debería funcionar correctamente`);
    }
    
    // 5. Esperar un poco y verificar que el tiempo cambia
    console.log('\n4️⃣ Esperando 3 segundos para verificar que el tiempo cambia...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const now2 = new Date();
    const elapsedMs2 = now2.getTime() - startTimeDate.getTime();
    const elapsedSeconds2 = Math.max(0, Math.floor(elapsedMs2 / 1000));
    
    const hours2 = Math.floor(elapsedSeconds2 / 3600);
    const minutes2 = Math.floor((elapsedSeconds2 % 3600) / 60);
    const seconds2 = elapsedSeconds2 % 60;
    const formattedTime2 = `${hours2.toString().padStart(2, '0')}:${minutes2.toString().padStart(2, '0')}:${seconds2.toString().padStart(2, '0')}`;
    
    console.log(`   ⏰ Tiempo después de 3 segundos: ${formattedTime2}`);
    console.log(`   ⏰ Diferencia: ${elapsedSeconds2 - elapsedSeconds} segundos`);
    
    if (elapsedSeconds2 > elapsedSeconds) {
      console.log(`   ✅ El tiempo está avanzando correctamente`);
    } else {
      console.log(`   ❌ PROBLEMA: El tiempo no está avanzando`);
    }
    
    console.log('\n🎯 Orden de prueba creada exitosamente!');
    console.log('💡 Ahora puedes verificar el cronómetro en el frontend');
    console.log(`📋 Orden: ${order.orderNumber} - Mesa: ${order.space?.name || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error creando orden de prueba:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

createTestOrderForTimer();











