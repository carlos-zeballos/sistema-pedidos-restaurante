require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function comprehensiveSystemTest() {
  console.log('🧪 PRUEBAS COMPLETAS DEL SISTEMA\n');
  console.log('=' .repeat(50));

  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function addTest(name, passed, details = '') {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${name}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}`);
    }
    if (details) console.log(`   ${details}`);
    testResults.details.push({ name, passed, details });
  }

  try {
    // TEST 1: Verificar estado inicial del sistema
    console.log('\n1️⃣ VERIFICANDO ESTADO INICIAL DEL SISTEMA');
    console.log('-'.repeat(40));
    
    // 1.1 Verificar espacios
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*');
    
    if (spacesError) {
      addTest('Verificar espacios', false, spacesError.message);
    } else {
      const freeSpaces = spaces.filter(s => s.status === 'LIBRE');
      const occupiedSpaces = spaces.filter(s => s.status === 'OCUPADA');
      addTest('Verificar espacios', true, `${spaces.length} total, ${freeSpaces.length} libres, ${occupiedSpaces.length} ocupadas`);
    }
    
    // 1.2 Verificar órdenes activas
    const { data: activeOrders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION']);
    
    if (ordersError) {
      addTest('Verificar órdenes activas', false, ordersError.message);
    } else {
      addTest('Verificar órdenes activas', true, `${activeOrders.length} órdenes activas`);
    }

    // TEST 2: Crear orden de prueba
    console.log('\n2️⃣ CREANDO ORDEN DE PRUEBA');
    console.log('-'.repeat(40));
    
    const testOrder = {
      spaceid: spaces[0].id,
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Cliente Test Sistema',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Producto Test Sistema',
          unitPrice: 25.00,
          totalPrice: 25.00,
          quantity: 1,
          notes: 'Item de prueba del sistema'
        }
      ],
      notes: 'Orden de prueba del sistema completo',
      totalamount: 25.00,
      subtotal: 25.00,
      tax: 0.00,
      discount: 0.00
    };

    let createdOrder;
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/orders/test`, testOrder);
      createdOrder = createResponse.data;
      addTest('Crear orden', true, `Orden ${createdOrder.orderNumber} creada exitosamente`);
    } catch (error) {
      addTest('Crear orden', false, error.response?.data?.message || error.message);
      return;
    }

    // TEST 3: Verificar que el espacio se ocupó
    console.log('\n3️⃣ VERIFICANDO OCUPACIÓN DE ESPACIO');
    console.log('-'.repeat(40));
    
    const { data: updatedSpaces, error: updatedSpacesError } = await supabase
      .from('Space')
      .select('*')
      .eq('id', spaces[0].id)
      .single();
    
    if (updatedSpacesError) {
      addTest('Verificar ocupación de espacio', false, updatedSpacesError.message);
    } else {
      const spaceOccupied = updatedSpaces.status === 'OCUPADA';
      addTest('Verificar ocupación de espacio', spaceOccupied, `Espacio ${updatedSpaces.name}: ${updatedSpaces.status}`);
    }

    // TEST 4: Verificar cronómetro
    console.log('\n4️⃣ VERIFICANDO CRONÓMETRO');
    console.log('-'.repeat(40));
    
    const now = new Date();
    const startTime = createdOrder.createdAt;
    const startTimeDate = new Date(startTime);
    
    // Verificar si la fecha tiene información de zona horaria
    const hasTimezoneInfo = startTime.includes('Z') || startTime.includes('+') || startTime.includes('-');
    
    let elapsedSeconds;
    if (hasTimezoneInfo) {
      // La fecha ya tiene información de zona horaria, usarla directamente
      elapsedSeconds = Math.max(0, Math.floor((now.getTime() - startTimeDate.getTime()) / 1000));
    } else {
      // La fecha no tiene información de zona horaria, asumir que es UTC
      const utcStartTime = new Date(startTime + 'Z');
      elapsedSeconds = Math.max(0, Math.floor((now.getTime() - utcStartTime.getTime()) / 1000));
    }
    
    const timerWorking = elapsedSeconds >= 0 && elapsedSeconds < 100; // Debería ser un tiempo razonable
    addTest('Verificar cronómetro', timerWorking, `Tiempo transcurrido: ${elapsedSeconds} segundos`);
    
    // TEST 5: Agregar item a la orden
    console.log('\n5️⃣ AGREGANDO ITEM A LA ORDEN');
    console.log('-'.repeat(40));
    
    const newItem = {
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Item Agregado Test',
          unitPrice: 15.00,
          totalPrice: 15.00,
          quantity: 1,
          notes: 'Item agregado en prueba'
        }
      ]
    };
    
    try {
      const addItemResponse = await axios.post(`${API_BASE_URL}/orders/test/${createdOrder.id}/items`, newItem);
      addTest('Agregar item a orden', true, 'Item agregado exitosamente');
    } catch (error) {
      addTest('Agregar item a orden', false, error.response?.data?.message || error.message);
    }

    // TEST 6: Verificar que el cronómetro NO se reinició
    console.log('\n6️⃣ VERIFICANDO QUE EL CRONÓMETRO NO SE REINICIÓ');
    console.log('-'.repeat(40));
    
    const { data: updatedOrder, error: updatedOrderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', createdOrder.id)
      .single();
    
    if (updatedOrderError) {
      addTest('Verificar cronómetro no reiniciado', false, updatedOrderError.message);
    } else {
      const createdAtUnchanged = updatedOrder.createdAt === createdOrder.createdAt;
      addTest('Verificar cronómetro no reiniciado', createdAtUnchanged, 
        `createdAt: ${createdAtUnchanged ? 'NO cambió' : 'SÍ cambió'}`);
    }

    // TEST 7: Pagar la orden
    console.log('\n7️⃣ PAGANDO LA ORDEN');
    console.log('-'.repeat(40));
    
    try {
      const paymentResponse = await axios.put(`${API_BASE_URL}/orders/test/${createdOrder.id}/status`, {
        status: 'PAGADO'
      });
      addTest('Pagar orden', true, 'Orden pagada exitosamente');
    } catch (error) {
      addTest('Pagar orden', false, error.response?.data?.message || error.message);
    }

    // TEST 8: Verificar que el espacio se liberó
    console.log('\n8️⃣ VERIFICANDO LIBERACIÓN DE ESPACIO');
    console.log('-'.repeat(40));
    
    const { data: finalSpaces, error: finalSpacesError } = await supabase
      .from('Space')
      .select('*')
      .eq('id', spaces[0].id)
      .single();
    
    if (finalSpacesError) {
      addTest('Verificar liberación de espacio', false, finalSpacesError.message);
    } else {
      const spaceFreed = finalSpaces.status === 'LIBRE';
      addTest('Verificar liberación de espacio', spaceFreed, `Espacio ${finalSpaces.name}: ${finalSpaces.status}`);
    }

    // TEST 9: Verificar estado final de la orden
    console.log('\n9️⃣ VERIFICANDO ESTADO FINAL DE LA ORDEN');
    console.log('-'.repeat(40));
    
    const { data: finalOrder, error: finalOrderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', createdOrder.id)
      .single();
    
    if (finalOrderError) {
      addTest('Verificar estado final de orden', false, finalOrderError.message);
    } else {
      const orderPaid = finalOrder.status === 'PAGADO';
      addTest('Verificar estado final de orden', orderPaid, `Estado: ${finalOrder.status}`);
    }

    // TEST 10: Verificar items de la orden
    console.log('\n🔟 VERIFICANDO ITEMS DE LA ORDEN');
    console.log('-'.repeat(40));
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderid', createdOrder.id);
    
    if (itemsError) {
      addTest('Verificar items de orden', false, itemsError.message);
    } else {
      const hasItems = orderItems.length > 0;
      addTest('Verificar items de orden', hasItems, `${orderItems.length} items encontrados`);
      
      if (orderItems.length > 0) {
        orderItems.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - $${item.totalprice}`);
        });
      }
    }

    // RESUMEN FINAL
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(50));
    console.log(`✅ Pruebas exitosas: ${testResults.passed}`);
    console.log(`❌ Pruebas fallidas: ${testResults.failed}`);
    console.log(`📊 Total de pruebas: ${testResults.total}`);
    console.log(`🎯 Porcentaje de éxito: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      testResults.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }
    
    if (testResults.failed === 0) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON!');
      console.log('✅ El sistema está funcionando correctamente');
    } else {
      console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
      console.log('🔧 Revisa los errores arriba');
    }

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    addTest('Pruebas generales', false, error.message);
  }
}

comprehensiveSystemTest();
