const axios = require('axios');

async function simpleTest() {
  console.log('🔍 Probando backend simple...');
  
  try {
    // Esperar un poco para que el backend se inicie
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
    console.log('✅ Backend responde:', response.status);
    
    // Probar categories
    const catResponse = await axios.get('http://localhost:3001/catalog/categories', { timeout: 5000 });
    console.log('✅ Categories responde:', catResponse.status);
    console.log('   - Categorías:', catResponse.data.length);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - Data:', error.response.data);
    }
  }
}

simpleTest();








