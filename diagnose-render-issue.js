const https = require('https');

console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROBLEMA DE RENDER');
console.log('===============================================');

const baseUrl = 'https://sistema-pedidos-restaurante.onrender.com';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sistema-pedidos-restaurante.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          path: path,
          statusCode: res.statusCode,
          data: data.substring(0, 500)
        });
      });
    });

    req.on('error', (error) => {
      reject({
        path: path,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        path: path,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function diagnose() {
  console.log('\n📊 ANÁLISIS DEL PROBLEMA:');
  console.log('1. El servidor está funcionando (endpoints / y /health responden)');
  console.log('2. Pero las consultas SQL siguen fallando con errores de columnas inexistentes');
  console.log('3. Esto indica que Render está usando una versión anterior del código');
  
  console.log('\n🔍 PROBANDO ENDPOINTS:');
  
  const endpoints = [
    { path: '/', name: 'Health Check' },
    { path: '/health', name: 'Health API' },
    { path: '/catalog/public/products', name: 'Products API' },
    { path: '/catalog/public/spaces', name: 'Spaces API' }
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint.path);
      
      if (result.statusCode === 200) {
        console.log(`✅ ${endpoint.name}: OK`);
      } else if (result.statusCode === 500) {
        console.log(`❌ ${endpoint.name}: Error 500 - ${result.data}`);
      } else {
        console.log(`⚠️  ${endpoint.name}: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.error}`);
    }
  }

  console.log('\n🎯 DIAGNÓSTICO:');
  console.log('PROBLEMA: Render está usando una versión anterior del código');
  console.log('CAUSA: Las correcciones SQL no se están aplicando');
  console.log('SOLUCIÓN: Necesitamos forzar un rebuild completo o crear un nuevo servicio');
  
  console.log('\n📋 OPCIONES DISPONIBLES:');
  console.log('1. Crear un nuevo servicio en Render con la configuración correcta');
  console.log('2. Forzar un rebuild completo del servicio actual');
  console.log('3. Verificar la configuración de Render en el dashboard');
  
  console.log('\n🚀 RECOMENDACIÓN:');
  console.log('Crear un nuevo servicio en Render para evitar problemas de cache');
}

diagnose().catch(error => {
  console.error('❌ Error durante el diagnóstico:', error);
});
