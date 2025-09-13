const axios = require('axios');

const API_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function getValidCredentials() {
  console.log('🔍 Obteniendo credenciales válidas...');
  
  try {
    // Intentar con diferentes credenciales comunes
    const credentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'admin@restaurante.com', password: 'admin123' },
      { username: 'admin', password: 'admin' },
      { username: 'test', password: 'test123' },
      { username: 'user', password: 'user123' }
    ];

    for (const cred of credentials) {
      try {
        console.log(`🔐 Probando: ${cred.username} / ${cred.password}`);
        const response = await axios.post(`${API_URL}/auth/login`, cred);
        console.log('✅ Credenciales válidas encontradas:', cred);
        console.log('Token:', response.data.access_token);
        return cred;
      } catch (error) {
        console.log('❌ Credenciales inválidas:', cred.username);
      }
    }
    
    console.log('❌ No se encontraron credenciales válidas');
    return null;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

getValidCredentials();

