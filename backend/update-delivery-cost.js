require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDeliveryCost() {
  console.log('🔧 ACTUALIZANDO COSTO DE DELIVERY A S/ 11.00');
  console.log('==============================================\n');

  try {
    // Actualizar el costo de delivery en todas las órdenes de delivery
    const { error: updateError } = await supabase
      .from('Order')
      .update({ deliveryCost: 11 })
      .eq('isDelivery', true);

    if (updateError) {
      console.error('❌ Error actualizando delivery cost:', updateError);
      return;
    }

    console.log('✅ Delivery cost actualizado a S/ 11.00 en todas las órdenes de delivery');

    // Verificar el resultado
    const { data: orders, error: verifyError } = await supabase
      .from('Order')
      .select('orderNumber, deliveryCost, isDelivery')
      .eq('isDelivery', true)
      .limit(5);

    if (verifyError) {
      console.error('❌ Error verificando:', verifyError);
      return;
    }

    console.log('\n🔍 VERIFICACIÓN:');
    orders.forEach(order => {
      console.log(`📦 ${order.orderNumber}: Delivery Cost = S/ ${order.deliveryCost}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateDeliveryCost();

