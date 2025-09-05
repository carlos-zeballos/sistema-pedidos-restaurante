require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugItems() {
  console.log('🔍 Diagnosticando items de órdenes...\n');

  try {
    // 1. Verificar todas las órdenes
    console.log('1️⃣ Verificando todas las órdenes...');
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .order('createdAt', { ascending: false });

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`   ✅ Órdenes encontradas: ${orders.length}`);

    // 2. Verificar items de cada orden
    console.log('\n2️⃣ Verificando items de cada orden...');
    for (const order of orders) {
      console.log(`\n   📋 Orden ${order.orderNumber}:`);
      console.log(`      - ID: ${order.id}`);
      console.log(`      - Creada: ${order.createdAt}`);
      console.log(`      - Actualizada: ${order.updatedAt}`);
      console.log(`      - Estado: ${order.status}`);

      // Obtener items de esta orden
      const { data: items, error: itemsError } = await supabase
        .from('OrderItem')
        .select('*')
        .eq('orderid', order.id);

      if (itemsError) {
        console.error(`      ❌ Error obteniendo items:`, itemsError);
      } else {
        console.log(`      - Items: ${items.length}`);
        items.forEach((item, index) => {
          console.log(`        ${index + 1}. ${item.name} - $${item.totalPrice} (${item.quantity}x)`);
          console.log(`           - Creado: ${item.createdAt}`);
          console.log(`           - Estado: ${item.status}`);
        });
      }
    }

    // 3. Verificar items sin orden
    console.log('\n3️⃣ Verificando items huérfanos...');
    const { data: orphanItems, error: orphanError } = await supabase
      .from('OrderItem')
      .select('*')
      .is('orderid', null);

    if (orphanError) {
      console.error('❌ Error obteniendo items huérfanos:', orphanError);
    } else {
      console.log(`   ✅ Items huérfanos: ${orphanItems.length}`);
      if (orphanItems.length > 0) {
        orphanItems.forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.name} - $${item.totalPrice}`);
        });
      }
    }

    // 4. Verificar la consulta que usa getKitchenOrders
    console.log('\n4️⃣ Probando consulta de getKitchenOrders...');
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
      console.error('❌ Error en consulta de cocina:', kitchenError);
    } else {
      console.log(`   ✅ Órdenes de cocina: ${kitchenOrders.length}`);
      kitchenOrders.forEach((order, index) => {
        console.log(`      ${index + 1}. ${order.orderNumber}:`);
        console.log(`         - Items: ${order.items?.length || 0}`);
        console.log(`         - Creada: ${order.createdAt}`);
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, itemIndex) => {
            console.log(`           ${itemIndex + 1}. ${item.name} - $${item.totalPrice}`);
          });
        }
      });
    }

    console.log('\n🎯 Diagnóstico de items completado!');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

// Ejecutar el diagnóstico
debugItems();
