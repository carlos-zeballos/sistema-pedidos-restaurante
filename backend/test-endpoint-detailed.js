const axios = require('axios');

async function testEndpointDetailed() {
  console.log('🔍 Probando endpoint con detalle...');
  
  try {
    console.log('📡 Haciendo petición a categories...');
    const response = await axios.get('http://localhost:3001/catalog/categories', {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Headers:', response.headers);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 500) {
      console.log('\n❌ Error 500 confirmado');
      console.log('💡 El problema está en el endpoint, no en el servicio');
    } else if (response.status === 200) {
      console.log('\n✅ Endpoint funciona correctamente');
      console.log('📊 Datos recibidos:', response.data?.length || 0);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

testEndpointDetailed();















