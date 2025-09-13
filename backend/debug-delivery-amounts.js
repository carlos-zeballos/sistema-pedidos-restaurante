require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDeliveryAmounts() {
  console.log('🔍 DEBUGGING MONTOS DE DELIVERY');
  console.log('================================\n');

  try {
    // Buscar la orden específica ORD-20250913-0018
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "totalAmount",
        "deliveryAmount",
        payments:OrderPayment(
          id,
          "paymentMethodId",
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService",
          "paymentDate"
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
    console.log(`💰 Total Orden: S/ ${order.totalAmount}`);
    console.log(`🚚 Delivery Amount (Order): S/ ${order.deliveryAmount}`);
    console.log(`💳 Pagos (${order.payments.length}):`);
    
    order.payments.forEach((payment, index) => {
      console.log(`\n  ${index + 1}. Pago ID: ${payment.id}`);
      console.log(`     Método: ${payment.paymentMethodId}`);
      console.log(`     Amount: S/ ${payment.amount}`);
      console.log(`     Base Amount: S/ ${payment.baseAmount}`);
      console.log(`     Surcharge Amount: S/ ${payment.surchargeAmount}`);
      console.log(`     Is Delivery: ${payment.isDeliveryService}`);
      console.log(`     Fecha: ${payment.paymentDate}`);
    });

    // También buscar otras órdenes de delivery recientes
    console.log('\n\n🔍 OTRAS ÓRDENES DE DELIVERY RECIENTES:');
    console.log('==========================================\n');

    const { data: recentOrders, error: recentError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "totalAmount",
        "deliveryAmount",
        payments:OrderPayment(
          id,
          "paymentMethodId",
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService"
        )
      `)
      .eq('spaceType', 'DELIVERY')
      .eq('status', 'ENTREGADO')
      .order('createdAt', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('❌ Error obteniendo órdenes recientes:', recentError);
      return;
    }

    recentOrders.forEach(order => {
      console.log(`\n📦 ${order.orderNumber}`);
      console.log(`💰 Total: S/ ${order.totalAmount}`);
      console.log(`🚚 Delivery Amount: S/ ${order.deliveryAmount}`);
      
      const deliveryPayments = order.payments.filter(p => p.isDeliveryService);
      const basePayments = order.payments.filter(p => !p.isDeliveryService);
      
      console.log(`💳 Pagos Base (${basePayments.length}):`);
      basePayments.forEach(p => {
        console.log(`   - S/ ${p.amount} (Base: ${p.baseAmount})`);
      });
      
      console.log(`🚚 Pagos Delivery (${deliveryPayments.length}):`);
      deliveryPayments.forEach(p => {
        console.log(`   - S/ ${p.amount} (Surcharge: ${p.surchargeAmount})`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDeliveryAmounts();
