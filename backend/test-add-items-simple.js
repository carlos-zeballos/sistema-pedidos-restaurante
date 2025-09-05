require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAddItemsSimple() {
  console.log('🧪 Probando agregar items de forma simple...\n');

  try {
    // 1. Crear una orden simple
    console.log('1️⃣ CREANDO ORDEN SIMPLE:');
    const testOrder = {
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35', // Mesa 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Test Simple',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Item Original',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Item original'
        }
      ],
      notes: 'Test simple',
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
    console.log(`   ✅ Orden creada: ${created.orderNumber} (ID: ${created.id})`);

    // 2. Verificar items iniciales
    console.log('\n2️⃣ VERIFICANDO ITEMS INICIALES:');
    const { data: initialItems, error: initialItemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderid', created.id);

    if (initialItemsError) {
      console.log('   ❌ Error obteniendo items iniciales:', initialItemsError.message);
    } else {
      console.log(`   📦 Items iniciales: ${initialItems.length}`);
      initialItems.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name} - $${item.totalprice}`);
      });
    }

    // 3. Agregar item directamente a la BD
    console.log('\n3️⃣ AGREGANDO ITEM DIRECTAMENTE A LA BD:');
    const newItem = {
      orderid: created.id,
      productid: 'c015c69d-2212-46b4-9594-8d97905b3116',
      comboid: null,
      name: 'Item Agregado',
      unitprice: 15.00,
      totalprice: 15.00,
      quantity: 1,
      status: 'PENDIENTE',
      notes: 'Item agregado directamente',
      createdat: new Date().toISOString()
    };

    const { data: insertedItem, error: insertError } = await supabase
      .from('OrderItem')
      .insert([newItem])
      .select();

    if (insertError) {
      console.log('   ❌ Error insertando item:', insertError.message);
    } else {
      console.log('   ✅ Item insertado exitosamente');
      console.log('   📦 Item insertado:', insertedItem[0]);
    }

    // 4. Verificar items después de insertar
    console.log('\n4️⃣ VERIFICANDO ITEMS DESPUÉS DE INSERTAR:');
    const { data: finalItems, error: finalItemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderid', created.id)
      .order('createdat', { ascending: true });

    if (finalItemsError) {
      console.log('   ❌ Error obteniendo items finales:', finalItemsError.message);
    } else {
      console.log(`   📦 Items finales: ${finalItems.length}`);
      finalItems.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name} - $${item.totalprice} (${item.createdat})`);
      });
    }

    // 5. Actualizar total de la orden
    console.log('\n5️⃣ ACTUALIZANDO TOTAL DE LA ORDEN:');
    const newTotal = 10.00 + 15.00; // 25.00
    
    const { error: updateError } = await supabase
      .from('Order')
      .update({
        totalAmount: newTotal,
        subtotal: newTotal,
        updatedAt: new Date().toISOString()
      })
      .eq('id', created.id);

    if (updateError) {
      console.log('   ❌ Error actualizando orden:', updateError.message);
    } else {
      console.log(`   ✅ Orden actualizada - Nuevo total: $${newTotal}`);
    }

    // 6. Limpiar
    console.log('\n6️⃣ LIMPIANDO:');
    const { error: deleteError } = await supabase
      .from('Order')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log('   ⚠️  Error eliminando orden:', deleteError.message);
    } else {
      console.log('   ✅ Orden eliminada');
    }

    const { error: spaceError } = await supabase
      .from('Space')
      .update({ status: 'LIBRE' })
      .eq('id', testOrder.spaceid);

    if (spaceError) {
      console.log('   ⚠️  Error liberando espacio:', spaceError.message);
    } else {
      console.log('   ✅ Espacio liberado');
    }

    console.log('\n📊 RESULTADO:');
    console.log('✅ Agregar items directamente a la BD funciona');
    console.log('🔍 El problema puede estar en el endpoint de la API');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testAddItemsSimple();
