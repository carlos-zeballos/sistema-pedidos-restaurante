const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

const credentials = [
  { username: 'admin', password: 'Admin123!', role: 'ADMIN' },
  { username: 'mozo1', password: 'Mozo123!', role: 'MOZO' },
  { username: 'mozo2', password: 'Mozo123!', role: 'MOZO' },
  { username: 'cocinero1', password: 'Cocina123!', role: 'COCINERO' },
  { username: 'cocinero2', password: 'Cocina123!', role: 'COCINERO' }
];

async function testCredentials() {
  console.log('🔐 Probando nuevas credenciales...\n');

  for (const cred of credentials) {
    try {
      console.log(`📝 Probando: ${cred.username} / ${cred.password}`);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: cred.username,
        password: cred.password
      });

      console.log('✅ Login exitoso!');
      console.log(`   Usuario: ${response.data.user.username}`);
      console.log(`   Rol: ${response.data.user.role}`);
      console.log(`   Token: ${response.data.access_token.substring(0, 30)}...`);
      console.log('');

    } catch (error) {
      console.log('❌ Error en login:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Mensaje: ${error.response.data.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

testCredentials();
