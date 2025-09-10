const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

console.log('🧪 PRUEBA ESPECÍFICA: CATALOG MANAGEMENT');
console.log('=========================================');

async function testCatalogEndpoints() {
  const endpoints = [
    { url: '/catalog/public/categories', name: 'Categorías' },
    { url: '/catalog/public/products', name: 'Productos' },
    { url: '/catalog/public/spaces', name: 'Espacios' },
    { url: '/catalog/public/combos', name: 'Combos' }
  ];

  let allPassed = true;

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint.name}`);
      console.log(`URL: ${BASE_URL}${endpoint.url}`);
      
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Datos recibidos: ${Array.isArray(response.data) ? response.data.length : 'No es array'} elementos`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`📝 Primer elemento:`, JSON.stringify(response.data[0], null, 2).slice(0, 200) + '...');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.code}`);
      console.log(`📝 Mensaje: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log(`🔍 Detalles del error:`, JSON.stringify(error.response.data, null, 2));
      }
      
      allPassed = false;
    }
  }

  console.log('\n📊 RESULTADO FINAL:');
  if (allPassed) {
    console.log('✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE');
    console.log('🎉 El error 500 en CatalogManagement está RESUELTO');
  } else {
    console.log('❌ ALGUNOS ENDPOINTS AÚN FALLAN');
    console.log('🔧 Revisa los errores específicos arriba');
  }
}

testCatalogEndpoints().catch(console.error);









