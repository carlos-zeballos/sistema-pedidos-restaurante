const https = require('https');

console.log('🔍 VERIFICANDO ESTADO DEL DEPLOY EN RENDER');
console.log('==========================================');

// URL del backend
const backendUrl = 'https://sistema-pedidos-backend.onrender.com';

console.log(`📡 Probando conexión a: ${backendUrl}`);

// Función para hacer petición HTTPS
function makeRequest(url, path = '/') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sistema-pedidos-backend.onrender.com',
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
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Probar endpoints
async function testEndpoints() {
  const endpoints = [
    { path: '/', name: 'Health Check' },
    { path: '/catalog/public/products', name: 'Products API' },
    { path: '/catalog/public/spaces', name: 'Spaces API' },
    { path: '/orders', name: 'Orders API' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando ${endpoint.name}: ${endpoint.path}`);
      const response = await makeRequest(backendUrl, endpoint.path);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${endpoint.name}: OK (${response.statusCode})`);
      } else {
        console.log(`⚠️  ${endpoint.name}: ${response.statusCode}`);
        if (response.data) {
          console.log(`   Respuesta: ${response.data.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }
}

// Ejecutar pruebas
testEndpoints().then(() => {
  console.log('\n🎯 VERIFICACIÓN COMPLETADA');
  console.log('Si todos los endpoints fallan, Render no está desplegado correctamente.');
}).catch(error => {
  console.error('❌ Error durante la verificación:', error);
});
