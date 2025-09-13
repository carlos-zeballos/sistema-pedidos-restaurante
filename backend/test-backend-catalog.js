const axios = require('axios');

async function testBackendCatalog() {
  console.log('🔍 Probando endpoints del backend...');
  console.log('=====================================');
  
  const baseURL = 'http://localhost:3001';
  
  // 1. Probar health endpoint
  console.log('\n1. Probando health endpoint...');
  try {
    const response = await axios.get(`${baseURL}/health`);
    console.log('✅ Health OK:', response.status);
  } catch (error) {
    console.log('❌ Health Error:', error.message);
    return;
  }

  // 2. Probar categories endpoint
  console.log('\n2. Probando categories endpoint...');
  try {
    const response = await axios.get(`${baseURL}/catalog/categories`);
    console.log('✅ Categories OK:', response.status);
    console.log('   - Categorías:', response.data.length);
    if (response.data.length > 0) {
      console.log('   - Primera categoría:', response.data[0].name);
    }
  } catch (error) {
    console.log('❌ Categories Error:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('   - Error details:', error.response.data);
    }
  }

  // 3. Probar products endpoint
  console.log('\n3. Probando products endpoint...');
  try {
    const response = await axios.get(`${baseURL}/catalog/products`);
    console.log('✅ Products OK:', response.status);
    console.log('   - Productos:', response.data.length);
  } catch (error) {
    console.log('❌ Products Error:', error.response?.status, error.response?.data?.message || error.message);
  }

  // 4. Probar spaces endpoint
  console.log('\n4. Probando spaces endpoint...');
  try {
    const response = await axios.get(`${baseURL}/catalog/spaces`);
    console.log('✅ Spaces OK:', response.status);
    console.log('   - Espacios:', response.data.length);
  } catch (error) {
    console.log('❌ Spaces Error:', error.response?.status, error.response?.data?.message || error.message);
  }

  // 5. Probar combos endpoint
  console.log('\n5. Probando combos endpoint...');
  try {
    const response = await axios.get(`${baseURL}/catalog/combos`);
    console.log('✅ Combos OK:', response.status);
    console.log('   - Combos:', response.data.length);
  } catch (error) {
    console.log('❌ Combos Error:', error.response?.status, error.response?.data?.message || error.message);
  }

  console.log('\n=====================================');
  console.log('🏁 Prueba del backend completada');
}

testBackendCatalog();














