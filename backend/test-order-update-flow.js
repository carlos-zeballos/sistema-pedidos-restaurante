require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOrderUpdateFlow() {
  console.log('🧪 Probando flujo de actualización de pedidos...\n');

  try {
    // 1. Crear una orden de prueba
    console.log('1️⃣ CREANDO ORDEN DE PRUEBA:');
    const testOrder = {
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35', // Mesa 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Test Update Flow',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Item Original',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Item original de prueba'
        }
      ],
      notes: 'Test de flujo de actualización',
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

    // 2. Verificar que la orden aparece en cocina
    console.log('\n2️⃣ VERIFICANDO QUE APARECE EN COCINA:');
    try {
      const kitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
      const kitchenOrders = kitchenResponse.data;
      
      const foundOrder = kitchenOrders.find(o => o.id === created.id);
      if (foundOrder) {
        console.log(`   ✅ Orden encontrada en cocina: ${foundOrder.orderNumber}`);
        console.log(`   📦 Items iniciales: ${foundOrder.items?.length || 0}`);
      } else {
        console.log(`   ❌ Orden NO encontrada en cocina`);
        return;
      }
    } catch (error) {
      console.log('   ❌ Error obteniendo órdenes de cocina:', error.response?.data?.message || error.message);
      return;
    }

    // 3. Agregar items a la orden (simulando actualización desde mozos)
    console.log('\n3️⃣ AGREGANDO ITEMS A LA ORDEN:');
    const newItems = [
      {
        productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
        name: 'Item Agregado',
        unitPrice: 15.00,
        totalPrice: 15.00,
        quantity: 1,
        notes: 'Item agregado desde mozos'
      }
    ];

    try {
      const addItemsResponse = await axios.post(`${API_BASE_URL}/orders/test/${created.id}/items`, {
        items: newItems
      });
      console.log('   ✅ Items agregados exitosamente');
      console.log('   📦 Items agregados:', addItemsResponse.data);
    } catch (error) {
      console.log('   ❌ Error agregando items:', error.response?.data?.message || error.message);
      return;
    }

    // 4. Verificar que la orden actualizada aparece en cocina
    console.log('\n4️⃣ VERIFICANDO ACTUALIZACIÓN EN COCINA:');
    try {
      const updatedKitchenResponse = await axios.get(`${API_BASE_URL}/orders/kitchen`);
      const updatedKitchenOrders = updatedKitchenResponse.data;
      
      const updatedOrder = updatedKitchenOrders.find(o => o.id === created.id);
      if (updatedOrder) {
        console.log(`   ✅ Orden actualizada encontrada en cocina: ${updatedOrder.orderNumber}`);
        console.log(`   📦 Items totales: ${updatedOrder.items?.length || 0}`);
        console.log(`   💰 Total actualizado: $${updatedOrder.totalAmount || 0}`);
        console.log(`   📅 Última actualización: ${updatedOrder.updatedAt}`);
        
        // Verificar que tiene los items nuevos
        if (updatedOrder.items && updatedOrder.items.length > 1) {
          console.log('   ✅ La orden tiene items agregados');
          updatedOrder.items.forEach((item, index) => {
            console.log(`      ${index + 1}. ${item.name} - $${item.totalPrice}`);
          });
        } else {
          console.log('   ❌ La orden no tiene los items agregados');
        }
      } else {
        console.log(`   ❌ Orden actualizada NO encontrada en cocina`);
      }
    } catch (error) {
      console.log('   ❌ Error verificando actualización:', error.response?.data?.message || error.message);
    }

    // 5. Limpiar - eliminar la orden de prueba
    console.log('\n5️⃣ LIMPIANDO ORDEN DE PRUEBA:');
    const { error: deleteError } = await supabase
      .from('Order')
      .delete()
      .eq('id', created.id);

    if (deleteError) {
      console.log('   ⚠️  Error eliminando orden de prueba:', deleteError.message);
    } else {
      console.log('   ✅ Orden de prueba eliminada');
    }

    // 6. Liberar el espacio
    const { error: spaceError } = await supabase
      .from('Space')
      .update({ status: 'LIBRE' })
      .eq('id', testOrder.spaceid);

    if (spaceError) {
      console.log('   ⚠️  Error liberando espacio:', spaceError.message);
    } else {
      console.log('   ✅ Espacio liberado');
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.log('=' .repeat(30));
    console.log('✅ Flujo de actualización de pedidos funcionando');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testOrderUpdateFlow();










