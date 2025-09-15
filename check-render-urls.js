const https = require('https');

console.log('🔍 VERIFICANDO DIFERENTES URLs DE RENDER');
console.log('=========================================');

const urls = [
  'https://sistema-pedidos-backend.onrender.com',
  'https://sistema-pedidos-restaurante.onrender.com',
  'https://sistema-pedidos-restaurante-backend.onrender.com'
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.replace('https://', ''),
      port: 443,
      path: '/',
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
          url: url,
          statusCode: res.statusCode,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      reject({
        url: url,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        url: url,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function testAllUrls() {
  for (const url of urls) {
    try {
      console.log(`\n🔍 Probando: ${url}`);
      const result = await testUrl(url);
      
      if (result.statusCode === 200) {
        console.log(`✅ ${url}: OK (${result.statusCode})`);
        console.log(`   Respuesta: ${result.data}`);
      } else {
        console.log(`⚠️  ${url}: ${result.statusCode}`);
        console.log(`   Respuesta: ${result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${url}: Error - ${error.error}`);
    }
  }
}

testAllUrls().then(() => {
  console.log('\n🎯 VERIFICACIÓN COMPLETADA');
}).catch(error => {
  console.error('❌ Error durante la verificación:', error);
});
