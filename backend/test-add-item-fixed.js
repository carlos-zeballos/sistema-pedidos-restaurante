require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testAddItemFixed() {
  console.log('🧪 Probando agregar item con datos correctos...\n');

  try {
    // 1. Obtener la orden más reciente
    console.log('1️⃣ Obteniendo la orden más reciente...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    if (orders.length === 0) {
      console.log('❌ No hay órdenes para probar');
      return;
    }
    
    const latestOrder = orders[0];
    console.log(`   ✅ Orden encontrada: ${latestOrder.orderNumber}`);
    console.log(`   📋 ID: ${latestOrder.id}`);
    console.log(`   💰 Total actual: $${latestOrder.totalAmount}`);
    console.log(`   📦 Items actuales: ${latestOrder.items?.length || 0}`);
    
    // 2. Agregar un item con datos correctos
    console.log('\n2️⃣ Agregando item con datos correctos...');
    const newItem = {
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116', // UUID real de la base de datos
          comboId: null,
          name: 'Item de Prueba Corregido',
          unitPrice: 25.50,
          totalPrice: 25.50,
          quantity: 1,
          notes: 'Item agregado para probar precios correctos'
        }
      ]
    };
    
    console.log('   📝 Datos del item:', JSON.stringify(newItem, null, 2));
    
    const addItemResponse = await axios.post(`${API_BASE_URL}/orders/test/${latestOrder.id}/items`, newItem);
    console.log('   ✅ Item agregado exitosamente');
    console.log('   📊 Respuesta:', addItemResponse.data);
    
    // 3. Verificar la orden actualizada
    console.log('\n3️⃣ Verificando la orden actualizada...');
    const updatedOrderResponse = await axios.get(`${API_BASE_URL}/orders/${latestOrder.id}`);
    const updatedOrder = updatedOrderResponse.data;
    
    console.log(`   📋 Orden: ${updatedOrder.orderNumber}`);
    console.log(`   💰 Total actualizado: $${updatedOrder.totalAmount}`);
    console.log(`   📦 Items actuales: ${updatedOrder.items?.length || 0}`);
    
    if (updatedOrder.items && updatedOrder.items.length > 0) {
      console.log('   📋 Items de la orden:');
      updatedOrder.items.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name}`);
        console.log(`         - Precio unitario: $${item.unitPrice}`);
        console.log(`         - Precio total: $${item.totalPrice}`);
        console.log(`         - Cantidad: ${item.quantity}`);
        console.log(`         - Creado: ${item.createdAt}`);
        console.log(`         - Estado: ${item.status}`);
      });
    }
    
    // 4. Verificar órdenes de cocina
    console.log('\n4️⃣ Verificando órdenes de cocina...');
    const kitchenOrdersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const kitchenOrders = kitchenOrdersResponse.data.filter(order => 
      order.status === 'PENDIENTE' || order.status === 'EN_PREPARACION'
    );
    
    console.log(`   ✅ Órdenes de cocina: ${kitchenOrders.length}`);
    kitchenOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber}:`);
      console.log(`      - Estado: ${order.status}`);
      console.log(`      - Total: $${order.totalAmount}`);
      console.log(`      - Items: ${order.items?.length || 0}`);
      
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, itemIndex) => {
          console.log(`         ${itemIndex + 1}. ${item.name} - $${item.totalPrice}`);
        });
      }
    });
    
    console.log('\n🎯 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testAddItemFixed();
