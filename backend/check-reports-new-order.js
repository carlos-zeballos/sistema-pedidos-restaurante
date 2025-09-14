require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReportsNewOrder() {
  console.log('📊 VERIFICANDO REPORTES CON NUEVA ORDEN');
  console.log('======================================\n');

  try {
    // Verificar la nueva orden creada
    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "totalAmount",
        "deliveryCost",
        "isDelivery",
        "originalTotal",
        "finalTotal",
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
      .eq('orderNumber', 'ORD-20250913-0022')
      .single();

    if (orderError) {
      console.error('❌ Error obteniendo nueva orden:', orderError);
      return;
    }

    console.log(`📦 NUEVA ORDEN: ${newOrder.orderNumber}`);
    console.log(`💰 Total Amount: S/ ${newOrder.totalAmount}`);
    console.log(`🚚 Delivery Cost: S/ ${newOrder.deliveryCost}`);
    console.log(`🚚 Is Delivery: ${newOrder.isDelivery}`);
    console.log(`📊 Original Total: S/ ${newOrder.originalTotal}`);
    console.log(`📊 Final Total: S/ ${newOrder.finalTotal}`);
    console.log(`💳 Pagos (${newOrder.payments.length}):`);
    
    newOrder.payments.forEach((payment, index) => {
      console.log(`\n  ${index + 1}. Pago ID: ${payment.id}`);
      console.log(`     Método: ${payment.paymentMethodId}`);
      console.log(`     Amount: S/ ${payment.amount}`);
      console.log(`     Base Amount: S/ ${payment.baseAmount}`);
      console.log(`     Surcharge Amount: S/ ${payment.surchargeAmount}`);
      console.log(`     Is Delivery Service: ${payment.isDeliveryService}`);
      console.log(`     Fecha: ${payment.paymentDate}`);
    });

    const totalPaid = newOrder.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalBase = newOrder.payments.filter(p => !p.isDeliveryService).reduce((sum, p) => sum + p.amount, 0);
    const totalDelivery = newOrder.payments.filter(p => p.isDeliveryService).reduce((sum, p) => sum + p.amount, 0);

    console.log(`\n📊 RESUMEN:`);
    console.log(`💰 Total Pagado: S/ ${totalPaid}`);
    console.log(`💳 Total Base: S/ ${totalBase}`);
    console.log(`🚚 Total Delivery: S/ ${totalDelivery}`);

    // Simular cómo se vería en los reportes
    console.log(`\n📈 CÓMO SE VERÁ EN LOS REPORTES:`);
    console.log(`\n1. VENTAS TOTALES:`);
    console.log(`   Orden: ${newOrder.orderNumber}`);
    console.log(`   Original: S/ ${newOrder.originalTotal}`);
    console.log(`   Final: S/ ${newOrder.finalTotal}`);
    console.log(`   Pagado: S/ ${totalPaid}`);
    console.log(`   Fee Delivery: S/ ${totalDelivery}`);
    console.log(`   Pagos:`);
    newOrder.payments.forEach(p => {
      const methodName = p.isDeliveryService ? 'PEDIDOSYA (Delivery)' : 'PEDIDOSYA';
      console.log(`     ${methodName}: S/ ${p.amount}`);
    });

    console.log(`\n2. MÉTODOS DE PAGO:`);
    console.log(`   PEDIDOSYA: S/ ${totalBase} (solo base, sin delivery)`);

    console.log(`\n3. DELIVERY POR MÉTODO:`);
    console.log(`   PEDIDOSYA: S/ ${totalDelivery} (solo delivery)`);

    // Verificar otras órdenes recientes para comparar
    console.log(`\n\n🔍 COMPARANDO CON OTRAS ÓRDENES RECIENTES:`);
    const { data: recentOrders, error: recentError } = await supabase
      .from('Order')
      .select(`
        "orderNumber",
        "totalAmount",
        "deliveryCost",
        payments:OrderPayment(
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService"
        )
      `)
      .eq('status', 'ENTREGADO')
      .order('createdAt', { ascending: false })
      .limit(3);

    if (recentError) {
      console.error('❌ Error obteniendo órdenes recientes:', recentError);
      return;
    }

    recentOrders.forEach(order => {
      const deliveryPayments = order.payments.filter(p => p.isDeliveryService);
      const basePayments = order.payments.filter(p => !p.isDeliveryService);
      
      const totalBase = basePayments.reduce((sum, p) => sum + p.amount, 0);
      const totalDelivery = deliveryPayments.reduce((sum, p) => sum + p.amount, 0);
      
      console.log(`\n📦 ${order.orderNumber}:`);
      console.log(`   Total Amount: S/ ${order.totalAmount}`);
      console.log(`   Delivery Cost: S/ ${order.deliveryCost}`);
      console.log(`   Pagos Base: S/ ${totalBase}`);
      console.log(`   Pagos Delivery: S/ ${totalDelivery}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkReportsNewOrder();

