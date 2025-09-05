require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function debugTimerAndUpdates() {
  console.log('🔍 Diagnosticando problemas de cronómetro y actualizaciones...\n');

  try {
    // 1. Verificar órdenes existentes (usar endpoint sin autenticación)
    console.log('1️⃣ Verificando órdenes existentes...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    console.log(`   ✅ Órdenes encontradas: ${ordersResponse.data.length}`);
    
    if (ordersResponse.data.length === 0) {
      console.log('   ⚠️  No hay órdenes para probar. Creando una orden de prueba...');
      
      // Crear una orden de prueba
      const testOrder = {
        spaceid: 'test-space-id',
        createdby: 'test-user-id',
        customername: 'Cliente de Prueba',
        customerphone: '123456789',
        items: [
          {
            productId: 'test-product-id',
            name: 'Producto de Prueba',
            unitPrice: 10.00,
            totalPrice: 10.00,
            quantity: 1,
            notes: 'Orden de prueba para diagnosticar'
          }
        ],
        notes: 'Orden de prueba para diagnosticar cronómetro',
        totalamount: 10.00,
        subtotal: 10.00,
        tax: 0.00,
        discount: 0.00
      };

      const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, testOrder);
      console.log(`   ✅ Orden de prueba creada: ${createOrderResponse.data.orderNumber}`);
      console.log(`   📋 ID: ${createOrderResponse.data.id}`);
      console.log(`   🕐 Creada: ${createOrderResponse.data.createdAt}`);
      
      // Esperar un poco para que pase tiempo
      console.log('   ⏳ Esperando 5 segundos para que pase tiempo...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar la orden creada
      const orderId = createOrderResponse.data.id;
      const orderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      const order = orderResponse.data;
      
      console.log('   📊 Datos de la orden:');
      console.log(`      - ID: ${order.id}`);
      console.log(`      - Número: ${order.orderNumber}`);
      console.log(`      - Creada: ${order.createdAt}`);
      console.log(`      - Actualizada: ${order.updatedAt}`);
      console.log(`      - Items: ${order.items?.length || 0}`);
      
      // Calcular tiempo transcurrido
      const now = new Date();
      const createdAt = new Date(order.createdAt);
      const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
      console.log(`      - Tiempo transcurrido: ${elapsedSeconds} segundos`);
      console.log(`      - Formato: ${Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0')}:${Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`);
      
      // 2. Probar agregar items a la orden
      console.log('\n2️⃣ Probando agregar items a la orden...');
      const newItem = {
        items: [
          {
            productId: 'test-product-id-2',
            name: 'Item Agregado desde Mozos',
            unitPrice: 15.00,
            totalPrice: 15.00,
            quantity: 1,
            notes: 'Item agregado para probar actualizaciones'
          }
        ]
      };
      
      console.log('   📝 Agregando item:', newItem);
      const addItemResponse = await axios.post(`${API_BASE_URL}/orders/test/${orderId}/items`, newItem);
      console.log('   ✅ Item agregado exitosamente');
      
      // Esperar un poco
      console.log('   ⏳ Esperando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar la orden actualizada
      const updatedOrderResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      const updatedOrder = updatedOrderResponse.data;
      
      console.log('   📊 Datos de la orden actualizada:');
      console.log(`      - ID: ${updatedOrder.id}`);
      console.log(`      - Número: ${updatedOrder.orderNumber}`);
      console.log(`      - Creada: ${updatedOrder.createdAt}`);
      console.log(`      - Actualizada: ${updatedOrder.updatedAt}`);
      console.log(`      - Items: ${updatedOrder.items?.length || 0}`);
      
      // Verificar si se detecta como actualizada
      const timeDiff = new Date(updatedOrder.updatedAt).getTime() - new Date(updatedOrder.createdAt).getTime();
      const hasNewItems = timeDiff > 5000; // 5 segundos de diferencia
      console.log(`      - Diferencia de tiempo: ${timeDiff}ms`);
      console.log(`      - ¿Tiene items nuevos?: ${hasNewItems ? 'SÍ' : 'NO'}`);
      
      // 3. Verificar órdenes después de la actualización
      console.log('\n3️⃣ Verificando órdenes después de la actualización...');
      const kitchenOrdersResponse = await axios.get(`${API_BASE_URL}/orders`);
      console.log(`   ✅ Órdenes: ${kitchenOrdersResponse.data.length}`);
      
      kitchenOrdersResponse.data.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}:`);
        console.log(`      - Creada: ${order.createdAt}`);
        console.log(`      - Actualizada: ${order.updatedAt}`);
        console.log(`      - Items: ${order.items?.length || 0}`);
        
        // Calcular tiempo transcurrido
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
        const formattedTime = `${Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0')}:${Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;
        console.log(`      - Tiempo transcurrido: ${formattedTime}`);
        
        // Verificar detección de items nuevos
        const timeDiff = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime();
        const hasNewItems = timeDiff > 5000;
        console.log(`      - ¿Tiene items nuevos?: ${hasNewItems ? 'SÍ' : 'NO'}`);
      });
      
    } else {
      console.log('   📋 Órdenes existentes:');
      ordersResponse.data.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}:`);
        console.log(`      - Creada: ${order.createdAt}`);
        console.log(`      - Actualizada: ${order.updatedAt}`);
        console.log(`      - Items: ${order.items?.length || 0}`);
        
        // Calcular tiempo transcurrido
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const elapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
        const formattedTime = `${Math.floor(elapsedSeconds / 3600).toString().padStart(2, '0')}:${Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;
        console.log(`      - Tiempo transcurrido: ${formattedTime}`);
        
        // Verificar detección de items nuevos
        const timeDiff = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime();
        const hasNewItems = timeDiff > 5000;
        console.log(`      - ¿Tiene items nuevos?: ${hasNewItems ? 'SÍ' : 'NO'}`);
      });
    }

    console.log('\n🎯 Diagnóstico completado!');
    console.log('📋 Verifica en la consola del navegador los logs del frontend para ver:');
    console.log('   - Si el cronómetro se está calculando correctamente');
    console.log('   - Si las actualizaciones se están detectando');
    console.log('   - Si los timestamps están llegando correctamente');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar el diagnóstico
debugTimerAndUpdates();
