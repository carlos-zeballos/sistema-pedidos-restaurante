const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function debugKitchenAuth() {
  console.log('🔍 Debuggeando problema de autenticación en vista de cocina...\n');

  try {
    // 1. Simular el flujo completo del frontend
    console.log('1️⃣ Simulando login del frontend...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login exitoso');
    console.log('   Token:', token.substring(0, 50) + '...');
    console.log('   Usuario:', user.email, 'Rol:', user.role);

    // 2. Verificar que el token es válido
    console.log('\n2️⃣ Verificando token...');
    const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Token válido:', meResponse.data.email);

    // 3. Obtener órdenes de cocina (sin autenticación - como en el frontend)
    console.log('\n3️⃣ Probando obtener órdenes de cocina sin autenticación...');
    try {
      const kitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
      console.log('❌ ERROR: Se obtuvo acceso sin autenticación');
      console.log('   Esto significa que el endpoint no está protegido');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: Endpoint protegido, requiere autenticación');
      } else {
        console.log('❌ Error inesperado:', error.response?.status);
      }
    }

    // 4. Obtener órdenes de cocina con autenticación
    console.log('\n4️⃣ Probando obtener órdenes de cocina con autenticación...');
    const kitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Órdenes obtenidas:', kitchenResponse.data.length);

    // 5. Probar actualización de estado con diferentes formatos
    if (kitchenResponse.data.length > 0) {
      const order = kitchenResponse.data[0];
      console.log(`\n5️⃣ Probando actualización de estado para orden: ${order.ordernumber}`);

      // Probar con el formato que usa el frontend
      console.log('\n🔄 Probando formato del frontend...');
      const updateResponse = await axios.put(
        `${API_BASE_URL}/orders/${order.id}/status`,
        { status: 'EN_PREPARACION' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Actualización exitosa con formato frontend');
      console.log('   Nuevo estado:', updateResponse.data.status);

      // Probar con assignedto
      console.log('\n🔄 Probando con assignedto...');
      const updateResponse2 = await axios.put(
        `${API_BASE_URL}/orders/${order.id}/status`,
        { 
          status: 'LISTO',
          assignedto: user.id 
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Actualización exitosa con assignedto');
      console.log('   Nuevo estado:', updateResponse2.data.status);
      console.log('   Asignado a:', updateResponse2.data.assignedto);
    }

    // 6. Verificar roles del usuario
    console.log('\n6️⃣ Verificando roles del usuario...');
    console.log('   Usuario actual:', user.email);
    console.log('   Rol:', user.role);
    console.log('   Roles permitidos en updateOrderStatus: COCINERO, MOZO, ADMIN');
    
    if (['COCINERO', 'MOZO', 'ADMIN'].includes(user.role)) {
      console.log('✅ Usuario tiene permisos para actualizar órdenes');
    } else {
      console.log('❌ Usuario NO tiene permisos para actualizar órdenes');
    }

    console.log('\n🎉 Debug completado. El backend parece estar funcionando correctamente.');
    console.log('\n💡 Posibles problemas en el frontend:');
    console.log('   1. Token no se está enviando correctamente');
    console.log('   2. Token ha expirado');
    console.log('   3. Usuario no está autenticado');
    console.log('   4. Error en el interceptor de axios');

  } catch (error) {
    console.error('❌ Error en debug:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación');
    } else if (error.response?.status === 403) {
      console.log('🚫 Error de permisos - verificar roles');
    } else if (error.response?.status === 500) {
      console.log('💥 Error interno del servidor');
    }
  }
}

debugKitchenAuth();
