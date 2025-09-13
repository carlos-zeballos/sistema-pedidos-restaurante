require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderColumns() {
  console.log('🔍 VERIFICANDO COLUMNAS DE LA TABLA ORDER');
  console.log('==========================================\n');

  try {
    // Buscar cualquier orden para ver su estructura
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .limit(1);

    if (ordersError) {
      console.error('❌ Error obteniendo orden:', ordersError);
      return;
    }

    if (orders.length === 0) {
      console.log('❌ No se encontraron órdenes de delivery');
      return;
    }

    const order = orders[0];
    console.log('📋 Columnas disponibles en la tabla Order:');
    console.log('==========================================');
    
    Object.keys(order).forEach(key => {
      console.log(`- ${key}: ${order[key]}`);
    });

    // También verificar los pagos
    console.log('\n\n💳 PAGOS DE ESTA ORDEN:');
    console.log('========================');
    
    const { data: payments, error: paymentsError } = await supabase
      .from('OrderPayment')
      .select('*')
      .eq('orderId', order.id);

    if (paymentsError) {
      console.error('❌ Error obteniendo pagos:', paymentsError);
      return;
    }

    payments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Pago ID: ${payment.id}`);
      Object.keys(payment).forEach(key => {
        console.log(`   ${key}: ${payment[key]}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrderColumns();
