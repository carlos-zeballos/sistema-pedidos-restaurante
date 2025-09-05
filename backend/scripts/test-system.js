#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;
let currentUser = null;

async function testSystem() {
  console.log('🧪 Iniciando pruebas del sistema...\n');

  try {
    // 1. Probar conexión al servidor
    console.log('1️⃣ Probando conexión al servidor...');
    await api.get('/health');
    console.log('✅ Servidor respondiendo correctamente\n');

    // 2. Probar autenticación
    console.log('2️⃣ Probando autenticación...');
    const loginResponse = await api.post('/auth/login', {
      username: 'waiter',
      password: '123456'
    });
    
    authToken = loginResponse.data.access_token;
    currentUser = loginResponse.data.user;
    
    // Configurar token para siguientes requests
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    console.log(`✅ Autenticación exitosa - Usuario: ${currentUser.name}\n`);

    // 3. Probar obtención de mesas
    console.log('3️⃣ Probando obtención de mesas...');
    const tablesResponse = await api.get('/tables');
    console.log(`✅ ${tablesResponse.data.length} mesas obtenidas\n`);

    // 4. Probar obtención de categorías
    console.log('4️⃣ Probando obtención de categorías...');
    const categoriesResponse = await api.get('/catalog/categories');
    console.log(`✅ ${categoriesResponse.data.length} categorías obtenidas\n`);

    // 5. Probar obtención de productos
    console.log('5️⃣ Probando obtención de productos...');
    const productsResponse = await api.get('/catalog/products');
    console.log(`✅ ${productsResponse.data.length} productos obtenidos\n`);

    // 6. Probar creación de orden
    console.log('6️⃣ Probando creación de orden...');
    const orderData = {
      tableId: 1,
      waiterId: currentUser.id,
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 12.99
        },
        {
          productId: 6,
          quantity: 1,
          price: 3.99
        }
      ],
      total: 29.97,
      notes: 'Orden de prueba del sistema'
    };

    const orderResponse = await api.post('/orders', orderData);
    console.log(`✅ Orden creada exitosamente - ID: ${orderResponse.data.id}\n`);

    // 7. Probar obtención de órdenes
    console.log('7️⃣ Probando obtención de órdenes...');
    const ordersResponse = await api.get('/orders');
    console.log(`✅ ${ordersResponse.data.length} órdenes obtenidas\n`);

    // 8. Probar actualización de estado de orden
    console.log('8️⃣ Probando actualización de estado de orden...');
    await api.put(`/orders/${orderResponse.data.id}/status`, { status: 'PREPARING' });
    console.log('✅ Estado de orden actualizado a PREPARING\n');

    // 9. Probar vista de cocina
    console.log('9️⃣ Probando vista de cocina...');
    const kitchenResponse = await api.get('/orders/kitchen');
    console.log(`✅ ${kitchenResponse.data.length} órdenes en cocina\n`);

    // 10. Probar finalización de orden
    console.log('🔟 Probando finalización de orden...');
    await api.put(`/orders/${orderResponse.data.id}/status`, { status: 'READY' });
    await api.put(`/orders/${orderResponse.data.id}/status`, { status: 'DELIVERED' });
    console.log('✅ Orden completada exitosamente\n');

    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('🚀 El sistema está funcionando correctamente');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Conexión al servidor');
    console.log('   ✅ Autenticación JWT');
    console.log('   ✅ Gestión de mesas');
    console.log('   ✅ Catálogo de productos');
    console.log('   ✅ Creación de órdenes');
    console.log('   ✅ Gestión de estados');
    console.log('   ✅ Vista de cocina');
    console.log('   ✅ Finalización de órdenes');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Asegúrate de que el servidor esté corriendo (npm run start:dev)');
    console.log('   2. Verifica que la base de datos esté configurada correctamente');
    console.log('   3. Ejecuta npm run db:seed para poblar datos de prueba');
    console.log('   4. Revisa los logs del servidor para más detalles');
  }
}

// Ejecutar pruebas
testSystem();
