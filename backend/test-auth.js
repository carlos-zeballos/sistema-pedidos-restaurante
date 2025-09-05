const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAuth() {
  console.log('🔐 Probando autenticación...\n');

  try {
    // 1. Probar login
    console.log('1️⃣ Probando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });

    console.log('✅ Login exitoso');
    console.log('   Token:', loginResponse.data.access_token.substring(0, 50) + '...');
    console.log('   Usuario:', loginResponse.data.user);

    const token = loginResponse.data.access_token;

    // 2. Probar endpoint protegido
    console.log('\n2️⃣ Probando endpoint protegido...');
    const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Endpoint protegido accesible');
    console.log('   Usuario actual:', meResponse.data);

    // 3. Probar creación de orden con autenticación
    console.log('\n3️⃣ Probando creación de orden...');
    const orderData = {
      spaceid: 'test-space-id',
      createdby: meResponse.data.id,
      customername: 'Cliente de Prueba',
      customerphone: '123456789',
      totalamount: 25.99,
      subtotal: 25.99,
      tax: 0,
      discount: 0,
      notes: 'Orden de prueba',
      items: [
        {
          productid: 'test-product-id',
          name: 'Producto de Prueba',
          unitprice: 12.99,
          totalprice: 12.99,
          quantity: 1,
          status: 'PENDIENTE'
        }
      ]
    };

    const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Orden creada exitosamente');
    console.log('   Número de orden:', orderResponse.data.ordernumber);

    // 4. Probar endpoint sin autenticación (debe fallar)
    console.log('\n4️⃣ Probando endpoint sin autenticación...');
    try {
      await axios.get(`${API_BASE_URL}/auth/me`);
      console.log('❌ Error: Debería haber fallado');
    } catch (error) {
      console.log('✅ Correcto: Endpoint protegido rechazó acceso sin token');
    }

    console.log('\n🎉 ¡Todas las pruebas de autenticación pasaron!');

  } catch (error) {
    console.error('❌ Error en prueba de autenticación:', error.response?.data || error.message);
  }
}

testAuth();
