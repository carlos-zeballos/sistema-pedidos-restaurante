const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testOrderCreationFixed() {
  console.log('🧪 Probando creación de órdenes con RPC corregido...\n');

  try {
    // 1. Probar login con usuarios disponibles
    console.log('1️⃣ Obteniendo token de autenticación...');
    
    const credentials = [
      { username: 'caja1', password: 'caja1' },
      { username: 'barra1', password: 'barra1' },
      { username: 'barra2', password: 'barra2' }
    ];
    
    let token = null;
    for (const cred of credentials) {
      try {
        console.log(`🔐 Probando: ${cred.username}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, cred);
        token = loginResponse.data.access_token;
        console.log(`✅ Login exitoso con: ${cred.username}`);
        break;
      } catch (error) {
        console.log(`❌ Falló: ${cred.username}`);
      }
    }
    
    if (!token) {
      console.log('❌ No se pudo autenticar con ningún usuario');
      return;
    }

    console.log('✅ Token obtenido');

    // 2. Obtener espacios disponibles
    console.log('\n2️⃣ Obteniendo espacios...');
    const spacesResponse = await axios.get(`${API_BASE_URL}/catalog/public/spaces`);
    const spaces = spacesResponse.data;
    console.log(`✅ Espacios encontrados: ${spaces.length}`);
    
    const availableSpace = spaces.find(s => s.status === 'LIBRE' || s.status === 'DISPONIBLE');
    if (!availableSpace) {
      console.log('❌ No hay espacios disponibles');
      return;
    }
    console.log(`✅ Usando espacio: ${availableSpace.name} (${availableSpace.id})`);

    // 3. Probar creación de orden con endpoint de prueba
    console.log('\n3️⃣ Probando creación de orden...');
    const orderData = {
      spaceId: availableSpace.id,
      createdBy: 'test-user-id',
      customerName: 'Cliente de Prueba RPC',
      customerPhone: '123456789',
      totalAmount: 25.99,
      subtotal: 25.99,
      tax: 0,
      discount: 0,
      deliveryCost: 0,
      isDelivery: false,
      notes: 'Orden de prueba con RPC corregido',
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
    console.log('   Total:', response.data.totalAmount);
    console.log('   Items:', response.data.items?.length || 0);

    // 4. Probar creación de orden de delivery
    console.log('\n4️⃣ Probando creación de orden de delivery...');
    const deliveryOrderData = {
      spaceId: availableSpace.id,
      createdBy: 'test-user-id',
      customerName: 'Cliente Delivery',
      customerPhone: '987654321',
      totalAmount: 35.99,
      subtotal: 30.99,
      tax: 0,
      discount: 0,
      deliveryCost: 5.00,
      isDelivery: true,
      notes: 'Orden de delivery de prueba',
      items: [
        {
          productId: null,
          comboId: null,
          name: 'Sushi Roll Delivery',
          unitPrice: 15.99,
          totalPrice: 15.99,
          quantity: 1,
          notes: 'Para delivery'
        }
      ]
    };

    const deliveryResponse = await axios.post(`${API_BASE_URL}/orders/test`, deliveryOrderData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Orden de delivery creada exitosamente');
    console.log('   ID:', deliveryResponse.data.id);
    console.log('   Número de orden:', deliveryResponse.data.orderNumber);
    console.log('   Es delivery:', deliveryResponse.data.isDelivery);
    console.log('   Costo delivery:', deliveryResponse.data.deliveryCost);

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

testOrderCreationFixed();
