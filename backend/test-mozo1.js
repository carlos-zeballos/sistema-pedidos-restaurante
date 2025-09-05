const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testMozo1() {
  console.log('🔐 Probando login con mozo1...\n');

  try {
    console.log('1️⃣ Probando login con mozo1...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'mozo1',
      password: 'mozo123'
    });

    console.log('✅ Login exitoso!');
    console.log('   Token:', response.data.access_token.substring(0, 50) + '...');
    console.log('   Usuario:', response.data.user.username);
    console.log('   Rol:', response.data.user.role);

  } catch (error) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Mensaje:', error.response.data.message);
      console.log('   Error:', error.response.data.error);
    } else {
      console.log('   Error de conexión:', error.message);
    }
  }
}

testMozo1();
