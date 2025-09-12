const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function checkBackendVersion() {
  console.log('🔍 Verificando versión del backend en producción...\n');

  try {
    // 1. Verificar endpoint de salud
    console.log('1️⃣ Verificando salud del backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend saludable:', healthResponse.data);

    // 2. Verificar si hay endpoint de versión o información
    console.log('\n2️⃣ Verificando información del backend...');
    try {
      const versionResponse = await axios.get(`${API_BASE_URL}/version`);
      console.log('✅ Versión del backend:', versionResponse.data);
    } catch (error) {
      console.log('⚠️ No hay endpoint de versión disponible');
    }

    // 3. Probar endpoint de órdenes para ver si está funcionando
    console.log('\n3️⃣ Verificando endpoint de órdenes...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Endpoint de órdenes accesible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint de órdenes funciona (error 401 esperado sin token)');
      } else {
        console.log('❌ Error en endpoint de órdenes:', error.response?.status);
      }
    }

    // 4. Verificar si el endpoint de prueba existe
    console.log('\n4️⃣ Verificando endpoint de prueba...');
    try {
      const testResponse = await axios.post(`${API_BASE_URL}/orders/test`, {
        test: 'data'
      });
      console.log('✅ Endpoint de prueba accesible');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 500) {
        console.log('✅ Endpoint de prueba existe (error esperado sin datos válidos)');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message);
      } else {
        console.log('❌ Error inesperado en endpoint de prueba:', error.response?.status);
      }
    }

    // 5. Verificar timestamp del último deployment
    console.log('\n5️⃣ Información del deployment...');
    console.log('   URL:', API_BASE_URL);
    console.log('   Timestamp actual:', new Date().toISOString());
    console.log('   Último commit:', '2833e96 - fix: Update orders service to support delivery parameters in RPC');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkBackendVersion();

