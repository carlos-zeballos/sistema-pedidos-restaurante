const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testReportsEndpoints() {
  console.log('🧪 Probando endpoints de reportes...\n');

  try {
    // 1. Verificar salud del backend
    console.log('1️⃣ Verificando salud del backend...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend saludable:', healthResponse.data);

    // 2. Probar autenticación
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

    // 3. Probar endpoint de reportes de métodos de pago
    console.log('\n3️⃣ Probando reporte de métodos de pago...');
    try {
      const paymentsResponse = await axios.get(`${API_BASE_URL}/reports/payments`, {
        headers,
        params: {
          from: '2025-09-01',
          to: '2025-09-12'
        }
      });
      console.log('✅ Reporte de métodos de pago funciona');
      console.log('   Datos:', paymentsResponse.data.length, 'métodos');
      paymentsResponse.data.forEach(payment => {
        console.log(`   - ${payment.method}: ${payment.ordersCount} órdenes, $${payment.finalTotal}`);
      });
    } catch (error) {
      console.log('❌ Error en reporte de métodos de pago:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar endpoint de reportes de delivery
    console.log('\n4️⃣ Probando reporte de pagos de delivery...');
    try {
      const deliveryResponse = await axios.get(`${API_BASE_URL}/reports/delivery-payments`, {
        headers,
        params: {
          from: '2025-09-01',
          to: '2025-09-12'
        }
      });
      console.log('✅ Reporte de delivery funciona');
      console.log('   Datos:', deliveryResponse.data.length, 'métodos');
      deliveryResponse.data.forEach(delivery => {
        console.log(`   - ${delivery.method}: ${delivery.deliveryOrdersCount} órdenes delivery, $${delivery.totalPaid}`);
      });
    } catch (error) {
      console.log('❌ Error en reporte de delivery:', error.response?.status, error.response?.data?.message);
    }

    // 5. Probar endpoint de reportes de órdenes
    console.log('\n5️⃣ Probando reporte de órdenes...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/reports/orders`, {
        headers,
        params: {
          from: '2025-09-01',
          to: '2025-09-12',
          page: 1,
          limit: 10
        }
      });
      console.log('✅ Reporte de órdenes funciona');
      console.log('   Total órdenes:', ordersResponse.data.total);
      console.log('   Órdenes en página:', ordersResponse.data.orders.length);
      
      ordersResponse.data.orders.forEach(order => {
        console.log(`   - ${order.orderNumber}: ${order.status}, $${order.finalTotal}, ${order.spaceType}`);
      });
    } catch (error) {
      console.log('❌ Error en reporte de órdenes:', error.response?.status, error.response?.data?.message);
    }

    // 6. Probar endpoint de exportación
    console.log('\n6️⃣ Probando exportación de reportes...');
    try {
      const exportResponse = await axios.get(`${API_BASE_URL}/reports/export/orders`, {
        headers,
        params: {
          from: '2025-09-01',
          to: '2025-09-12'
        }
      });
      console.log('✅ Exportación funciona');
      console.log('   Archivo:', exportResponse.data.filename);
      console.log('   Tamaño CSV:', exportResponse.data.csv.length, 'caracteres');
    } catch (error) {
      console.log('❌ Error en exportación:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testReportsEndpoints();


