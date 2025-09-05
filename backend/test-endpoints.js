const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🔍 Probando endpoints del backend...\n');

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

  // 2. Probar endpoint de categorías
  try {
    console.log('\n2️⃣ Probando categorías...');
    const response = await axios.get(`${API_BASE_URL}/catalog/categories`, { headers });
    console.log('✅ Categorías:', response.data.length, 'elementos');
  } catch (error) {
    console.log('❌ Error en categorías:', error.response?.status, error.response?.data?.message || error.message);
  }

  // 3. Probar endpoint de productos
  try {
    console.log('\n3️⃣ Probando productos...');
    const response = await axios.get(`${API_BASE_URL}/catalog/products`, { headers });
    console.log('✅ Productos:', response.data.length, 'elementos');
  } catch (error) {
    console.log('❌ Error en productos:', error.response?.status, error.response?.data?.message || error.message);
  }

  // 4. Probar endpoint de espacios/mesas
  try {
    console.log('\n4️⃣ Probando espacios...');
    const response = await axios.get(`${API_BASE_URL}/tables`, { headers });
    console.log('✅ Espacios:', response.data.length, 'elementos');
  } catch (error) {
    console.log('❌ Error en espacios:', error.response?.status, error.response?.data?.message || error.message);
  }

  // 5. Probar endpoint de órdenes
  try {
    console.log('\n5️⃣ Probando órdenes...');
    const response = await axios.get(`${API_BASE_URL}/orders`, { headers });
    console.log('✅ Órdenes:', response.data.length, 'elementos');
  } catch (error) {
    console.log('❌ Error en órdenes:', error.response?.status, error.response?.data?.message || error.message);
  }

  // 6. Probar endpoint de usuarios
  try {
    console.log('\n6️⃣ Probando usuarios...');
    const response = await axios.get(`${API_BASE_URL}/users`, { headers });
    console.log('✅ Usuarios:', response.data.length, 'elementos');
  } catch (error) {
    console.log('❌ Error en usuarios:', error.response?.status, error.response?.data?.message || error.message);
  }

  console.log('\n🎯 Prueba de endpoints completada');
}

testEndpoints();
