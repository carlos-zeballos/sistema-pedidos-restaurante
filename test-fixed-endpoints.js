const axios = require('axios');

const BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

// Función para probar endpoints con manejo de errores mejorado
async function testEndpoint(name, url, method = 'GET', data = null) {
  console.log(`\n🧪 Probando: ${name}`);
  console.log(`📍 URL: ${method} ${url}`);
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    console.log(`✅ ÉXITO - Status: ${response.status}`);
    console.log(`📊 Respuesta:`, JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ ERROR - Status: ${error.response?.status || 'No response'}`);
    console.log(`💥 Mensaje: ${error.message}`);
    
    if (error.response) {
      console.log(`📋 Datos de error:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return {
      success: false,
      status: error.response?.status,
      error: error.message,
      data: error.response?.data
    };
  }
}

// Función principal para probar endpoints corregidos
async function testFixedEndpoints() {
  console.log('🚀 PROBANDO ENDPOINTS CORREGIDOS');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // 1. Pruebas de diagnóstico mejoradas
  console.log('\n📋 FASE 1: DIAGNÓSTICO MEJORADO');
  console.log('-'.repeat(50));
  
  results.databaseCheck = await testEndpoint('Database Check', '/orders/test/database-check');
  results.simpleOrders = await testEndpoint('Simple Orders', '/orders/test/simple');
  results.healthCheck = await testEndpoint('Health Check', '/orders/test/health');
  results.corsTest = await testEndpoint('CORS Test', '/orders/test/cors');
  
  // 2. Pruebas de endpoints principales corregidos
  console.log('\n📋 FASE 2: ENDPOINTS PRINCIPALES CORREGIDOS');
  console.log('-'.repeat(50));
  
  results.getOrders = await testEndpoint('Get All Orders', '/orders');
  results.getOrdersPending = await testEndpoint('Get Orders Pending', '/orders?status=PENDIENTE');
  results.getOrdersMultiple = await testEndpoint('Get Orders Multiple Status', '/orders?status=PENDIENTE,EN_PREPARACION');
  
  // 3. Pruebas de creación de órdenes
  console.log('\n📋 FASE 3: CREACIÓN DE ÓRDENES');
  console.log('-'.repeat(50));
  
  const testOrderData = {
    spaceId: '550e8400-e29b-41d4-a716-446655440000',
    createdBy: '550e8400-e29b-41d4-a716-446655440001',
    customerName: 'Cliente de Prueba',
    customerPhone: '+1234567890',
    items: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Producto de Prueba',
        unitPrice: 10.50,
        totalPrice: 10.50,
        quantity: 1,
        notes: 'Notas de prueba'
      }
    ],
    notes: 'Orden de prueba',
    totalAmount: 10.50,
    subtotal: 10.00,
    tax: 0.50,
    discount: 0,
    deliveryCost: 0,
    isDelivery: false
  };
  
  results.createOrderTest = await testEndpoint('Create Order Test', '/orders/test', 'POST', testOrderData);
  
  const mockData = {
    spaceid: 'test-space-mock',
    createdby: 'test-user-mock',
    customername: 'Cliente Mock',
    items: [
      {
        productId: 'mock-product',
        name: 'Producto Mock',
        unitPrice: 15.00,
        totalPrice: 15.00,
        quantity: 1
      }
    ],
    totalamount: 15.00
  };
  
  results.createOrderMock = await testEndpoint('Create Order Mock', '/orders/mock', 'POST', mockData);
  
  // 4. Pruebas con datos reales si tenemos una orden creada
  if (results.createOrderMock.success && results.createOrderMock.data?.id) {
    const orderId = results.createOrderMock.data.id;
    console.log(`\n📋 FASE 4: PRUEBAS CON ORDEN REAL (ID: ${orderId})`);
    console.log('-'.repeat(50));
    
    results.getOrderById = await testEndpoint('Get Order by ID', `/orders/${orderId}`);
    results.getOrdersBySpace = await testEndpoint('Get Orders by Space', `/orders/space/test-space-mock`);
    
    // Probar agregar items
    const addItemsData = {
      items: [
        {
          productId: 'additional-product',
          name: 'Producto Adicional',
          unitPrice: 8.00,
          totalPrice: 16.00,
          quantity: 2,
          notes: 'Items adicionales'
        }
      ]
    };
    
    results.addItemsTest = await testEndpoint('Add Items Test', `/orders/test/${orderId}/items`, 'POST', addItemsData);
    
    // Probar actualizar estado
    const statusData = {
      status: 'EN_PREPARACION',
      assignedTo: 'test-cook'
    };
    
    results.updateStatusTest = await testEndpoint('Update Status Test', `/orders/test/${orderId}/status`, 'PUT', statusData);
  }
  
  // Resumen de resultados
  console.log('\n📊 RESUMEN DE RESULTADOS');
  console.log('=' .repeat(60));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Exitosos: ${successful}/${total}`);
  console.log(`❌ Fallidos: ${total - successful}/${total}`);
  
  // Detalles de errores
  const failed = Object.entries(results).filter(([name, result]) => !result.success);
  if (failed.length > 0) {
    console.log('\n🔍 DETALLES DE ERRORES:');
    console.log('-'.repeat(50));
    failed.forEach(([name, result]) => {
      console.log(`❌ ${name}: ${result.error}`);
      if (result.status) {
        console.log(`   Status: ${result.status}`);
      }
    });
  }
  
  // Recomendaciones finales
  console.log('\n💡 RECOMENDACIONES FINALES:');
  console.log('-'.repeat(50));
  
  if (results.databaseCheck.success) {
    console.log('✅ Diagnóstico de base de datos funciona');
  } else {
    console.log('❌ Problemas en diagnóstico de base de datos');
  }
  
  if (results.simpleOrders.success) {
    console.log('✅ Consulta simplificada de órdenes funciona');
  } else {
    console.log('❌ Problemas en consulta simplificada');
  }
  
  if (results.getOrders.success) {
    console.log('✅ Endpoint principal de órdenes funciona');
  } else {
    console.log('❌ Problemas en endpoint principal');
  }
  
  if (results.createOrderMock.success) {
    console.log('✅ Creación de órdenes mock funciona');
  } else {
    console.log('❌ Problemas en creación de órdenes');
  }
  
  console.log('\n🎯 PRUEBAS COMPLETADAS');
  console.log('=' .repeat(60));
  
  return results;
}

// Ejecutar las pruebas
testFixedEndpoints().catch(console.error);


