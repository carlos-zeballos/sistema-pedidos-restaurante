const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function checkUsers() {
  console.log('🔍 Verificando usuarios disponibles...\n');

  try {
    // Probar diferentes credenciales comunes
    const credentials = [
      { username: 'admin', password: 'Admin123!' },
      { username: 'admin', password: 'admin' },
      { username: 'admin', password: 'password' },
      { username: 'admin', password: '123456' },
      { username: 'mozo', password: 'mozo' },
      { username: 'mozo', password: 'Mozo123!' },
      { username: 'test', password: 'test' },
      { username: 'user', password: 'user' }
    ];

    for (const cred of credentials) {
      try {
        console.log(`🔐 Probando: ${cred.username} / ${cred.password}`);
        const response = await axios.post(`${API_BASE_URL}/auth/login`, cred);
        console.log('✅ Login exitoso con:', cred.username);
        console.log('   Token:', response.data.access_token.substring(0, 50) + '...');
        console.log('   Usuario:', response.data.user);
        return response.data.access_token;
      } catch (error) {
        console.log('❌ Falló:', cred.username);
      }
    }

    console.log('\n❌ Ninguna credencial funcionó');
    
    // Intentar crear un usuario de prueba
    console.log('\n🆕 Intentando crear usuario de prueba...');
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: 'testuser',
        password: 'Test123!',
        email: 'test@example.com',
        role: 'MOZO'
      });
      console.log('✅ Usuario creado:', createResponse.data);
      
      // Probar login con el nuevo usuario
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'Test123!'
      });
      console.log('✅ Login con nuevo usuario exitoso');
      return loginResponse.data.access_token;
      
    } catch (createError) {
      console.log('❌ No se pudo crear usuario:', createError.response?.data);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkUsers();



