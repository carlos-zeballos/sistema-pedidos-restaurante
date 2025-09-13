require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrder0018() {
  console.log('🔍 DEBUGGING ORDEN ORD-20250913-0018');
  console.log('====================================\n');

  try {
    // Buscar la orden específica ORD-20250913-0018
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "totalAmount",
        "deliveryCost",
        "originalTotal",
        "finalTotal",
        "isDelivery",
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
    console.log(`💰 Total Amount: S/ ${order.totalAmount}`);
    console.log(`🚚 Delivery Cost: S/ ${order.deliveryCost}`);
    console.log(`📊 Original Total: S/ ${order.originalTotal}`);
    console.log(`📊 Final Total: S/ ${order.finalTotal}`);
    console.log(`🚚 Is Delivery: ${order.isDelivery}`);
    console.log(`💳 Pagos (${order.payments.length}):`);
    
    order.payments.forEach((payment, index) => {
      console.log(`\n  ${index + 1}. Pago ID: ${payment.id}`);
      console.log(`     Método: ${payment.paymentMethodId}`);
      console.log(`     Amount: S/ ${payment.amount}`);
      console.log(`     Base Amount: S/ ${payment.baseAmount}`);
      console.log(`     Surcharge Amount: S/ ${payment.surchargeAmount}`);
      console.log(`     Is Delivery Service: ${payment.isDeliveryService}`);
      console.log(`     Fecha: ${payment.paymentDate}`);
    });

    // Calcular totales
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalBase = order.payments.filter(p => !p.isDeliveryService).reduce((sum, p) => sum + p.amount, 0);
    const totalDelivery = order.payments.filter(p => p.isDeliveryService).reduce((sum, p) => sum + p.amount, 0);

    console.log(`\n📊 RESUMEN:`);
    console.log(`💰 Total Pagado: S/ ${totalPaid}`);
    console.log(`💳 Total Base: S/ ${totalBase}`);
    console.log(`🚚 Total Delivery: S/ ${totalDelivery}`);
    console.log(`🚚 Delivery Cost (Order): S/ ${order.deliveryCost}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugOrder0018();
