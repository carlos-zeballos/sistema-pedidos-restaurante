require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testItemsVisualization() {
  console.log('🧪 Probando visualización de items en cocina...\n');

  try {
    // 1. Crear una orden de prueba
    console.log('1️⃣ CREANDO ORDEN DE PRUEBA:');
    const testOrder = {
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35', // Mesa 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Test Items Visualization',
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
      notes: 'Test de visualización de items',
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

    // 2. Verificar items iniciales en la BD
    console.log('\n2️⃣ VERIFICANDO ITEMS INICIALES EN BD:');
    const { data: initialItems, error: initialItemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderid', created.id);

    if (initialItemsError) {
      console.log('   ❌ Error obteniendo items iniciales:', initialItemsError.message);
    } else {
      console.log(`   📦 Items en BD: ${initialItems.length}`);
      initialItems.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name} - $${item.totalprice} (${item.createdat})`);
      });
    }

    // 3. Verificar cómo aparece en el endpoint de cocina
    console.log('\n3️⃣ VERIFICANDO ENDPOINT DE COCINA:');
    try {
      const kitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
      const kitchenOrders = kitchenResponse.data;
      
      const foundOrder = kitchenOrders.find(o => o.id === created.id);
      if (foundOrder) {
        console.log(`   ✅ Orden encontrada en cocina: ${foundOrder.orderNumber}`);
        console.log(`   📦 Items en cocina: ${foundOrder.items?.length || 0}`);
        
        if (foundOrder.items && foundOrder.items.length > 0) {
          foundOrder.items.forEach((item, index) => {
            console.log(`      ${index + 1}. ${item.name} - $${item.totalprice} (${item.createdat})`);
          });
        } else {
          console.log('   ❌ No hay items en la respuesta de cocina');
        }
      } else {
        console.log('   ❌ Orden NO encontrada en cocina');
      }
    } catch (error) {
      console.log('   ❌ Error obteniendo órdenes de cocina:', error.response?.data?.message || error.message);
    }

    // 4. Agregar un item adicional
    console.log('\n4️⃣ AGREGANDO ITEM ADICIONAL:');
    const newItem = {
      productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
      name: 'Item Agregado',
      unitPrice: 15.00,
      totalPrice: 15.00,
      quantity: 1,
      notes: 'Item agregado desde mozos'
    };

    try {
      const addItemsResponse = await axios.post(`${API_BASE_URL}/orders/test/${created.id}/items`, {
        items: [newItem]
      });
      console.log('   ✅ Item agregado exitosamente');
    } catch (error) {
      console.log('   ❌ Error agregando item:', error.response?.data?.message || error.message);
    }

    // 5. Verificar items después de agregar
    console.log('\n5️⃣ VERIFICANDO ITEMS DESPUÉS DE AGREGAR:');
    const { data: updatedItems, error: updatedItemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderid', created.id)
      .order('createdat', { ascending: true });

    if (updatedItemsError) {
      console.log('   ❌ Error obteniendo items actualizados:', updatedItemsError.message);
    } else {
      console.log(`   📦 Items totales en BD: ${updatedItems.length}`);
      updatedItems.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name} - $${item.totalprice} (${item.createdat})`);
      });
    }

    // 6. Verificar cómo aparece en cocina después de agregar
    console.log('\n6️⃣ VERIFICANDO COCINA DESPUÉS DE AGREGAR:');
    try {
      const updatedKitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
      const updatedKitchenOrders = updatedKitchenResponse.data;
      
      const updatedFoundOrder = updatedKitchenOrders.find(o => o.id === created.id);
      if (updatedFoundOrder) {
        console.log(`   ✅ Orden actualizada encontrada en cocina: ${updatedFoundOrder.orderNumber}`);
        console.log(`   📦 Items en cocina: ${updatedFoundOrder.items?.length || 0}`);
        console.log(`   💰 Total: $${updatedFoundOrder.totalAmount || 0}`);
        console.log(`   📅 Última actualización: ${updatedFoundOrder.updatedAt}`);
        
        if (updatedFoundOrder.items && updatedFoundOrder.items.length > 0) {
          updatedFoundOrder.items.forEach((item, index) => {
            console.log(`      ${index + 1}. ${item.name} - $${item.totalprice} (${item.createdat})`);
          });
        } else {
          console.log('   ❌ No hay items en la respuesta de cocina actualizada');
        }
      } else {
        console.log('   ❌ Orden actualizada NO encontrada en cocina');
      }
    } catch (error) {
      console.log('   ❌ Error obteniendo órdenes de cocina actualizadas:', error.response?.data?.message || error.message);
    }

    // 7. Limpiar
    console.log('\n7️⃣ LIMPIANDO:');
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

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testItemsVisualization();

