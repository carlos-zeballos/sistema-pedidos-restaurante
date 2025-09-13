const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🧪 PROBANDO ENDPOINTS DEL FRONTEND');
  console.log('==================================');

  const endpoints = [
    {
      name: 'Categorías (público)',
      url: `${API_BASE_URL}/catalog/public/categories`,
      method: 'GET'
    },
    {
      name: 'Productos (público)',
      url: `${API_BASE_URL}/catalog/public/products`,
      method: 'GET'
    },
    {
      name: 'Espacios (público)',
      url: `${API_BASE_URL}/tables/public/spaces`,
      method: 'GET'
    },
    {
      name: 'Combos (público)',
      url: `${API_BASE_URL}/catalog/public/combos`,
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Probando: ${endpoint.name}`);
      console.log(`🔗 URL: ${endpoint.url}`);
      
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 5000
      });

      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Datos recibidos: ${Array.isArray(response.data) ? response.data.length : 'N/A'} elementos`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`📝 Primer elemento:`, JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
      }

    } catch (error) {
      console.error(`❌ Error en ${endpoint.name}:`);
      console.error(`   Status: ${error.response?.status || 'N/A'}`);
      console.error(`   Message: ${error.message}`);
      if (error.response?.data) {
        console.error(`   Response:`, JSON.stringify(error.response.data, null, 2).substring(0, 200) + '...');
      }
    }
  }

  console.log('\n🎯 RESUMEN:');
  console.log('===========');
  console.log('Si todos los endpoints devuelven Status 200, el backend está funcionando correctamente.');
  console.log('Si hay errores, revisa los logs del backend y la configuración de la base de datos.');
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('1. Abre el navegador y ve a la vista del catálogo');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console para ver los logs detallados');
  console.log('4. Verifica que no haya errores de red en la pestaña Network');
}

testEndpoints().catch(console.error);














