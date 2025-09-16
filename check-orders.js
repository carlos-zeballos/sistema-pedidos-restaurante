require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  console.log('🔍 VERIFICANDO ÓRDENES EXISTENTES');
  console.log('==================================\n');

  try {
    // Buscar todas las órdenes de hoy
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`📅 Buscando órdenes del día: ${today}`);

    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('id, "orderNumber", status, "customerName", "spaceId", "createdAt", "isPaid"')
      .gte('createdAt', `${today}T00:00:00`)
      .lte('createdAt', `${today}T23:59:59`)
      .order('createdAt', { ascending: false });

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`📊 Órdenes encontradas: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('⚠️ No hay órdenes del día de hoy');
      
      // Buscar las últimas 10 órdenes
      console.log('\n🔍 Buscando las últimas 10 órdenes...');
      const { data: recentOrders, error: recentError } = await supabase
        .from('Order')
        .select('id, "orderNumber", status, "customerName", "spaceId", "createdAt", "isPaid"')
        .order('createdAt', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('❌ Error obteniendo órdenes recientes:', recentError);
        return;
      }

      console.log(`📊 Órdenes recientes encontradas: ${recentOrders.length}\n`);
      
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber}`);
        console.log(`   Estado: ${order.status}`);
        console.log(`   Cliente: ${order.customerName}`);
        console.log(`   Pagado: ${order.isPaid}`);
        console.log(`   Creado: ${order.createdAt}`);
        console.log(`   ID: ${order.id}`);
        console.log('');
      });
    } else {
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber}`);
        console.log(`   Estado: ${order.status}`);
        console.log(`   Cliente: ${order.customerName}`);
        console.log(`   Pagado: ${order.isPaid}`);
        console.log(`   Creado: ${order.createdAt}`);
        console.log(`   ID: ${order.id}`);
        console.log('');
      });
    }

    // Buscar específicamente la orden mencionada
    console.log('\n🔍 Buscando orden específica ORD-20250913-0009...');
    const { data: specificOrder, error: specificError } = await supabase
      .from('Order')
      .select('*')
      .eq('orderNumber', 'ORD-20250913-0009')
      .single();

    if (specificError) {
      console.log('❌ Orden ORD-20250913-0009 no encontrada');
      console.log('   Error:', specificError.message);
    } else {
      console.log('✅ Orden ORD-20250913-0009 encontrada:');
      console.log(`   Estado: ${specificOrder.status}`);
      console.log(`   Cliente: ${specificOrder.customerName}`);
      console.log(`   Pagado: ${specificOrder.isPaid}`);
      console.log(`   ID: ${specificOrder.id}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la verificación
checkOrders();
