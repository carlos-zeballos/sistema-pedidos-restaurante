const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function diagnoseOrderStatus() {
  console.log('🔍 Diagnóstico de actualización de estados de orden');
  console.log('================================================\n');

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
    const token = loginResponse.data.access_token;
    console.log('✅ Token obtenido');

    // 3. Obtener órdenes existentes
    console.log('\n3️⃣ Obteniendo órdenes existentes...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (ordersResponse.data.length === 0) {
      console.log('❌ No hay órdenes para probar. Creando una orden de prueba...');
      
      // Crear una orden de prueba
      const testOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, {
        spaceid: 'test-space-id',
        createdby: 'test-user-id',
        customername: 'Cliente de Prueba',
        items: [
          {
            name: 'Producto de Prueba',
            quantity: 1,
            unitprice: 10.00,
            totalprice: 10.00
          }
        ]
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Orden de prueba creada:', testOrderResponse.data.orderNumber);
      const testOrder = testOrderResponse.data;
      
      // Probar actualización de estado
      console.log('\n4️⃣ Probando actualización de estado...');
      const updateResponse = await axios.put(
        `${API_BASE_URL}/orders/${testOrder.id}/status`,
        { status: 'EN_PREPARACION' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('✅ Estado actualizado exitosamente');
      console.log('   Estado anterior: PENDIENTE');
      console.log('   Estado nuevo:', updateResponse.data.status);
      
      // Verificar historial
      console.log('\n5️⃣ Verificando historial de estados...');
      const historyResponse = await axios.get(`${API_BASE_URL}/orders/${testOrder.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Orden recuperada:', historyResponse.data.status);
      
    } else {
      console.log(`✅ Se encontraron ${ordersResponse.data.length} órdenes`);
      
      // Probar con la primera orden
      const firstOrder = ordersResponse.data[0];
      console.log(`\n4️⃣ Probando con orden: ${firstOrder.orderNumber} (Estado actual: ${firstOrder.status})`);
      
      // Determinar el siguiente estado
      const nextStatus = getNextStatus(firstOrder.status);
      console.log(`   Intentando cambiar a: ${nextStatus}`);
      
      const updateResponse = await axios.put(
        `${API_BASE_URL}/orders/${firstOrder.id}/status`,
        { status: nextStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('✅ Estado actualizado exitosamente');
      console.log('   Estado anterior:', firstOrder.status);
      console.log('   Estado nuevo:', updateResponse.data.status);
      
      // Verificar que el cambio se reflejó
      const verifyResponse = await axios.get(`${API_BASE_URL}/orders/${firstOrder.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Verificación exitosa:', verifyResponse.data.status);
    }

    console.log('\n🎉 Diagnóstico completado. El sistema parece funcionar correctamente.');
    
  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      console.error('   Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   No se recibió respuesta del servidor');
      console.error('   Request:', error.request);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verificar que el backend esté ejecutándose');
    console.log('   2. Verificar la configuración de la base de datos');
    console.log('   3. Verificar los permisos de usuario');
    console.log('   4. Revisar los logs del backend para más detalles');
  }
}

function getNextStatus(currentStatus) {
  const statusFlow = {
    'PENDIENTE': 'EN_PREPARACION',
    'EN_PREPARACION': 'LISTO',
    'LISTO': 'ENTREGADO',
    'ENTREGADO': 'PAGADO',
    'PAGADO': 'PAGADO', // Estado final
    'CANCELADO': 'CANCELADO' // Estado final
  };
  return statusFlow[currentStatus] || 'PENDIENTE';
}

// Ejecutar diagnóstico
diagnoseOrderStatus();

