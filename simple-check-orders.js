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
    // Buscar las últimas 10 órdenes
    console.log('🔍 Buscando las últimas 10 órdenes...');
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`📊 Órdenes encontradas: ${orders.length}\n`);
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber || 'SIN_NUMERO'}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   Cliente: ${order.customerName || 'SIN_CLIENTE'}`);
      console.log(`   Pagado: ${order.isPaid || false}`);
      console.log(`   Creado: ${order.createdAt}`);
      console.log(`   ID: ${order.id}`);
      console.log('');
    });

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

