const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDebug() {
  try {
    console.log('🧪 Probando con debug detallado...');
    
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
    
    console.log('✅ Orden encontrada:', {
      id: activeOrder.id,
      orderNumber: activeOrder.orderNumber,
      status: activeOrder.status,
      totalAmount: activeOrder.totalAmount,
      subtotal: activeOrder.subtotal
    });
    
    // 2. Probar agregar item con datos más específicos
    const testItem = {
      items: [{
        productId: null,
        comboId: null,
        name: 'TEST ITEM DEBUG',
        unitPrice: 5.00,
        totalPrice: 5.00,
        quantity: 1,
        notes: 'Item de prueba para debug'
      }]
    };
    
    console.log('📤 Enviando request...');
    console.log('📋 Datos del item:', JSON.stringify(testItem, null, 2));
    
    const response = await axios.post(
      `${API_BASE_URL}/orders/${activeOrder.id}/items`,
      testItem
    );
    
    console.log('✅ Éxito:', response.data);
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Mostrar el error completo si existe
      if (error.response.data && error.response.data.error) {
        console.error('🔍 Error del backend:', {
          name: error.response.data.error.name,
          message: error.response.data.error.message,
          stack: error.response.data.error.stack
        });
      }
    } else if (error.request) {
      console.error('📡 Error de red:', error.request);
    } else {
      console.error('❓ Error desconocido:', error.message);
    }
  }
}

testDebug();










