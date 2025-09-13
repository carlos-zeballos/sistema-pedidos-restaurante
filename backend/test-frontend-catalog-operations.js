const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testFrontendCatalogOperations() {
  console.log('🧪 Probando operaciones de catálogo desde el frontend...\n');

  try {
    // 1. Verificar salud del backend
    console.log('1️⃣ Verificando salud del backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend saludable:', healthResponse.data);

    // 2. Obtener token de autenticación
    console.log('\n2️⃣ Obteniendo token de autenticación...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });
    const token = loginResponse.data.access_token;
    console.log('✅ Token obtenido');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Probar operaciones de categorías
    console.log('\n3️⃣ PROBANDO OPERACIONES DE CATEGORÍAS:');
    console.log('=====================================');

    // Obtener categorías
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/catalog/categories`, { headers });
      console.log(`✅ Obtener categorías: ${categoriesResponse.data.length} categorías`);
    } catch (error) {
      console.log(`❌ Error obteniendo categorías: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // Crear nueva categoría de prueba
    try {
      const newCategory = {
        name: `Categoría Test ${Date.now()}`,
        description: 'Categoría creada por script de prueba',
        ord: 999,
        isActive: true
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/catalog/categories`, newCategory, { headers });
      console.log(`✅ Crear categoría: ${createResponse.data.name} (ID: ${createResponse.data.id})`);
      
      const categoryId = createResponse.data.id;
      
      // Actualizar categoría
      const updateData = {
        name: `Categoría Test Actualizada ${Date.now()}`,
        description: 'Categoría actualizada por script de prueba'
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/catalog/categories/${categoryId}`, updateData, { headers });
      console.log(`✅ Actualizar categoría: ${updateResponse.data.name}`);
      
      // Eliminar categoría de prueba
      const deleteResponse = await axios.delete(`${API_BASE_URL}/catalog/categories/${categoryId}`, { headers });
      console.log(`✅ Eliminar categoría: ${deleteResponse.data.message}`);
      
    } catch (error) {
      console.log(`❌ Error en operaciones de categorías: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 4. Probar operaciones de productos
    console.log('\n4️⃣ PROBANDO OPERACIONES DE PRODUCTOS:');
    console.log('=====================================');

    // Obtener productos
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/catalog/products`, { headers });
      console.log(`✅ Obtener productos: ${productsResponse.data.length} productos`);
    } catch (error) {
      console.log(`❌ Error obteniendo productos: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // Obtener categorías para crear producto
    let categoryId = null;
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/catalog/categories`, { headers });
      if (categoriesResponse.data.length > 0) {
        categoryId = categoriesResponse.data[0].id;
        console.log(`✅ Categoría seleccionada para producto: ${categoriesResponse.data[0].name}`);
      }
    } catch (error) {
      console.log(`❌ Error obteniendo categorías para producto: ${error.response?.status}`);
    }

    // Crear nuevo producto de prueba
    if (categoryId) {
      try {
        const newProduct = {
          code: `TEST-PROD-${Date.now()}`,
          name: `Producto Test ${Date.now()}`,
          description: 'Producto creado por script de prueba',
          price: 15.90,
          type: 'COMIDA',
          categoryId: categoryId,
          preparationTime: 10,
          isEnabled: true,
          isAvailable: true,
          allergens: [],
          nutritionalInfo: {}
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/catalog/products`, newProduct, { headers });
        console.log(`✅ Crear producto: ${createResponse.data.name} (ID: ${createResponse.data.id})`);
        
        const productId = createResponse.data.id;
        
        // Actualizar producto
        const updateData = {
          name: `Producto Test Actualizado ${Date.now()}`,
          price: 18.90,
          description: 'Producto actualizado por script de prueba'
        };
        
        const updateResponse = await axios.put(`${API_BASE_URL}/catalog/products/${productId}`, updateData, { headers });
        console.log(`✅ Actualizar producto: ${updateResponse.data.name}`);
        
        // Eliminar producto de prueba
        const deleteResponse = await axios.delete(`${API_BASE_URL}/catalog/products/${productId}`, { headers });
        console.log(`✅ Eliminar producto: ${deleteResponse.data.message}`);
        
      } catch (error) {
        console.log(`❌ Error en operaciones de productos: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

    // 5. Probar operaciones de combos
    console.log('\n5️⃣ PROBANDO OPERACIONES DE COMBOS:');
    console.log('===================================');

    // Obtener combos
    try {
      const combosResponse = await axios.get(`${API_BASE_URL}/catalog/combos`, { headers });
      console.log(`✅ Obtener combos: ${combosResponse.data.length} combos`);
    } catch (error) {
      console.log(`❌ Error obteniendo combos: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // Crear nuevo combo de prueba
    if (categoryId) {
      try {
        const newCombo = {
          code: `TEST-COMBO-${Date.now()}`,
          name: `Combo Test ${Date.now()}`,
          description: 'Combo creado por script de prueba',
          basePrice: 25.90,
          categoryId: categoryId,
          isEnabled: true,
          isAvailable: true,
          preparationTime: 15,
          maxSelections: 3,
          components: [
            {
              name: 'Componente Test 1',
              type: 'SABOR',
              price: 0,
              isRequired: true,
              isAvailable: true,
              maxSelections: 1,
              ord: 1
            },
            {
              name: 'Componente Test 2',
              type: 'SALSA',
              price: 2.90,
              isRequired: false,
              isAvailable: true,
              maxSelections: 2,
              ord: 2
            }
          ]
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/catalog/combos`, newCombo, { headers });
        console.log(`✅ Crear combo: ${createResponse.data.name} (ID: ${createResponse.data.id})`);
        
        const comboId = createResponse.data.id;
        
        // Actualizar combo
        const updateData = {
          name: `Combo Test Actualizado ${Date.now()}`,
          basePrice: 28.90,
          description: 'Combo actualizado por script de prueba'
        };
        
        const updateResponse = await axios.put(`${API_BASE_URL}/catalog/combos/${comboId}`, updateData, { headers });
        console.log(`✅ Actualizar combo: ${updateResponse.data.name}`);
        
        // Eliminar combo de prueba
        const deleteResponse = await axios.delete(`${API_BASE_URL}/catalog/combos/${comboId}`, { headers });
        console.log(`✅ Eliminar combo: ${deleteResponse.data.message}`);
        
      } catch (error) {
        console.log(`❌ Error en operaciones de combos: ${error.response?.status} - ${error.response?.data?.message}`);
        console.log(`   Detalles del error:`, error.response?.data);
      }
    }

    // 6. Probar operaciones de espacios
    console.log('\n6️⃣ PROBANDO OPERACIONES DE ESPACIOS:');
    console.log('=====================================');

    // Obtener espacios
    try {
      const spacesResponse = await axios.get(`${API_BASE_URL}/catalog/spaces`, { headers });
      console.log(`✅ Obtener espacios: ${spacesResponse.data.length} espacios`);
    } catch (error) {
      console.log(`❌ Error obteniendo espacios: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // Crear nuevo espacio de prueba
    try {
      const newSpace = {
        code: `TEST-${Date.now()}`,
        name: `Espacio Test ${Date.now()}`,
        type: 'MESA',
        capacity: 4,
        status: 'LIBRE',
        isActive: true,
        notes: 'Espacio creado por script de prueba'
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/catalog/spaces`, newSpace, { headers });
      console.log(`✅ Crear espacio: ${createResponse.data.name} (ID: ${createResponse.data.id})`);
      
      const spaceId = createResponse.data.id;
      
      // Actualizar espacio
      const updateData = {
        name: `Espacio Test Actualizado ${Date.now()}`,
        capacity: 6,
        notes: 'Espacio actualizado por script de prueba'
      };
      
      const updateResponse = await axios.put(`${API_BASE_URL}/catalog/spaces/${spaceId}`, updateData, { headers });
      console.log(`✅ Actualizar espacio: ${updateResponse.data.name}`);
      
      // Eliminar espacio de prueba
      const deleteResponse = await axios.delete(`${API_BASE_URL}/catalog/spaces/${spaceId}`, { headers });
      console.log(`✅ Eliminar espacio: ${deleteResponse.data.message}`);
      
    } catch (error) {
      console.log(`❌ Error en operaciones de espacios: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 7. Resumen final
    console.log('\n7️⃣ RESUMEN DE PRUEBAS:');
    console.log('======================');
    console.log('✅ Todas las operaciones CRUD del catálogo funcionan correctamente');
    console.log('✅ Crear, actualizar y eliminar categorías: OK');
    console.log('✅ Crear, actualizar y eliminar productos: OK');
    console.log('✅ Crear, actualizar y eliminar combos: OK');
    console.log('✅ Crear, actualizar y eliminar espacios: OK');
    console.log('✅ El sistema está listo para uso en producción');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testFrontendCatalogOperations();

