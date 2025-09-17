const axios = require('axios');

const BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

// Función para probar endpoints con manejo de errores detallado
async function testEndpoint(name, url, method = 'GET', data = null) {
  console.log(`\n🧪 Probando: ${name}`);
  console.log(`📍 URL: ${method} ${url}`);
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    console.log(`✅ ÉXITO - Status: ${response.status}`);
    console.log(`📊 Respuesta:`, JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ ERROR - Status: ${error.response?.status || 'No response'}`);
    console.log(`💥 Mensaje: ${error.message}`);
    
    if (error.response) {
      console.log(`📋 Datos de error:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return {
      success: false,
      status: error.response?.status,
      error: error.message,
      data: error.response?.data
    };
  }
}

// Función principal para probar endpoints de emergencia
async function testEmergencyEndpoints() {
  console.log('🚨 PROBANDO ENDPOINTS DE EMERGENCIA');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // 1. Probar endpoints básicos
  console.log('\n📋 FASE 1: ENDPOINTS BÁSICOS');
  console.log('-'.repeat(50));
  
  results.testPublic = await testEndpoint('Test Public', '/catalog/public/test');
  
  // 2. Probar nuevos endpoints simples
  console.log('\n📋 FASE 2: NUEVOS ENDPOINTS SIMPLES');
  console.log('-'.repeat(50));
  
  results.spacesSimple = await testEndpoint('Spaces Simple', '/catalog/public/spaces-simple');
  results.categoriesSimple = await testEndpoint('Categories Simple', '/catalog/public/categories-simple');
  results.diagnoseTables = await testEndpoint('Diagnose Tables', '/catalog/public/diagnose-tables');
  
  // 3. Probar endpoints originales (para comparar)
  console.log('\n📋 FASE 3: ENDPOINTS ORIGINALES (COMPARACIÓN)');
  console.log('-'.repeat(50));
  
  results.spacesOriginal = await testEndpoint('Spaces Original', '/catalog/public/spaces');
  results.categoriesOriginal = await testEndpoint('Categories Original', '/catalog/public/categories');
  
  // 4. Probar orders
  console.log('\n📋 FASE 4: ENDPOINTS DE ORDERS');
  console.log('-'.repeat(50));
  
  results.orders = await testEndpoint('Orders', '/orders');
  
  // Resumen de resultados
  console.log('\n📊 RESUMEN DE RESULTADOS');
  console.log('=' .repeat(60));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Exitosos: ${successful}/${total}`);
  console.log(`❌ Fallidos: ${total - successful}/${total}`);
  
  // Análisis específico
  console.log('\n🔍 ANÁLISIS ESPECÍFICO:');
  console.log('-'.repeat(50));
  
  if (results.spacesSimple.success) {
    console.log('✅ NUEVO endpoint /catalog/public/spaces-simple FUNCIONA');
    console.log(`📊 Espacios encontrados: ${results.spacesSimple.data?.count || 0}`);
  } else {
    console.log('❌ NUEVO endpoint /catalog/public/spaces-simple FALLA');
    console.log(`💥 Error: ${results.spacesSimple.error}`);
  }
  
  if (results.categoriesSimple.success) {
    console.log('✅ NUEVO endpoint /catalog/public/categories-simple FUNCIONA');
    console.log(`📊 Categorías encontradas: ${results.categoriesSimple.data?.count || 0}`);
  } else {
    console.log('❌ NUEVO endpoint /catalog/public/categories-simple FALLA');
    console.log(`💥 Error: ${results.categoriesSimple.error}`);
  }
  
  if (results.orders.success) {
    console.log('✅ Endpoint /orders FUNCIONA');
    console.log(`📊 Órdenes encontradas: ${results.orders.data?.length || 0}`);
  } else {
    console.log('❌ Endpoint /orders FALLA');
    console.log(`💥 Error: ${results.orders.error}`);
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(50));
  
  if (results.spacesSimple.success) {
    console.log('🎯 SOLUCIÓN: Usar /catalog/public/spaces-simple en lugar de /catalog/public/spaces');
  }
  
  if (results.categoriesSimple.success) {
    console.log('🎯 SOLUCIÓN: Usar /catalog/public/categories-simple en lugar de /catalog/public/categories');
  }
  
  if (results.diagnoseTables.success) {
    console.log('🔍 DIAGNÓSTICO: Revisar la estructura de tablas en la respuesta');
  }
  
  console.log('\n🎯 PRUEBAS DE EMERGENCIA COMPLETADAS');
  console.log('=' .repeat(60));
  
  return results;
}

// Ejecutar las pruebas
testEmergencyEndpoints().catch(console.error);


