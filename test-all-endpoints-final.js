const axios = require('axios');

const BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    log(`✅ ${method.toUpperCase()} ${endpoint} - Status: ${response.status}`, 'green');
    
    if (response.data) {
      console.log(`   📊 Response:`, JSON.stringify(response.data, null, 2));
    }
    
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    log(`❌ ${method.toUpperCase()} ${endpoint} - Error: ${error.response?.status || error.message}`, 'red');
    
    if (error.response?.data) {
      console.log(`   📊 Error Response:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, status: error.response?.status, error: error.message };
  }
}

async function runTests() {
  log('🚀 INICIANDO PRUEBAS COMPLETAS DE ENDPOINTS', 'bold');
  log('='.repeat(60), 'blue');
  
  const results = {
    health: [],
    catalog: [],
    orders: [],
    auth: [],
    emergency: []
  };
  
  // 1. HEALTH ENDPOINTS
  log('\n📋 1. PROBANDO HEALTH ENDPOINTS', 'yellow');
  results.health.push(await testEndpoint('GET', '/health'));
  results.health.push(await testEndpoint('GET', '/version'));
  
  // 2. CATALOG ENDPOINTS
  log('\n📋 2. PROBANDO CATALOG ENDPOINTS', 'yellow');
  results.catalog.push(await testEndpoint('GET', '/catalog/public/test'));
  results.catalog.push(await testEndpoint('GET', '/catalog/public/spaces'));
  results.catalog.push(await testEndpoint('GET', '/catalog/public/categories'));
  results.catalog.push(await testEndpoint('GET', '/catalog/public/products'));
  results.catalog.push(await testEndpoint('GET', '/catalog/public/combos'));
  
  // 3. ORDERS ENDPOINTS
  log('\n📋 3. PROBANDO ORDERS ENDPOINTS', 'yellow');
  results.orders.push(await testEndpoint('GET', '/orders'));
  results.orders.push(await testEndpoint('GET', '/orders/kitchen'));
  results.orders.push(await testEndpoint('GET', '/orders/test/simple'));
  
  // 4. AUTH ENDPOINTS
  log('\n📋 4. PROBANDO AUTH ENDPOINTS', 'yellow');
  results.auth.push(await testEndpoint('POST', '/auth/login', {
    username: 'test',
    password: 'test'
  }));
  
  // 5. EMERGENCY ENDPOINTS
  log('\n📋 5. PROBANDO EMERGENCY ENDPOINTS', 'yellow');
  results.emergency.push(await testEndpoint('GET', '/catalog/public/emergency-test'));
  results.emergency.push(await testEndpoint('GET', '/catalog/public/spaces-direct'));
  results.emergency.push(await testEndpoint('GET', '/orders/direct'));
  results.emergency.push(await testEndpoint('GET', '/catalog/public/connection-test'));
  
  // 6. DIAGNOSTIC ENDPOINTS
  log('\n📋 6. PROBANDO DIAGNOSTIC ENDPOINTS', 'yellow');
  results.emergency.push(await testEndpoint('GET', '/catalog/public/diagnose-tables'));
  results.emergency.push(await testEndpoint('GET', '/orders/test/database-check'));
  
  // RESUMEN DE RESULTADOS
  log('\n📊 RESUMEN DE RESULTADOS', 'bold');
  log('='.repeat(60), 'blue');
  
  const totalTests = Object.values(results).flat().length;
  const successfulTests = Object.values(results).flat().filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  log(`Total de pruebas: ${totalTests}`, 'blue');
  log(`✅ Exitosas: ${successfulTests}`, 'green');
  log(`❌ Fallidas: ${failedTests}`, 'red');
  
  // Detalles por categoría
  Object.entries(results).forEach(([category, tests]) => {
    const successCount = tests.filter(t => t.success).length;
    const totalCount = tests.length;
    const status = successCount === totalCount ? '✅' : '❌';
    log(`${status} ${category.toUpperCase()}: ${successCount}/${totalCount}`, 
         successCount === totalCount ? 'green' : 'red');
  });
  
  // Recomendaciones
  log('\n💡 RECOMENDACIONES', 'yellow');
  if (failedTests === 0) {
    log('🎉 ¡TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE!', 'green');
    log('✅ El backend está completamente operativo', 'green');
    log('✅ La conexión con Supabase funciona', 'green');
    log('✅ El frontend puede conectarse sin problemas', 'green');
  } else {
    log('⚠️  Algunos endpoints fallaron. Revisa los errores arriba.', 'yellow');
    log('🔧 Verifica las variables de entorno en Render', 'yellow');
    log('🔧 Revisa los logs del servicio en Render', 'yellow');
  }
  
  log('\n🏁 PRUEBAS COMPLETADAS', 'bold');
}

// Ejecutar las pruebas
runTests().catch(console.error);


