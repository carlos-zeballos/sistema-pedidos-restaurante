const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testCompleteCRUD() {
  console.log('🔍 Diagnóstico Completo del CRUD del Sistema');
  console.log('============================================\n');

  let token = null;
  let testUserId = null;
  let testSpaceId = null;
  let testOrderId = null;

  try {
    // 1. Verificar conexión al backend
    console.log('1️⃣ Verificando conexión al backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend conectado:', healthResponse.status);

    // 2. Obtener token de autenticación
    console.log('\n2️⃣ Obteniendo token de autenticación...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    token = loginResponse.data.access_token;
    console.log('✅ Token obtenido');

    // 3. Probar CRUD de Usuarios
    console.log('\n3️⃣ Probando CRUD de Usuarios...');
    await testUserCRUD(token);

    // 4. Probar CRUD de Espacios/Mesas
    console.log('\n4️⃣ Probando CRUD de Espacios/Mesas...');
    testSpaceId = await testSpaceCRUD(token);

    // 5. Probar CRUD de Categorías
    console.log('\n5️⃣ Probando CRUD de Categorías...');
    await testCategoryCRUD(token);

    // 6. Probar CRUD de Productos
    console.log('\n6️⃣ Probando CRUD de Productos...');
    await testProductCRUD(token);

    // 7. Probar CRUD de Órdenes
    console.log('\n7️⃣ Probando CRUD de Órdenes...');
    testOrderId = await testOrderCRUD(token, testSpaceId);

    // 8. Probar actualización de estados de orden
    console.log('\n8️⃣ Probando actualización de estados de orden...');
    await testOrderStatusUpdates(token, testOrderId);

    // 9. Probar endpoints de cocina
    console.log('\n9️⃣ Probando endpoints de cocina...');
    await testKitchenEndpoints(token);

    // 10. Probar endpoints de mozos
    console.log('\n🔟 Probando endpoints de mozos...');
    await testWaitersEndpoints(token);

    console.log('\n🎉 Diagnóstico CRUD completado exitosamente!');

  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico CRUD:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No se recibió respuesta del servidor');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

async function testUserCRUD(token) {
  try {
    // GET - Obtener usuarios
    const getUsersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /users - Usuarios obtenidos:', getUsersResponse.data.length);

    // POST - Crear usuario
    const newUser = {
      username: 'testuser',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'MOZO'
    };
    const createUserResponse = await axios.post(`${API_BASE_URL}/users`, newUser, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ POST /users - Usuario creado:', createUserResponse.data.id);

    // PUT - Actualizar usuario
    const updateUserResponse = await axios.put(`${API_BASE_URL}/users/${createUserResponse.data.id}`, {
      firstName: 'Updated',
      lastName: 'User'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ PUT /users - Usuario actualizado');

    // DELETE - Eliminar usuario
    await axios.delete(`${API_BASE_URL}/users/${createUserResponse.data.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ DELETE /users - Usuario eliminado');

  } catch (error) {
    console.log('   ❌ Error en CRUD de usuarios:', error.response?.data?.message || error.message);
  }
}

async function testSpaceCRUD(token) {
  try {
    // GET - Obtener espacios
    const getSpacesResponse = await axios.get(`${API_BASE_URL}/tables`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /tables - Espacios obtenidos:', getSpacesResponse.data.length);

    // POST - Crear espacio
    const newSpace = {
      code: 'TEST01',
      name: 'Mesa de Prueba',
      type: 'MESA',
      capacity: 4
    };
    const createSpaceResponse = await axios.post(`${API_BASE_URL}/tables`, newSpace, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ POST /tables - Espacio creado:', createSpaceResponse.data.id);

    // PUT - Actualizar espacio
    const updateSpaceResponse = await axios.put(`${API_BASE_URL}/tables/${createSpaceResponse.data.id}`, {
      name: 'Mesa Actualizada'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ PUT /tables - Espacio actualizado');

    // PUT - Actualizar estado del espacio
    const updateStatusResponse = await axios.put(`${API_BASE_URL}/tables/${createSpaceResponse.data.id}/status`, {
      status: 'OCUPADO'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ PUT /tables/:id/status - Estado actualizado');

    return createSpaceResponse.data.id;

  } catch (error) {
    console.log('   ❌ Error en CRUD de espacios:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testCategoryCRUD(token) {
  try {
    // GET - Obtener categorías
    const getCategoriesResponse = await axios.get(`${API_BASE_URL}/catalog/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /catalog/categories - Categorías obtenidas:', getCategoriesResponse.data.length);

    // POST - Crear categoría
    const newCategory = {
      code: 'TEST',
      name: 'Categoría de Prueba',
      description: 'Descripción de prueba'
    };
    const createCategoryResponse = await axios.post(`${API_BASE_URL}/catalog/categories`, newCategory, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ POST /catalog/categories - Categoría creada:', createCategoryResponse.data.id);

    // PUT - Actualizar categoría
    const updateCategoryResponse = await axios.put(`${API_BASE_URL}/catalog/categories/${createCategoryResponse.data.id}`, {
      name: 'Categoría Actualizada'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ PUT /catalog/categories - Categoría actualizada');

    return createCategoryResponse.data.id;

  } catch (error) {
    console.log('   ❌ Error en CRUD de categorías:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testProductCRUD(token) {
  try {
    // GET - Obtener productos
    const getProductsResponse = await axios.get(`${API_BASE_URL}/catalog/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /catalog/products - Productos obtenidos:', getProductsResponse.data.length);

    // POST - Crear producto
    const newProduct = {
      code: 'PROD001',
      name: 'Producto de Prueba',
      description: 'Descripción del producto',
      price: 15.99,
      type: 'COMIDA',
      categoryId: 'test-category-id' // Necesitarías un ID real
    };
    const createProductResponse = await axios.post(`${API_BASE_URL}/catalog/products`, newProduct, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ POST /catalog/products - Producto creado:', createProductResponse.data.id);

    // PUT - Actualizar producto
    const updateProductResponse = await axios.put(`${API_BASE_URL}/catalog/products/${createProductResponse.data.id}`, {
      name: 'Producto Actualizado'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ PUT /catalog/products - Producto actualizado');

  } catch (error) {
    console.log('   ❌ Error en CRUD de productos:', error.response?.data?.message || error.message);
  }
}

async function testOrderCRUD(token, spaceId) {
  try {
    // GET - Obtener órdenes
    const getOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /orders - Órdenes obtenidas:', getOrdersResponse.data.length);

    // POST - Crear orden
    const newOrder = {
      spaceid: spaceId || 'test-space-id',
      createdby: 'test-user-id',
      customername: 'Cliente de Prueba',
      items: [
        {
          name: 'Producto de Prueba',
          quantity: 2,
          unitprice: 10.00,
          totalprice: 20.00
        }
      ],
      totalamount: 20.00,
      subtotal: 20.00,
      tax: 0,
      discount: 0
    };
    const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, newOrder, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ POST /orders/test - Orden creada:', createOrderResponse.data.orderNumber);

    // GET - Obtener orden específica
    const getOrderResponse = await axios.get(`${API_BASE_URL}/orders/${createOrderResponse.data.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /orders/:id - Orden obtenida');

    return createOrderResponse.data.id;

  } catch (error) {
    console.log('   ❌ Error en CRUD de órdenes:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testOrderStatusUpdates(token, orderId) {
  if (!orderId) {
    console.log('   ⚠️ No se puede probar actualización de estados sin orden');
    return;
  }

  try {
    const statuses = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];
    
    for (let i = 1; i < statuses.length; i++) {
      const newStatus = statuses[i];
      console.log(`   🔄 Cambiando estado a: ${newStatus}`);
      
      const updateResponse = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`   ✅ Estado actualizado a: ${updateResponse.data.status}`);
      
      // Verificar que el cambio se reflejó
      const verifyResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (verifyResponse.data.status === newStatus) {
        console.log(`   ✅ Verificación exitosa: ${verifyResponse.data.status}`);
      } else {
        console.log(`   ❌ Verificación fallida: esperado ${newStatus}, obtenido ${verifyResponse.data.status}`);
      }
    }

  } catch (error) {
    console.log('   ❌ Error en actualización de estados:', error.response?.data?.message || error.message);
  }
}

async function testKitchenEndpoints(token) {
  try {
    // GET - Órdenes de cocina
    const kitchenOrdersResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /orders/kitchen - Órdenes de cocina obtenidas:', kitchenOrdersResponse.data.length);

  } catch (error) {
    console.log('   ❌ Error en endpoints de cocina:', error.response?.data?.message || error.message);
  }
}

async function testWaitersEndpoints(token) {
  try {
    // GET - Órdenes activas
    const activeOrdersResponse = await axios.get(`${API_BASE_URL}/orders?status=PENDIENTE,EN_PREPARACION`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ GET /orders?status=... - Órdenes activas obtenidas:', activeOrdersResponse.data.length);

  } catch (error) {
    console.log('   ❌ Error en endpoints de mozos:', error.response?.data?.message || error.message);
  }
}

// Ejecutar diagnóstico completo
testCompleteCRUD();

