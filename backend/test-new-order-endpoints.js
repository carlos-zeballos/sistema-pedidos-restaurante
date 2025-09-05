const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testNewOrderEndpoints() {
  console.log('🔍 Probando endpoints para Nueva Orden...\n');

  // 1. Login para obtener token
  let token = '';
  try {
    console.log('1️⃣ Probando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });
    token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');
  } catch (error) {
    console.log('❌ Error en login:', error.response?.data || error.message);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Probar endpoint de productos (catalog/products)
  try {
    console.log('\n2️⃣ Probando productos...');
    const response = await axios.get(`${API_BASE_URL}/catalog/products`, { headers });
    console.log('✅ Productos:', response.data.length, 'elementos');
    if (response.data.length > 0) {
      console.log('   Primer producto:', response.data[0].name, '- $', response.data[0].price);
    }
  } catch (error) {
    console.log('❌ Error en productos:', error.response?.status, error.response?.data?.message || error.message);
    console.log('   Detalles del error:', error.response?.data);
  }

  // 3. Probar endpoint de categorías (catalog/categories)
  try {
    console.log('\n3️⃣ Probando categorías...');
    const response = await axios.get(`${API_BASE_URL}/catalog/categories`, { headers });
    console.log('✅ Categorías:', response.data.length, 'elementos');
    if (response.data.length > 0) {
      console.log('   Primera categoría:', response.data[0].name);
    }
  } catch (error) {
    console.log('❌ Error en categorías:', error.response?.status, error.response?.data?.message || error.message);
    console.log('   Detalles del error:', error.response?.data);
  }

  // 4. Probar endpoint de espacios (tables)
  try {
    console.log('\n4️⃣ Probando espacios...');
    const response = await axios.get(`${API_BASE_URL}/tables`, { headers });
    console.log('✅ Espacios:', response.data.length, 'elementos');
    if (response.data.length > 0) {
      console.log('   Primer espacio:', response.data[0].name, '-', response.data[0].type);
    }
  } catch (error) {
    console.log('❌ Error en espacios:', error.response?.status, error.response?.data?.message || error.message);
    console.log('   Detalles del error:', error.response?.data);
  }

  console.log('\n🎯 Prueba de endpoints para Nueva Orden completada');
}

testNewOrderEndpoints();
