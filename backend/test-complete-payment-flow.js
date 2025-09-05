require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testCompletePaymentFlow() {
  console.log('🧪 Probando flujo completo: crear orden → pagar → liberar espacio...\n');

  try {
    // 1. Obtener espacios disponibles (usar Supabase directamente)
    console.log('1️⃣ Obteniendo espacios disponibles...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*');
      
    if (spacesError) {
      console.log('   ❌ Error obteniendo espacios:', spacesError.message);
      return;
    }
    
    const availableSpaces = spaces.filter(space => space.status === 'LIBRE');
    console.log(`   ✅ Espacios disponibles: ${availableSpaces.length}`);
    
    if (availableSpaces.length === 0) {
      console.log('   ⚠️  No hay espacios disponibles. Liberando uno...');
      
      // Buscar un espacio ocupado para liberar
      const occupiedSpaces = spaces.filter(space => space.status === 'OCUPADA');
      if (occupiedSpaces.length > 0) {
        const spaceToFree = occupiedSpaces[0];
        console.log(`   🔓 Liberando espacio: ${spaceToFree.name}`);
        
        // Intentar liberar el espacio directamente
        try {
          await axios.put(`${API_BASE_URL}/catalog/spaces/${spaceToFree.id}`, {
            status: 'LIBRE'
          });
          console.log(`   ✅ Espacio ${spaceToFree.name} liberado`);
        } catch (error) {
          console.log(`   ❌ Error liberando espacio: ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    // 2. Crear una orden de prueba
    console.log('\n2️⃣ Creando orden de prueba...');
    const testOrder = {
      spaceid: spaces[0].id, // Usar el primer espacio disponible
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b', // UUID real del usuario
      customername: 'Cliente de Prueba Pago',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116', // UUID real
          name: 'Producto de Prueba Pago',
          unitPrice: 15.00,
          totalPrice: 15.00,
          quantity: 1,
          notes: 'Orden de prueba para probar pago'
        }
      ],
      notes: 'Orden de prueba para probar liberación de espacios',
      totalamount: 15.00,
      subtotal: 15.00,
      tax: 0.00,
      discount: 0.00
    };

    const createOrderResponse = await axios.post(`${API_BASE_URL}/orders/test`, testOrder);
    console.log(`   ✅ Orden creada: ${createOrderResponse.data.orderNumber}`);
    console.log(`   📋 ID: ${createOrderResponse.data.id}`);
    console.log(`   🏠 Mesa: ${spaces[0].name}`);
    
    const orderId = createOrderResponse.data.id;
    
    // 3. Verificar estado de espacios después de crear la orden
    console.log('\n3️⃣ Verificando estado de espacios después de crear la orden...');
    const { data: spacesAfterCreate, error: spacesAfterError } = await supabase
      .from('Space')
      .select('*');
      
    if (spacesAfterError) {
      console.log('   ❌ Error obteniendo espacios:', spacesAfterError.message);
      return;
    }
    
    const usedSpace = spacesAfterCreate.find(s => s.id === spaces[0].id);
    console.log(`   📊 Mesa ${usedSpace.name}: ${usedSpace.status}`);
    console.log(`   ✅ ¿Se ocupó?: ${usedSpace.status === 'OCUPADA' ? 'SÍ' : 'NO'}`);
    
    // 4. Pagar la orden usando el endpoint de prueba
    console.log('\n4️⃣ Pagando la orden usando endpoint de prueba...');
    try {
      const paymentResponse = await axios.put(`${API_BASE_URL}/orders/test/${orderId}/status`, {
        status: 'PAGADO'
      });
      console.log('   ✅ Pago exitoso:', paymentResponse.data);
    } catch (error) {
      console.log('   ❌ Error al pagar:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('   📋 Detalles del error:', error.response.data);
      }
    }
    
    // 5. Verificar estado final
    console.log('\n6️⃣ Verificando estado final...');
    const { data: spacesFinal, error: spacesFinalError } = await supabase
      .from('Space')
      .select('*');
      
    if (spacesFinalError) {
      console.log('   ❌ Error obteniendo espacios finales:', spacesFinalError.message);
      return;
    }
    
    const finalSpace = spacesFinal.find(s => s.id === spaces[0].id);
    console.log(`   📊 Mesa ${finalSpace.name}: ${finalSpace.status}`);
    
    const { data: orderFinal, error: orderFinalError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderFinalError) {
      console.log('   ❌ Error obteniendo orden final:', orderFinalError.message);
      return;
    }
    
    console.log(`   📋 Orden ${orderFinal.orderNumber}: ${orderFinal.status}`);
    
    // 6. Resumen
    console.log('\n7️⃣ Resumen del flujo:');
    console.log(`   🏠 Mesa: ${spaces[0].name}`);
    console.log(`   📋 Orden: ${createOrderResponse.data.orderNumber}`);
    console.log(`   💰 Total: $${testOrder.totalamount}`);
    console.log(`   📊 Estado inicial de mesa: LIBRE`);
    console.log(`   📊 Estado después de crear orden: ${usedSpace.status}`);
    console.log(`   📊 Estado final de mesa: ${finalSpace.status}`);
    console.log(`   📊 Estado final de orden: ${orderFinal.status}`);
    
    const spaceWasFreed = finalSpace.status === 'LIBRE';
    const orderWasPaid = orderFinal.status === 'PAGADO';
    
    console.log(`\n🎯 Resultado:`);
    console.log(`   ${spaceWasFreed ? '✅' : '❌'} Espacio liberado: ${spaceWasFreed ? 'SÍ' : 'NO'}`);
    console.log(`   ${orderWasPaid ? '✅' : '❌'} Orden pagada: ${orderWasPaid ? 'SÍ' : 'NO'}`);
    
    if (spaceWasFreed && orderWasPaid) {
      console.log(`\n🎉 ¡Flujo de pago funcionando correctamente!`);
    } else {
      console.log(`\n⚠️  Hay problemas en el flujo de pago`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testCompletePaymentFlow();
