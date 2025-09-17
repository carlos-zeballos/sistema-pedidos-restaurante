const axios = require('axios');

const BASE_URL = 'https://sistema-pedidos-restaurante.onrender.com';

// Función para obtener IDs válidos de la base de datos
async function getValidIds() {
  console.log('🔍 Obteniendo IDs válidos de la base de datos...');
  
  try {
    // Probar endpoint de diagnóstico que nos puede dar información
    const diagResponse = await axios.get(`${BASE_URL}/diag`);
    console.log('📊 Diagnóstico de base de datos:', JSON.stringify(diagResponse.data, null, 2));
    
    // Intentar obtener espacios válidos
    try {
      const spacesResponse = await axios.get(`${BASE_URL}/tables`);
      console.log('🏢 Espacios disponibles:', JSON.stringify(spacesResponse.data, null, 2));
    } catch (error) {
      console.log('❌ No se pudieron obtener espacios:', error.message);
    }
    
    // Intentar obtener usuarios válidos
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`);
      console.log('👥 Usuarios disponibles:', JSON.stringify(usersResponse.data, null, 2));
    } catch (error) {
      console.log('❌ No se pudieron obtener usuarios:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Error obteniendo IDs válidos:', error.message);
  }
}

// Función para probar con datos reales
async function testWithRealData() {
  console.log('\n🧪 Probando con datos reales...');
  
  // Datos con UUIDs válidos (formato UUID v4)
  const realOrderData = {
    spaceId: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
    createdBy: '550e8400-e29b-41d4-a716-446655440001', // UUID válido
    customerName: 'Cliente Real',
    customerPhone: '+1234567890',
    items: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440002', // UUID válido
        name: 'Producto Real',
        unitPrice: 10.50,
        totalPrice: 10.50,
        quantity: 1,
        notes: 'Notas reales'
      }
    ],
    notes: 'Orden real',
    totalAmount: 10.50,
    subtotal: 10.00,
    tax: 0.50,
    discount: 0,
    deliveryCost: 0,
    isDelivery: false
  };
  
  try {
    console.log('📝 Creando orden con datos reales...');
    const response = await axios.post(`${BASE_URL}/orders/test`, realOrderData);
    console.log('✅ Orden creada exitosamente:', JSON.stringify(response.data, null, 2));
    
    // Si la orden se creó, probar otros endpoints con el ID real
    if (response.data && response.data.id) {
      const orderId = response.data.id;
      console.log(`\n🔍 Probando endpoints con ID real: ${orderId}`);
      
      // Probar obtener orden por ID
      try {
        const getOrderResponse = await axios.get(`${BASE_URL}/orders/${orderId}`);
        console.log('✅ Orden obtenida por ID:', JSON.stringify(getOrderResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error obteniendo orden por ID:', error.message);
      }
      
      // Probar agregar items
      try {
        const addItemsData = {
          items: [
            {
              productId: '550e8400-e29b-41d4-a716-446655440003',
              name: 'Item Adicional',
              unitPrice: 5.00,
              totalPrice: 10.00,
              quantity: 2,
              notes: 'Items adicionales'
            }
          ]
        };
        
        const addItemsResponse = await axios.post(`${BASE_URL}/orders/test/${orderId}/items`, addItemsData);
        console.log('✅ Items agregados:', JSON.stringify(addItemsResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error agregando items:', error.message);
      }
      
      // Probar actualizar estado
      try {
        const statusData = {
          status: 'EN_PREPARACION',
          assignedTo: 'test-cook'
        };
        
        const statusResponse = await axios.put(`${BASE_URL}/orders/test/${orderId}/status`, statusData);
        console.log('✅ Estado actualizado:', JSON.stringify(statusResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Error actualizando estado:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Error creando orden con datos reales:', error.message);
    if (error.response) {
      console.log('📋 Datos de error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Función para probar endpoints de diagnóstico específicos
async function testDiagnosticEndpoints() {
  console.log('\n🔬 Probando endpoints de diagnóstico específicos...');
  
  try {
    // Probar endpoint de salud específico
    const healthResponse = await axios.get(`${BASE_URL}/orders/test/health`);
    console.log('🏥 Health check:', JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Error en health check:', error.message);
  }
  
  try {
    // Probar endpoint CORS
    const corsResponse = await axios.get(`${BASE_URL}/orders/test/cors`);
    console.log('🌐 CORS test:', JSON.stringify(corsResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Error en CORS test:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 DIAGNÓSTICO COMPLETO DEL SISTEMA DE ORDERS');
  console.log('=' .repeat(60));
  
  await getValidIds();
  await testDiagnosticEndpoints();
  await testWithRealData();
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  console.log('=' .repeat(60));
}

main().catch(console.error);
