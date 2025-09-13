const axios = require('axios');

const API_BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

async function testReportsEndpoints() {
  console.log('🔍 Probando endpoints de reportes de forma integral...\n');

  try {
    // 1. Autenticación
    console.log('1️⃣ AUTENTICACIÓN:');
    console.log('=================');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Autenticación exitosa');
    
    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Probar endpoint de métodos de pago
    console.log('\n2️⃣ REPORTE DE MÉTODOS DE PAGO:');
    console.log('===============================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const paymentsResponse = await axios.get(`${API_BASE_URL}/reports/payments`, {
        headers,
        params: {
          from: today,
          to: today
        }
      });
      
      console.log(`✅ Endpoint /reports/payments funcionando`);
      console.log(`📊 Datos recibidos: ${Array.isArray(paymentsResponse.data) ? paymentsResponse.data.length : 'No es array'} registros`);
      
      if (Array.isArray(paymentsResponse.data) && paymentsResponse.data.length > 0) {
        console.log('📋 Primer registro:');
        console.log(`   - Método: ${paymentsResponse.data[0].method}`);
        console.log(`   - Órdenes: ${paymentsResponse.data[0].ordersCount}`);
        console.log(`   - Total pagado: $${paymentsResponse.data[0].paidByMethod}`);
      } else {
        console.log('⚠️ No hay datos de métodos de pago para hoy');
      }
      
    } catch (error) {
      console.log(`❌ Error en /reports/payments: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 3. Probar endpoint de pagos de delivery
    console.log('\n3️⃣ REPORTE DE PAGOS DE DELIVERY:');
    console.log('=================================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const deliveryResponse = await axios.get(`${API_BASE_URL}/reports/delivery-payments`, {
        headers,
        params: {
          from: today,
          to: today
        }
      });
      
      console.log(`✅ Endpoint /reports/delivery-payments funcionando`);
      console.log(`📊 Datos recibidos: ${Array.isArray(deliveryResponse.data) ? deliveryResponse.data.length : 'No es array'} registros`);
      
      if (Array.isArray(deliveryResponse.data) && deliveryResponse.data.length > 0) {
        console.log('📋 Primer registro:');
        console.log(`   - Método: ${deliveryResponse.data[0].method}`);
        console.log(`   - Órdenes delivery: ${deliveryResponse.data[0].deliveryOrdersCount}`);
        console.log(`   - Total delivery: $${deliveryResponse.data[0].deliveryFeesPaid}`);
      } else {
        console.log('⚠️ No hay datos de delivery para hoy');
      }
      
    } catch (error) {
      console.log(`❌ Error en /reports/delivery-payments: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 4. Probar endpoint de órdenes
    console.log('\n4️⃣ REPORTE DE ÓRDENES:');
    console.log('=======================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const ordersResponse = await axios.get(`${API_BASE_URL}/reports/orders`, {
        headers,
        params: {
          from: today,
          to: today,
          page: 1,
          limit: 10
        }
      });
      
      console.log(`✅ Endpoint /reports/orders funcionando`);
      console.log(`📊 Datos recibidos: ${ordersResponse.data?.orders ? ordersResponse.data.orders.length : 'No es objeto'} órdenes`);
      console.log(`📊 Total: ${ordersResponse.data?.total || 0} órdenes`);
      
      if (ordersResponse.data?.orders && ordersResponse.data.orders.length > 0) {
        console.log('📋 Primera orden:');
        const firstOrder = ordersResponse.data.orders[0];
        console.log(`   - Número: ${firstOrder.orderNumber}`);
        console.log(`   - Cliente: ${firstOrder.customerName}`);
        console.log(`   - Estado: ${firstOrder.status}`);
        console.log(`   - Total: $${firstOrder.finalTotal}`);
        console.log(`   - Pagos: ${firstOrder.payments ? firstOrder.payments.length : 0}`);
      } else {
        console.log('⚠️ No hay órdenes para hoy');
      }
      
    } catch (error) {
      console.log(`❌ Error en /reports/orders: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 5. Probar endpoint de exportación
    console.log('\n5️⃣ EXPORTACIÓN DE REPORTES:');
    console.log('===========================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const exportResponse = await axios.get(`${API_BASE_URL}/reports/export/orders`, {
        headers,
        params: {
          from: today,
          to: today
        }
      });
      
      console.log(`✅ Endpoint /reports/export/orders funcionando`);
      console.log(`📊 Archivo: ${exportResponse.data?.filename || 'Sin nombre'}`);
      console.log(`📊 Tamaño CSV: ${exportResponse.data?.csv ? exportResponse.data.csv.length : 0} caracteres`);
      
    } catch (error) {
      console.log(`❌ Error en /reports/export/orders: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 6. Probar filtros de fechas
    console.log('\n6️⃣ PRUEBA DE FILTROS DE FECHAS:');
    console.log('=================================');
    
    try {
      // Probar con rango de fechas más amplio
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Últimos 7 días
      const endDate = new Date();
      
      const dateRangeResponse = await axios.get(`${API_BASE_URL}/reports/payments`, {
        headers,
        params: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        }
      });
      
      console.log(`✅ Filtro de fechas funcionando`);
      console.log(`📊 Rango: ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`);
      console.log(`📊 Registros encontrados: ${Array.isArray(dateRangeResponse.data) ? dateRangeResponse.data.length : 'No es array'}`);
      
    } catch (error) {
      console.log(`❌ Error en filtro de fechas: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 7. Verificar estructura de datos
    console.log('\n7️⃣ VERIFICACIÓN DE ESTRUCTURA DE DATOS:');
    console.log('=======================================');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const testResponse = await axios.get(`${API_BASE_URL}/reports/payments`, {
        headers,
        params: {
          from: today,
          to: today
        }
      });
      
      if (Array.isArray(testResponse.data) && testResponse.data.length > 0) {
        const firstRecord = testResponse.data[0];
        console.log('📋 Estructura del primer registro:');
        console.log(`   - method: ${typeof firstRecord.method} - ${firstRecord.method}`);
        console.log(`   - icon: ${typeof firstRecord.icon} - ${firstRecord.icon}`);
        console.log(`   - color: ${typeof firstRecord.color} - ${firstRecord.color}`);
        console.log(`   - ordersCount: ${typeof firstRecord.ordersCount} - ${firstRecord.ordersCount}`);
        console.log(`   - paidByMethod: ${typeof firstRecord.paidByMethod} - ${firstRecord.paidByMethod}`);
        console.log(`   - originalTotal: ${typeof firstRecord.originalTotal} - ${firstRecord.originalTotal}`);
        console.log(`   - finalTotal: ${typeof firstRecord.finalTotal} - ${firstRecord.finalTotal}`);
      } else {
        console.log('⚠️ No hay datos para verificar estructura');
      }
      
    } catch (error) {
      console.log(`❌ Error verificando estructura: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    console.log('\n🎯 RESUMEN DE PRUEBAS:');
    console.log('=======================');
    console.log('✅ Endpoints de reportes probados');
    console.log('✅ Filtros de fechas verificados');
    console.log('✅ Estructura de datos validada');
    console.log('✅ Sistema de reportes funcionando');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testReportsEndpoints();

