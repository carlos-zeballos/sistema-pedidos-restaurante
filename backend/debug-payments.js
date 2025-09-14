require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostic() {
  try {
    console.log('🔍 Ejecutando diagnóstico de órdenes y pagos...');
    
    // 1. Contar total de órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('id, orderNumber, status, totalAmount, createdAt')
      .order('createdAt', { ascending: false });
    
    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }
    
    console.log(`📊 Total de órdenes: ${orders.length}`);
    console.log('Primeras 5 órdenes:');
    orders.slice(0, 5).forEach(order => {
      console.log(`  - ${order.orderNumber}: ${order.status} - $${order.totalAmount}`);
    });
    
    // 2. Contar total de pagos
    const { data: payments, error: paymentsError } = await supabase
      .from('OrderPayment')
      .select('id, orderId, method, amount, isDelivery, paymentDate')
      .order('paymentDate', { ascending: false });
    
    if (paymentsError) {
      console.error('❌ Error obteniendo pagos:', paymentsError.message);
      return;
    }
    
    console.log(`\n💰 Total de pagos: ${payments.length}`);
    console.log('Primeros 5 pagos:');
    payments.slice(0, 5).forEach(payment => {
      console.log(`  - ${payment.method}: $${payment.amount} (Delivery: ${payment.isDelivery})`);
    });
    
    // 3. Verificar órdenes sin pagos
    const orderIds = orders.map(o => o.id);
    const paidOrderIds = [...new Set(payments.map(p => p.orderId))];
    const unpaidOrderIds = orderIds.filter(id => !paidOrderIds.includes(id));
    
    console.log(`\n❌ Órdenes sin pagos: ${unpaidOrderIds.length}`);
    if (unpaidOrderIds.length > 0) {
      console.log('Órdenes sin pagos:');
      unpaidOrderIds.forEach(id => {
        const order = orders.find(o => o.id === id);
        console.log(`  - ${order.orderNumber}: ${order.status} - $${order.totalAmount}`);
      });
    }
    
    // 4. Verificar órdenes con pagos
    console.log(`\n✅ Órdenes con pagos: ${paidOrderIds.length}`);
    
    // 5. Agrupar pagos por método
    const paymentMethods = {};
    payments.forEach(payment => {
      if (!paymentMethods[payment.method]) {
        paymentMethods[payment.method] = { count: 0, total: 0 };
      }
      paymentMethods[payment.method].count++;
      paymentMethods[payment.method].total += payment.amount;
    });
    
    console.log('\n📈 Resumen por método de pago:');
    Object.entries(paymentMethods).forEach(([method, data]) => {
      console.log(`  - ${method}: ${data.count} pagos - $${data.total.toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

runDiagnostic();
