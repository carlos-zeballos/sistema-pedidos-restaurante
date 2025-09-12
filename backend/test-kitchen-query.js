require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testKitchenQuery() {
  console.log('🔍 Probando consulta de cocina...\n');

  try {
    // 1. Probar la consulta exacta que usa getKitchenOrders
    console.log('1️⃣ Probando consulta de getKitchenOrders...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    console.log(`   📅 Filtro de fecha: >= ${todayISO}`);
    
    const { data: kitchenOrders, error: kitchenError } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          components:OrderItemComponent(*)
        ),
        space:Space(*)
      `)
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .gte('createdAt', todayISO)
      .order('createdAt', { ascending: true });

    if (kitchenError) {
      console.log('   ❌ Error en consulta de cocina:', kitchenError.message);
    } else {
      console.log(`   ✅ Órdenes de cocina: ${kitchenOrders.length}`);
      kitchenOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}:`);
        console.log(`      - Items: ${order.items?.length || 0}`);
        console.log(`      - Creada: ${order.createdAt}`);
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, itemIndex) => {
            console.log(`         ${itemIndex + 1}. ${item.name} - $${item.totalprice}`);
          });
        }
      });
    }

    // 2. Probar consulta más simple
    console.log('\n2️⃣ Probando consulta simple...');
    const { data: simpleOrders, error: simpleError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .gte('createdAt', todayISO)
      .order('createdAt', { ascending: true });

    if (simpleError) {
      console.log('   ❌ Error en consulta simple:', simpleError.message);
    } else {
      console.log(`   ✅ Órdenes simples: ${simpleOrders.length}`);
      simpleOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}`);
      });
    }

    // 3. Probar consulta de items por separado
    console.log('\n3️⃣ Probando consulta de items por separado...');
    if (simpleOrders && simpleOrders.length > 0) {
      const orderId = simpleOrders[0].id;
      console.log(`   📋 Consultando items para orden: ${orderId}`);
      
      const { data: items, error: itemsError } = await supabase
        .from('OrderItem')
        .select('*')
        .eq('orderid', orderId);

      if (itemsError) {
        console.log('   ❌ Error consultando items:', itemsError.message);
      } else {
        console.log(`   ✅ Items encontrados: ${items.length}`);
        items.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.name} - $${item.totalprice}`);
        });
      }
    }

    // 4. Probar consulta con join manual
    console.log('\n4️⃣ Probando consulta con join manual...');
    const { data: manualJoin, error: manualError } = await supabase
      .from('Order')
      .select(`
        *,
        OrderItem(*)
      `)
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .gte('createdAt', todayISO)
      .order('createdAt', { ascending: true });

    if (manualError) {
      console.log('   ❌ Error en join manual:', manualError.message);
    } else {
      console.log(`   ✅ Join manual: ${manualJoin.length}`);
      manualJoin.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}:`);
        console.log(`      - Items: ${order.OrderItem?.length || 0}`);
        if (order.OrderItem && order.OrderItem.length > 0) {
          order.OrderItem.forEach((item, itemIndex) => {
            console.log(`         ${itemIndex + 1}. ${item.name} - $${item.totalprice}`);
          });
        }
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testKitchenQuery();









