const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testProductionOrder() {
  console.log('🧪 Probando creación de órdenes en producción...\n');

  try {
    // 1. Verificar salud del backend
    console.log('1️⃣ Verificando salud del backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend saludable:', healthResponse.data);

    // 2. Probar autenticación
    console.log('\n2️⃣ Probando autenticación...');
    const credentials = [
      { username: 'testuser', password: 'test123' },
      { username: 'caja1', password: 'caja1' },
      { username: 'barra1', password: 'barra1' },
      { username: 'barra2', password: 'barra2' }
    ];
    
    let token = null;
    let user = null;
    for (const cred of credentials) {
      try {
        console.log(`🔐 Probando: ${cred.username}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, cred);
        token = loginResponse.data.access_token;
        user = loginResponse.data.user;
        console.log(`✅ Login exitoso con: ${cred.username}`);
        break;
      } catch (error) {
        console.log(`❌ Falló: ${cred.username} - ${error.response?.status}`);
      }
    }
    
    if (!token) {
      console.log('❌ No se pudo autenticar');
      return;
    }

    // 3. Obtener espacios
    console.log('\n3️⃣ Obteniendo espacios...');
    const spacesResponse = await axios.get(`${API_BASE_URL}/catalog/public/spaces`);
    const spaces = spacesResponse.data;
    console.log(`✅ Espacios encontrados: ${spaces.length}`);
    
    const availableSpace = spaces.find(s => s.status === 'LIBRE' || s.status === 'DISPONIBLE');
    if (!availableSpace) {
      console.log('❌ No hay espacios disponibles');
      return;
    }
    console.log(`✅ Usando espacio: ${availableSpace.name} (${availableSpace.id})`);

    // 4. Probar creación de orden simple
    console.log('\n4️⃣ Probando creación de orden...');
    const orderData = {
      spaceId: availableSpace.id,
      createdBy: user.id,
      customerName: 'Cliente de Prueba',
      customerPhone: '123456789',
      totalAmount: 25.99,
      subtotal: 25.99,
      tax: 0,
      discount: 0,
      deliveryCost: 0,
      isDelivery: false,
      notes: 'Orden de prueba producción',
      items: [
        {
          productId: null,
          comboId: null,
          name: 'Producto de Prueba',
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Orden creada exitosamente');
    console.log('   ID:', response.data.id);
    console.log('   Número de orden:', response.data.orderNumber);
    console.log('   Estado:', response.data.status);

  } catch (error) {
    console.error('❌ Error completo:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.data?.message) {
      console.error('❌ Mensaje de error:', error.response.data.message);
    }
    
    if (error.response?.data?.details) {
      console.error('❌ Detalles:', error.response.data.details);
    }

    if (error.response?.data?.stack) {
      console.error('❌ Stack trace:', error.response.data.stack);
    }
  }
}

testProductionOrder();
