const https = require('https');

console.log('🔍 PROBANDO ENDPOINTS EN URL CORRECTA');
console.log('====================================');

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
          data: data.substring(0, 300)
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

async function testEndpoints() {
  const endpoints = [
    '/',
    '/catalog/public/products',
    '/catalog/public/spaces',
    '/orders',
    '/health'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${baseUrl}${endpoint}`);
      const result = await makeRequest(endpoint);
      
      if (result.statusCode === 200) {
        console.log(`✅ ${endpoint}: OK (${result.statusCode})`);
        console.log(`   Respuesta: ${result.data}`);
      } else {
        console.log(`⚠️  ${endpoint}: ${result.statusCode}`);
        console.log(`   Respuesta: ${result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.error}`);
    }
  }
}

testEndpoints().then(() => {
  console.log('\n🎯 VERIFICACIÓN COMPLETADA');
}).catch(error => {
  console.error('❌ Error durante la verificación:', error);
});
