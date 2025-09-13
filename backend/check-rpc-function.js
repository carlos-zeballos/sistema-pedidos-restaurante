const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function checkRPCFunction() {
  console.log('🔍 Verificando función RPC en producción...\n');

  try {
    // 1. Probar login para obtener token
    console.log('1️⃣ Obteniendo token de autenticación...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Token obtenido');

    // 2. Probar creación de orden simple
    console.log('\n2️⃣ Probando creación de orden...');
    const orderData = {
      spaceId: 'test-space-id',
      createdBy: 'test-user-id',
      customerName: 'Cliente de Prueba',
      customerPhone: '123456789',
      totalAmount: 25.99,
      subtotal: 25.99,
      tax: 0,
      discount: 0,
      notes: 'Orden de prueba RPC',
      items: [
        {
          productId: null,
          comboId: null,
          name: 'Producto de Prueba RPC',
          unitPrice: 12.99,
          totalPrice: 12.99,
          quantity: 1,
          notes: 'Item de prueba'
        }
      ]
    };

    console.log('📤 Enviando datos:', JSON.stringify(orderData, null, 2));

    const response = await axios.post(`${API_BASE_URL}/orders/test`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Orden creada exitosamente');
    console.log('   ID:', response.data.id);
    console.log('   Número de orden:', response.data.orderNumber);
    console.log('   Estado:', response.data.status);

  } catch (error) {
    console.error('❌ Error completo:', error.response?.status, error.response?.data);
    
    if (error.response?.data?.message) {
      console.error('❌ Mensaje de error:', error.response.data.message);
    }
    
    if (error.response?.data?.details) {
      console.error('❌ Detalles:', error.response.data.details);
    }
  }
}

checkRPCFunction();


