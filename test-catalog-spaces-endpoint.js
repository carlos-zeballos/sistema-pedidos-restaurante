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

// Función principal para probar endpoints de catalog
async function testCatalogEndpoints() {
  console.log('🚀 PROBANDO ENDPOINTS DE CATALOG');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // 1. Pruebas de endpoints públicos
  console.log('\n📋 FASE 1: ENDPOINTS PÚBLICOS');
  console.log('-'.repeat(50));
  
  results.testPublic = await testEndpoint('Test Public', '/catalog/public/test');
  results.categoriesPublic = await testEndpoint('Categories Public', '/catalog/public/categories');
  results.productsPublic = await testEndpoint('Products Public', '/catalog/public/products');
  results.spacesPublic = await testEndpoint('Spaces Public', '/catalog/public/spaces');
  results.combosPublic = await testEndpoint('Combos Public', '/catalog/public/combos');
  
  // 2. Pruebas de endpoints protegidos (sin autenticación - deberían fallar)
  console.log('\n📋 FASE 2: ENDPOINTS PROTEGIDOS (SIN AUTH)');
  console.log('-'.repeat(50));
  
  results.categoriesProtected = await testEndpoint('Categories Protected', '/catalog/categories');
  results.productsProtected = await testEndpoint('Products Protected', '/catalog/products');
  results.spacesProtected = await testEndpoint('Spaces Protected', '/catalog/spaces');
  results.combosProtected = await testEndpoint('Combos Protected', '/catalog/combos');
  
  // 3. Pruebas específicas de diagnóstico
  console.log('\n📋 FASE 3: DIAGNÓSTICO ESPECÍFICO');
  console.log('-'.repeat(50));
  
  // Probar endpoint directo de categorías
  results.categoriesDirect = await testEndpoint('Categories Direct', '/catalog/public/categories-direct');
  
  // Probar con diferentes parámetros
  results.productsWithCategory = await testEndpoint('Products with Category', '/catalog/public/products?categoryId=test');
  
  // Resumen de resultados
  console.log('\n📊 RESUMEN DE RESULTADOS');
  console.log('=' .repeat(60));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Exitosos: ${successful}/${total}`);
  console.log(`❌ Fallidos: ${total - successful}/${total}`);
  
  // Detalles de errores
  const failed = Object.entries(results).filter(([name, result]) => !result.success);
  if (failed.length > 0) {
    console.log('\n🔍 DETALLES DE ERRORES:');
    console.log('-'.repeat(50));
    failed.forEach(([name, result]) => {
      console.log(`❌ ${name}: ${result.error}`);
      if (result.status) {
        console.log(`   Status: ${result.status}`);
      }
      if (result.data) {
        console.log(`   Error Data: ${JSON.stringify(result.data)}`);
      }
    });
  }
  
  // Análisis específico del problema de spaces
  console.log('\n🔍 ANÁLISIS ESPECÍFICO DEL PROBLEMA DE SPACES:');
  console.log('-'.repeat(50));
  
  if (results.spacesPublic.success) {
    console.log('✅ El endpoint /catalog/public/spaces funciona correctamente');
    console.log(`📊 Espacios encontrados: ${results.spacesPublic.data?.length || 0}`);
  } else {
    console.log('❌ El endpoint /catalog/public/spaces tiene problemas');
    console.log(`💥 Error: ${results.spacesPublic.error}`);
    console.log(`📋 Status: ${results.spacesPublic.status}`);
    
    // Analizar el tipo de error
    if (results.spacesPublic.status === 500) {
      console.log('🔧 Problema: Error interno del servidor (500)');
      console.log('💡 Posibles causas:');
      console.log('   - Problema en la consulta SQL');
      console.log('   - Columnas faltantes en la tabla Space');
      console.log('   - Problema de conexión a la base de datos');
    } else if (results.spacesPublic.status === 404) {
      console.log('🔧 Problema: Endpoint no encontrado (404)');
      console.log('💡 Posibles causas:');
      console.log('   - Ruta incorrecta');
      console.log('   - Controlador no registrado');
    } else if (results.spacesPublic.status === 401) {
      console.log('🔧 Problema: No autorizado (401)');
      console.log('💡 Posibles causas:');
      console.log('   - Endpoint requiere autenticación');
    }
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(50));
  
  if (results.testPublic.success) {
    console.log('✅ El controlador de catalog está funcionando');
  } else {
    console.log('❌ Problemas en el controlador de catalog');
  }
  
  if (results.categoriesPublic.success) {
    console.log('✅ Las categorías funcionan correctamente');
  } else {
    console.log('❌ Problemas con las categorías');
  }
  
  if (results.spacesPublic.success) {
    console.log('✅ Los espacios funcionan correctamente');
  } else {
    console.log('❌ Problemas específicos con los espacios');
    console.log('🔧 Acción recomendada: Revisar la consulta SQL en getSpaces()');
  }
  
  console.log('\n🎯 PRUEBAS COMPLETADAS');
  console.log('=' .repeat(60));
  
  return results;
}

// Ejecutar las pruebas
testCatalogEndpoints().catch(console.error);
