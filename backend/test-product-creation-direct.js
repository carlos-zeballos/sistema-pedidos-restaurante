const axios = require('axios');

async function testProductCreation() {
  try {
    console.log('🚀 Probando creación de producto via API...');
    
    // Primero, hacer login para obtener el token
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Obtener categorías para usar una válida
    const categoriesResponse = await axios.get('http://localhost:3001/catalog/public/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const categories = categoriesResponse.data;
    console.log('📋 Categorías disponibles:', categories.length);
    
    if (categories.length === 0) {
      console.log('❌ No hay categorías disponibles');
      return;
    }
    
    const category = categories[0];
    console.log(`📋 Usando categoría: ${category.name} (${category.id})`);
    
    // Datos de prueba que simulan lo que envía el frontend
    const productData = {
      code: 'TEST-' + Date.now(),
      name: 'Producto de Prueba API',
      categoryId: category.id,
      price: 25.50,
      type: 'COMIDA',
      description: 'Descripción de prueba',
      preparationTime: 15,
      isEnabled: true,
      isAvailable: true,
      allergens: [],
      nutritionalInfo: {}
    };
    
    console.log('📤 Enviando datos de producto:');
    console.log(JSON.stringify(productData, null, 2));
    
    // Intentar crear el producto
    const createResponse = await axios.post('http://localhost:3001/catalog/products', productData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Producto creado exitosamente!');
    console.log('📋 Response:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Error creando producto:');
    console.error('   - Status:', error.response?.status);
    console.error('   - Message:', error.response?.data?.message || error.message);
    console.error('   - Data:', error.response?.data);
    
    if (error.response?.status === 400) {
      console.error('❌ Error 400 - Bad Request:');
      console.error('   - Posibles causas:');
      console.error('     1. Validación de DTO fallida');
      console.error('     2. Datos faltantes o incorrectos');
      console.error('     3. Formato de datos incorrecto');
    }
  }
}

testProductCreation();





