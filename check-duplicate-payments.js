require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicatePayments() {
  console.log('🔍 VERIFICANDO PAGOS DUPLICADOS');
  console.log('================================\n');

  try {
    // Buscar órdenes con múltiples pagos del mismo método
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "totalAmount",
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
      .eq('status', 'ENTREGADO')
      .order('createdAt', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`📋 Revisando ${orders.length} órdenes entregadas...\n`);

    orders.forEach(order => {
      console.log(`\n📦 Orden: ${order.orderNumber}`);
      console.log(`💰 Total: S/ ${order.totalAmount}`);
      
      if (order.payments && order.payments.length > 0) {
        console.log(`💳 Pagos (${order.payments.length}):`);
        
        // Agrupar pagos por método
        const paymentsByMethod = {};
        order.payments.forEach(payment => {
          const methodId = payment.paymentMethodId;
          if (!paymentsByMethod[methodId]) {
            paymentsByMethod[methodId] = [];
          }
          paymentsByMethod[methodId].push(payment);
        });

        // Verificar duplicaciones
        Object.keys(paymentsByMethod).forEach(methodId => {
          const methodPayments = paymentsByMethod[methodId];
          if (methodPayments.length > 1) {
            console.log(`  ⚠️  DUPLICADO: Método ${methodId} tiene ${methodPayments.length} pagos:`);
            methodPayments.forEach((payment, index) => {
              console.log(`    ${index + 1}. S/ ${payment.amount} (Base: ${payment.baseAmount}, Delivery: ${payment.surchargeAmount})`);
            });
          } else {
            const payment = methodPayments[0];
            console.log(`  ✅ Método ${methodId}: S/ ${payment.amount} (Base: ${payment.baseAmount}, Delivery: ${payment.surchargeAmount})`);
          }
        });
      } else {
        console.log('  ❌ Sin pagos registrados');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDuplicatePayments();

