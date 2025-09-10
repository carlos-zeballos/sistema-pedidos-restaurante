const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAddItems() {
  try {
    console.log('🧪 Probando endpoint de agregar items...');
    
    // 1. Primero obtener una orden existente
    console.log('\n📋 1. Obteniendo órdenes existentes...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    if (!orders || orders.length === 0) {
      console.log('❌ No hay órdenes para probar');
      return;
    }
    
    // Buscar una orden activa (no pagada)
    const activeOrder = orders.find(order => 
      order.status !== 'PAGADO' && order.status !== 'CANCELADO'
    );
    
    if (!activeOrder) {
      console.log('❌ No hay órdenes activas para probar');
      return;
    }
    
    console.log('✅ Orden encontrada:', {
      id: activeOrder.id,
      orderNumber: activeOrder.orderNumber,
      status: activeOrder.status,
      totalAmount: activeOrder.totalAmount
    });
    
    // 2. Probar agregar un item simple
    console.log('\n📦 2. Probando agregar item simple...');
    const testItem = {
      items: [{
        productId: null,
        comboId: null,
        name: 'TEST ITEM',
        unitPrice: 5.00,
        totalPrice: 5.00,
        quantity: 1,
        notes: 'Item de prueba'
      }]
    };
    
    console.log('📤 Enviando request:', {
      url: `${API_BASE_URL}/orders/${activeOrder.id}/items`,
      method: 'POST',
      data: testItem
    });
    
    const addItemResponse = await axios.post(
      `${API_BASE_URL}/orders/${activeOrder.id}/items`,
      testItem
    );
    
    console.log('✅ Item agregado exitosamente:', addItemResponse.data);
    
    // 3. Verificar que la orden se actualizó
    console.log('\n🔍 3. Verificando actualización de la orden...');
    const updatedOrderResponse = await axios.get(`${API_BASE_URL}/orders/${activeOrder.id}`);
    const updatedOrder = updatedOrderResponse.data;
    
    console.log('📊 Orden actualizada:', {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
      previousTotal: activeOrder.totalAmount
    });
    
    // 4. Verificar que aparece en cocina
    console.log('\n👨‍🍳 4. Verificando vista de cocina...');
    const kitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
    const kitchenOrders = kitchenResponse.data;
    
    const orderInKitchen = kitchenOrders.find(order => order.id === activeOrder.id);
    if (orderInKitchen) {
      console.log('✅ Orden aparece en cocina:', {
        id: orderInKitchen.id,
        status: orderInKitchen.status,
        itemsCount: orderInKitchen.items?.length || 0
      });
    } else {
      console.log('❌ Orden NO aparece en cocina');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    console.error('📊 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Ejecutar la prueba
testAddItems();






