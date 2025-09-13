require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllDeliveryOrders() {
  console.log('🔧 CORRIGIENDO TODAS LAS ÓRDENES DE DELIVERY');
  console.log('============================================\n');

  try {
    // Buscar todas las órdenes de delivery entregadas
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
      .eq('isDelivery', true)
      .eq('status', 'ENTREGADO');

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`📋 CORRIGIENDO ${orders.length} ÓRDENES DE DELIVERY:\n`);

    let totalFixed = 0;

    for (const order of orders) {
      console.log(`\n📦 Procesando: ${order.orderNumber}`);
      console.log(`   Delivery Cost: S/ ${order.deliveryCost}`);

      // Encontrar pagos de delivery
      const deliveryPayments = order.payments.filter(p => p.isDeliveryService);
      
      if (deliveryPayments.length === 0) {
        console.log('   ⚠️  Sin pagos de delivery');
        continue;
      }

      // Corregir cada pago de delivery
      for (const payment of deliveryPayments) {
        const currentAmount = payment.amount;
        const currentSurcharge = payment.surchargeAmount;
        const correctAmount = order.deliveryCost;
        const correctSurcharge = order.deliveryCost;

        console.log(`   🔧 Pago ID: ${payment.id}`);
        console.log(`      Amount: S/ ${currentAmount} → S/ ${correctAmount}`);
        console.log(`      Surcharge: S/ ${currentSurcharge} → S/ ${correctSurcharge}`);
        console.log(`      Base Amount: S/ ${payment.baseAmount} → S/ 0`);

        // Actualizar el pago
        const { error: updateError } = await supabase
          .from('OrderPayment')
          .update({
            amount: correctAmount,
            surchargeAmount: correctSurcharge,
            baseAmount: 0
          })
          .eq('id', payment.id);

        if (updateError) {
          console.error(`      ❌ Error actualizando pago:`, updateError);
        } else {
          console.log(`      ✅ Pago corregido`);
          totalFixed++;
        }
      }
    }

    console.log(`\n🎉 CORRECCIÓN COMPLETADA`);
    console.log(`📊 Total de pagos corregidos: ${totalFixed}`);

    // Verificar resultado
    console.log(`\n🔍 VERIFICACIÓN FINAL:`);
    const { data: verifyOrders, error: verifyError } = await supabase
      .from('Order')
      .select(`
        "orderNumber",
        "deliveryCost",
        payments:OrderPayment(
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService"
        )
      `)
      .eq('isDelivery', true)
      .eq('status', 'ENTREGADO')
      .limit(3);

    if (verifyError) {
      console.error('❌ Error verificando:', verifyError);
      return;
    }

    verifyOrders.forEach(order => {
      const deliveryPayments = order.payments.filter(p => p.isDeliveryService);
      console.log(`\n📦 ${order.orderNumber}:`);
      console.log(`   Delivery Cost: S/ ${order.deliveryCost}`);
      deliveryPayments.forEach(p => {
        console.log(`   Delivery Payment: S/ ${p.amount} (Base: ${p.baseAmount}, Surcharge: ${p.surchargeAmount})`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllDeliveryOrders();
