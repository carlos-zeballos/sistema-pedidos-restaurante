const axios = require('axios');

// Configuración
const BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';
const ENDPOINTS = {
  // Endpoints básicos
  health: '/orders/test/health',
  cors: '/orders/test/cors',
  
  // Endpoints principales
  getOrders: '/orders',
  getOrdersWithStatus: '/orders?status=PENDIENTE',
  getOrdersMultipleStatus: '/orders?status=PENDIENTE,EN_PREPARACION',
  
  // Endpoints de prueba (sin autenticación)
  createOrderTest: '/orders/test',
  createOrderMock: '/orders/mock',
  diagnoseRpc: '/orders/test/diagnose',
  
  // Endpoints específicos (requieren IDs válidos)
  getOrderById: '/orders/test-order-id',
  getOrdersBySpace: '/orders/space/test-space-id',
  
  // Endpoints de items (requieren IDs válidos)
  addItemsTest: '/orders/test-order-id/items',
  updateOrderStatusTest: '/orders/test-order-id/status',
};

// Función para hacer peticiones con manejo de errores
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
      timeout: 10000
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

// Datos de prueba para crear órdenes
const testOrderData = {
  spaceId: 'test-space-123',
  createdBy: 'test-user',
  customerName: 'Cliente de Prueba',
  customerPhone: '+1234567890',
  items: [
    {
      productId: 'test-product-1',
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

const testMockData = {
  spaceid: 'test-space-456',
  createdby: 'test-user-mock',
  customername: 'Cliente Mock',
  customerphone: '+0987654321',
  items: [
    {
      productId: 'mock-product-1',
      name: 'Producto Mock',
      unitPrice: 15.00,
      totalPrice: 15.00,
      quantity: 1
    }
  ],
  notes: 'Orden mock',
  totalamount: 15.00,
  subtotal: 14.00,
  tax: 1.00,
  discount: 0
};

const testItemsData = {
  items: [
    {
      productId: 'test-product-2',
      name: 'Producto Adicional',
      unitPrice: 8.00,
      totalPrice: 16.00,
      quantity: 2,
      notes: 'Items adicionales'
    }
  ]
};

const testStatusData = {
  status: 'EN_PREPARACION',
  assignedTo: 'test-cook'
};

// Función principal para ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 INICIANDO PRUEBAS COMPLETAS DE ENDPOINTS DE ORDERS');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // 1. Pruebas de salud y conectividad
  console.log('\n📋 FASE 1: PRUEBAS DE SALUD Y CONECTIVIDAD');
  console.log('-'.repeat(50));
  
  results.health = await testEndpoint('Health Check', ENDPOINTS.health);
  results.cors = await testEndpoint('CORS Test', ENDPOINTS.cors);
  
  // 2. Pruebas de endpoints básicos
  console.log('\n📋 FASE 2: ENDPOINTS BÁSICOS');
  console.log('-'.repeat(50));
  
  results.getOrders = await testEndpoint('Get All Orders', ENDPOINTS.getOrders);
  results.getOrdersWithStatus = await testEndpoint('Get Orders with Status', ENDPOINTS.getOrdersWithStatus);
  results.getOrdersMultipleStatus = await testEndpoint('Get Orders Multiple Status', ENDPOINTS.getOrdersMultipleStatus);
  
  // 3. Pruebas de creación de órdenes
  console.log('\n📋 FASE 3: CREACIÓN DE ÓRDENES');
  console.log('-'.repeat(50));
  
  results.createOrderTest = await testEndpoint('Create Order Test', ENDPOINTS.createOrderTest, 'POST', testOrderData);
  results.createOrderMock = await testEndpoint('Create Order Mock', ENDPOINTS.createOrderMock, 'POST', testMockData);
  results.diagnoseRpc = await testEndpoint('Diagnose RPC', ENDPOINTS.diagnoseRpc, 'POST', testOrderData);
  
  // 4. Pruebas de endpoints que requieren IDs válidos
  console.log('\n📋 FASE 4: ENDPOINTS CON IDs ESPECÍFICOS');
  console.log('-'.repeat(50));
  
  results.getOrderById = await testEndpoint('Get Order by ID (Test)', ENDPOINTS.getOrderById);
  results.getOrdersBySpace = await testEndpoint('Get Orders by Space (Test)', ENDPOINTS.getOrdersBySpace);
  
  // 5. Pruebas de gestión de items
  console.log('\n📋 FASE 5: GESTIÓN DE ITEMS');
  console.log('-'.repeat(50));
  
  results.addItemsTest = await testEndpoint('Add Items Test', ENDPOINTS.addItemsTest, 'POST', testItemsData);
  results.updateOrderStatusTest = await testEndpoint('Update Order Status Test', ENDPOINTS.updateOrderStatusTest, 'PUT', testStatusData);
  
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
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  console.log('-'.repeat(50));
  
  if (results.health.success) {
    console.log('✅ Backend está funcionando correctamente');
  } else {
    console.log('❌ Backend tiene problemas de conectividad');
  }
  
  if (results.cors.success) {
    console.log('✅ CORS está configurado correctamente');
  } else {
    console.log('❌ Problemas de CORS detectados');
  }
  
  if (results.createOrderTest.success || results.createOrderMock.success) {
    console.log('✅ Creación de órdenes funciona');
  } else {
    console.log('❌ Problemas en creación de órdenes');
  }
  
  console.log('\n🎯 PRUEBAS COMPLETADAS');
  console.log('=' .repeat(60));
  
  return results;
}

// Ejecutar las pruebas
runAllTests().catch(console.error);


