const axios = require('axios');

async function captureBackendError() {
  console.log('🔍 Capturando error específico del backend...');
  
  try {
    console.log('📡 Haciendo petición a categories para generar error...');
    const response = await axios.get('http://localhost:3001/catalog/categories', {
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 500) {
      console.log('\n❌ Error 500 confirmado');
      console.log('💡 REVISA LA CONSOLA DEL BACKEND AHORA');
      console.log('💡 Deberías ver un error específico en los logs del backend');
      console.log('💡 El error probablemente está en:');
      console.log('   - SupabaseService no se está inyectando correctamente');
      console.log('   - Error en la conexión a Supabase');
      console.log('   - Error en las variables de entorno');
      console.log('   - Error en el código del servicio');
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

captureBackendError();












