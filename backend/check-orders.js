const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrders() {
  console.log('🔍 Verificando órdenes en la base de datos...\n');

  try {
    // Obtener todas las órdenes
    const { data: orders, error } = await supabase
      .from('Order')
      .select(`
        id,
        ordernumber,
        status,
        customername,
        createdat,
        space:Space(name)
      `)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo órdenes:', error);
      return;
    }

    console.log(`✅ ${orders.length} órdenes encontradas:\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Orden #${order.ordernumber}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   Cliente: ${order.customername}`);
      console.log(`   Espacio: ${order.space?.name}`);
      console.log(`   Creada: ${new Date(order.createdat).toLocaleString()}`);
      console.log('');
    });

    // Verificar órdenes de cocina específicamente
    console.log('🍳 Órdenes de cocina (PENDIENTE o EN_PREPARACION):');
    const kitchenOrders = orders.filter(order => 
      order.status === 'PENDIENTE' || order.status === 'EN_PREPARACION'
    );

    if (kitchenOrders.length === 0) {
      console.log('   No hay órdenes de cocina');
    } else {
      kitchenOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.ordernumber} - ${order.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkOrders();
