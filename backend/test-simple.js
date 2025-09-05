const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testSimple() {
  try {
    console.log('🧪 Probando endpoint corregido...');
    
    // 1. Obtener órdenes
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
    const orders = ordersResponse.data;
    
    if (!orders || orders.length === 0) {
      console.log('❌ No hay órdenes para probar');
      return;
    }
    
    // Buscar orden activa
    const activeOrder = orders.find(order => 
      order.status !== 'PAGADO' && order.status !== 'CANCELADO'
    );
    
    if (!activeOrder) {
      console.log('❌ No hay órdenes activas');
      return;
    }
    
    console.log('✅ Orden encontrada:', activeOrder.orderNumber);
    
    // 2. Probar agregar item
    const testItem = {
      items: [{
        name: 'TEST ITEM',
        unitPrice: 5.00,
        totalPrice: 5.00,
        quantity: 1,
        notes: 'Item de prueba'
      }]
    };
    
    console.log('📤 Enviando request...');
    const response = await axios.post(
      `${API_BASE_URL}/orders/${activeOrder.id}/items`,
      testItem
    );
    
    console.log('✅ Éxito:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSimple();
