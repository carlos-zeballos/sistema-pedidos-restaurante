require('dotenv').config();
const axios = require('axios');

async function testComboManagement() {
  console.log('🧪 Probando gestión de combos...');
  
  const API_BASE_URL = 'http://localhost:3001';
  
  try {
    // 1. Probar obtener combos
    console.log('\n📋 1. Obteniendo combos existentes...');
    const combosResponse = await axios.get(`${API_BASE_URL}/catalog/public/combos`);
    console.log('✅ Combos obtenidos:', combosResponse.data.length);
    console.log('Combos:', combosResponse.data.map(c => ({ id: c.id, name: c.name, code: c.code })));

    // 2. Probar obtener categorías
    console.log('\n📂 2. Obteniendo categorías...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/catalog/public/categories`);
    console.log('✅ Categorías obtenidas:', categoriesResponse.data.length);
    console.log('Categorías:', categoriesResponse.data.map(c => ({ id: c.id, name: c.name })));

    // 3. Probar obtener productos
    console.log('\n🍽️ 3. Obteniendo productos...');
    const productsResponse = await axios.get(`${API_BASE_URL}/catalog/public/products`);
    console.log('✅ Productos obtenidos:', productsResponse.data.length);
    console.log('Productos de comida:', productsResponse.data.filter(p => p.type === 'COMIDA').map(p => ({ id: p.id, name: p.name, categoryId: p.categoryId })));

    // 4. Probar crear un combo
    console.log('\n➕ 4. Probando crear un combo...');
    const newCombo = {
      code: 'TEST001',
      name: 'Combo de Prueba',
      basePrice: 25.90,
      categoryId: categoriesResponse.data[0]?.id || 'default-category',
      platosIds: productsResponse.data.filter(p => p.type === 'COMIDA').slice(0, 2).map(p => p.id),
      platosMax: 2,
      acompIds: [],
      acompMax: 0,
      chopsticksQuantity: 1,
      chopsticksType: 'NORMAL',
      description: 'Combo de prueba para testing',
      isEnabled: true,
      isAvailable: true,
      preparationTime: 15
    };

    console.log('📋 Datos del combo a crear:', JSON.stringify(newCombo, null, 2));

    const createResponse = await axios.post(`${API_BASE_URL}/catalog/combos`, newCombo, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Simular token
      }
    });

    console.log('✅ Combo creado exitosamente:');
    console.log('ID:', createResponse.data.id);
    console.log('Nombre:', createResponse.data.name);
    console.log('Código:', createResponse.data.code);

    // 5. Verificar que el combo se creó
    console.log('\n🔍 5. Verificando combo creado...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/catalog/public/combos`);
    const createdCombo = verifyResponse.data.find(c => c.code === 'TEST001');
    
    if (createdCombo) {
      console.log('✅ Combo encontrado en la lista:', createdCombo.name);
    } else {
      console.log('❌ Combo no encontrado en la lista');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

testComboManagement().catch(console.error);












