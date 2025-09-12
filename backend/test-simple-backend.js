const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

console.log('🧪 PRUEBA SIMPLE DEL BACKEND');
console.log('============================');

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Probando: ${description}`);
    console.log(`URL: ${BASE_URL}${endpoint}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Datos:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.code}`);
    console.log(`📝 Mensaje: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Iniciando pruebas...\n');
  
  const tests = [
    { endpoint: '/health', description: 'Health Check' },
    { endpoint: '/catalog/public/test', description: 'Test Público' },
    { endpoint: '/catalog/public/categories', description: 'Categorías Públicas' },
    { endpoint: '/catalog/public/products', description: 'Productos Públicos' },
    { endpoint: '/catalog/public/spaces', description: 'Espacios Públicos' },
    { endpoint: '/catalog/public/combos', description: 'Combos Públicos' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 RESULTADOS:');
  console.log(`✅ Exitosos: ${passed}`);
  console.log(`❌ Fallidos: ${failed}`);
  
  if (failed > 0) {
    console.log('\n🔧 SOLUCIONES:');
    console.log('1. Verifica que el backend esté corriendo: npm run start:dev');
    console.log('2. Verifica que el archivo .env tenga las credenciales correctas');
    console.log('3. Ejecuta: node diagnose-500-error.js');
  }
}

runTests().catch(console.error);













