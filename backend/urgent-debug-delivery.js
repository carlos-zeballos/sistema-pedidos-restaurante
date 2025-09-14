require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function urgentDebugDelivery() {
  console.log('🚨 DEBUGGING URGENTE - MONTOS DE DELIVERY');
  console.log('==========================================\n');

  try {
    // Buscar todas las órdenes de delivery recientes
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
      .eq('isDelivery', true)
      .eq('status', 'ENTREGADO')
      .order('createdAt', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`📋 REVISANDO ${orders.length} ÓRDENES DE DELIVERY ENTREGADAS:\n`);

    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. 📦 ORDEN: ${order.orderNumber}`);
      console.log(`   💰 Total Amount: S/ ${order.totalAmount}`);
      console.log(`   🚚 Delivery Cost: S/ ${order.deliveryCost}`);
      console.log(`   📊 Original Total: S/ ${order.originalTotal}`);
      console.log(`   📊 Final Total: S/ ${order.finalTotal}`);
      
      const deliveryPayments = order.payments.filter(p => p.isDeliveryService);
      const basePayments = order.payments.filter(p => !p.isDeliveryService);
      
      console.log(`   💳 Pagos Base (${basePayments.length}):`);
      basePayments.forEach(p => {
        console.log(`      - Método: ${p.paymentMethodId}`);
        console.log(`        Amount: S/ ${p.amount}`);
        console.log(`        Base Amount: S/ ${p.baseAmount}`);
        console.log(`        Surcharge: S/ ${p.surchargeAmount}`);
      });
      
      console.log(`   🚚 Pagos Delivery (${deliveryPayments.length}):`);
      deliveryPayments.forEach(p => {
        console.log(`      - Método: ${p.paymentMethodId}`);
        console.log(`        Amount: S/ ${p.amount}`);
        console.log(`        Base Amount: S/ ${p.baseAmount}`);
        console.log(`        Surcharge: S/ ${p.surchargeAmount}`);
      });

      // Verificar consistencia
      const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
      const totalBase = basePayments.reduce((sum, p) => sum + p.amount, 0);
      const totalDelivery = deliveryPayments.reduce((sum, p) => sum + p.amount, 0);

      console.log(`   📊 RESUMEN:`);
      console.log(`      Total Pagado: S/ ${totalPaid}`);
      console.log(`      Total Base: S/ ${totalBase}`);
      console.log(`      Total Delivery: S/ ${totalDelivery}`);
      console.log(`      Delivery Cost (Order): S/ ${order.deliveryCost}`);

      // Verificar problemas
      if (Math.abs(totalDelivery - order.deliveryCost) > 0.01) {
        console.log(`   ⚠️  PROBLEMA: Delivery pagado (${totalDelivery}) ≠ Delivery cost (${order.deliveryCost})`);
      }
      
      if (totalPaid !== order.finalTotal) {
        console.log(`   ⚠️  PROBLEMA: Total pagado (${totalPaid}) ≠ Final total (${order.finalTotal})`);
      }
    });

    // Verificar el endpoint de reportes
    console.log(`\n\n🔍 VERIFICANDO ENDPOINT DE REPORTES:`);
    console.log('=====================================');
    
    // Simular llamada al endpoint
    const { data: reportOrders, error: reportError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "createdAt",
        space:Space(name, code, type),
        "customerName",
        status,
        "originalTotal",
        "finalTotal",
        "totalAmount",
        "deliveryCost",
        payments:OrderPayment(
          method:PaymentMethod(name),
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService",
          "paymentDate"
        )
      `)
      .eq('isDelivery', true)
      .eq('status', 'ENTREGADO')
      .order('createdAt', { ascending: false })
      .limit(3);

    if (reportError) {
      console.error('❌ Error obteniendo datos para reportes:', reportError);
      return;
    }

    console.log(`\n📊 DATOS PARA REPORTES (${reportOrders.length} órdenes):`);
    reportOrders.forEach(order => {
      console.log(`\n📦 ${order.orderNumber}:`);
      console.log(`   Space: ${order.space?.name} (${order.space?.type})`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Original: S/ ${order.originalTotal}`);
      console.log(`   Final: S/ ${order.finalTotal}`);
      console.log(`   Delivery Cost: S/ ${order.deliveryCost}`);
      
      order.payments.forEach(p => {
        console.log(`   💳 ${p.method?.name}: S/ ${p.amount} (Base: ${p.baseAmount}, Surcharge: ${p.surchargeAmount}, IsDelivery: ${p.isDeliveryService})`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

urgentDebugDelivery();

