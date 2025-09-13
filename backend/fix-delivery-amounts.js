require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDeliveryAmounts() {
  console.log('🔧 CORRIGIENDO MONTOS DE DELIVERY');
  console.log('==================================\n');

  try {
    // Buscar la orden específica ORD-20250913-0018
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "deliveryCost",
        payments:OrderPayment(
          id,
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService"
        )
      `)
      .eq('orderNumber', 'ORD-20250913-0018');

    if (ordersError) {
      console.error('❌ Error obteniendo orden:', ordersError);
      return;
    }

    if (orders.length === 0) {
      console.log('❌ No se encontró la orden ORD-20250913-0018');
      return;
    }

    const order = orders[0];
    console.log(`📦 Orden: ${order.orderNumber}`);
    console.log(`🚚 Delivery Cost: S/ ${order.deliveryCost}`);

    // Encontrar el pago de delivery
    const deliveryPayment = order.payments.find(p => p.isDeliveryService);
    
    if (!deliveryPayment) {
      console.log('❌ No se encontró pago de delivery');
      return;
    }

    console.log(`\n🔧 CORRIGIENDO PAGO DE DELIVERY:`);
    console.log(`   Pago ID: ${deliveryPayment.id}`);
    console.log(`   Amount actual: S/ ${deliveryPayment.amount}`);
    console.log(`   Surcharge Amount actual: S/ ${deliveryPayment.surchargeAmount}`);
    console.log(`   Amount correcto: S/ ${order.deliveryCost}`);
    console.log(`   Surcharge Amount correcto: S/ ${order.deliveryCost}`);

    // Corregir el pago de delivery
    const { error: updateError } = await supabase
      .from('OrderPayment')
      .update({
        amount: order.deliveryCost,
        surchargeAmount: order.deliveryCost
      })
      .eq('id', deliveryPayment.id);

    if (updateError) {
      console.error('❌ Error actualizando pago:', updateError);
      return;
    }

    console.log(`\n✅ PAGO DE DELIVERY CORREGIDO:`);
    console.log(`   Amount: S/ ${order.deliveryCost}`);
    console.log(`   Surcharge Amount: S/ ${order.deliveryCost}`);

    // Verificar el resultado
    const { data: updatedPayment, error: verifyError } = await supabase
      .from('OrderPayment')
      .select('*')
      .eq('id', deliveryPayment.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verificando pago:', verifyError);
      return;
    }

    console.log(`\n🔍 VERIFICACIÓN:`);
    console.log(`   Amount: S/ ${updatedPayment.amount}`);
    console.log(`   Surcharge Amount: S/ ${updatedPayment.surchargeAmount}`);
    console.log(`   Base Amount: S/ ${updatedPayment.baseAmount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDeliveryAmounts();
