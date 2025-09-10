require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSpaceLogic() {
  console.log('🧪 Probando lógica de ocupación/liberación de espacios...\n');

  try {
    // 1. Verificar estado inicial
    console.log('1️⃣ ESTADO INICIAL:');
    const { data: initialSpaces, error: initialSpacesError } = await supabase
      .from('Space')
      .select('*')
      .order('name');

    if (initialSpacesError) {
      console.error('❌ Error obteniendo espacios iniciales:', initialSpacesError.message);
      return;
    }

    const initialFreeSpaces = initialSpaces.filter(s => s.status === 'LIBRE');
    console.log(`   🟢 Mesas libres: ${initialFreeSpaces.length}`);
    initialFreeSpaces.forEach(space => console.log(`      - ${space.name}`));

    // 2. Crear una orden de prueba
    console.log('\n2️⃣ CREANDO ORDEN DE PRUEBA:');
    const testOrder = {
      spaceid: initialFreeSpaces[0].id, // Usar la primera mesa libre
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Test Lógica Espacios',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Test Lógica',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Test de lógica de espacios'
        }
      ],
      notes: 'Test de lógica de espacios',
      totalamount: 10.00,
      subtotal: 10.00,
      tax: 0.00,
      discount: 0.00
    };

    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_with_items', {
        p_space_id: testOrder.spaceid,
        p_created_by: testOrder.createdby,
        p_customer_name: testOrder.customername,
        p_customer_phone: testOrder.customerphone,
        p_total_amount: testOrder.totalamount,
        p_subtotal: testOrder.subtotal,
        p_tax: testOrder.tax,
        p_discount: testOrder.discount,
        p_notes: testOrder.notes,
        p_items: testOrder.items
      });

    if (rpcError) {
      console.log('   ❌ Error creando orden:', rpcError.message);
      return;
    }

    const created = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    console.log(`   ✅ Orden creada: ${created.orderNumber}`);

    // 3. Verificar que el espacio se ocupó
    console.log('\n3️⃣ VERIFICANDO OCUPACIÓN:');
    const { data: occupiedSpaces, error: occupiedSpacesError } = await supabase
      .from('Space')
      .select('*')
      .eq('id', testOrder.spaceid)
      .single();

    if (occupiedSpacesError) {
      console.error('❌ Error verificando ocupación:', occupiedSpacesError.message);
      return;
    }

    const spaceOccupied = occupiedSpaces.status === 'OCUPADA';
    console.log(`   ${spaceOccupied ? '✅' : '❌'} Espacio ${occupiedSpaces.name}: ${occupiedSpaces.status}`);

    if (!spaceOccupied) {
      console.log('   ❌ ERROR: El espacio no se ocupó al crear la orden');
      return;
    }

    // 4. Pagar la orden
    console.log('\n4️⃣ PAGANDO LA ORDEN:');
    const { error: paymentError } = await supabase
      .from('Order')
      .update({ status: 'PAGADO' })
      .eq('id', created.id);

    if (paymentError) {
      console.log('   ❌ Error pagando orden:', paymentError.message);
      return;
    }

    console.log('   ✅ Orden pagada');

    // 5. Verificar que el espacio se liberó
    console.log('\n5️⃣ VERIFICANDO LIBERACIÓN:');
    const { data: freedSpaces, error: freedSpacesError } = await supabase
      .from('Space')
      .select('*')
      .eq('id', testOrder.spaceid)
      .single();

    if (freedSpacesError) {
      console.error('❌ Error verificando liberación:', freedSpacesError.message);
      return;
    }

    const spaceFreed = freedSpaces.status === 'LIBRE';
    console.log(`   ${spaceFreed ? '✅' : '❌'} Espacio ${freedSpaces.name}: ${freedSpaces.status}`);

    // 6. Limpiar - eliminar la orden de prueba
    console.log('\n6️⃣ LIMPIANDO ORDEN DE PRUEBA:');
    const { error: deleteError } = await supabase
      .from('Order')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log('   ⚠️  Error eliminando orden de prueba:', deleteError.message);
    } else {
      console.log('   ✅ Orden de prueba eliminada');
    }

    // 7. Resultado final
    console.log('\n📊 RESULTADO FINAL:');
    console.log('=' .repeat(30));
    
    if (spaceOccupied && spaceFreed) {
      console.log('🎉 ¡LÓGICA DE ESPACIOS FUNCIONA PERFECTAMENTE!');
      console.log('✅ Crear orden → Ocupa espacio');
      console.log('✅ Pagar orden → Libera espacio');
    } else {
      console.log('❌ Problema con la lógica de espacios');
      if (!spaceOccupied) console.log('   - No se ocupó el espacio al crear orden');
      if (!spaceFreed) console.log('   - No se liberó el espacio al pagar');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testSpaceLogic();





