require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicatePayments() {
  console.log('🧹 LIMPIANDO PAGOS DUPLICADOS');
  console.log('==============================\n');

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
      .order('createdAt', { ascending: false });

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError);
      return;
    }

    console.log(`📋 Procesando ${orders.length} órdenes entregadas...\n`);

    let totalCleaned = 0;

    for (const order of orders) {
      if (!order.payments || order.payments.length <= 1) {
        continue; // No hay duplicados
      }

      console.log(`\n📦 Procesando orden: ${order.orderNumber}`);
      
      // Agrupar pagos por método
      const paymentsByMethod = {};
      order.payments.forEach(payment => {
        const methodId = payment.paymentMethodId;
        if (!paymentsByMethod[methodId]) {
          paymentsByMethod[methodId] = [];
        }
        paymentsByMethod[methodId].push(payment);
      });

      // Limpiar duplicados por método
      for (const [methodId, methodPayments] of Object.entries(paymentsByMethod)) {
        if (methodPayments.length > 1) {
          console.log(`  🔧 Limpiando método ${methodId} (${methodPayments.length} pagos)`);
          
          // Ordenar por fecha (mantener el más reciente)
          methodPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
          
          // Mantener el primer pago (más reciente) y eliminar los demás
          const keepPayment = methodPayments[0];
          const deletePayments = methodPayments.slice(1);
          
          console.log(`    ✅ Manteniendo: S/ ${keepPayment.amount} (${keepPayment.paymentDate})`);
          
          for (const payment of deletePayments) {
            console.log(`    🗑️  Eliminando: S/ ${payment.amount} (${payment.paymentDate})`);
            
            const { error: deleteError } = await supabase
              .from('OrderPayment')
              .delete()
              .eq('id', payment.id);
              
            if (deleteError) {
              console.error(`    ❌ Error eliminando pago ${payment.id}:`, deleteError);
            } else {
              totalCleaned++;
            }
          }
        }
      }
    }

    console.log(`\n🎉 LIMPIEZA COMPLETADA`);
    console.log(`📊 Total de pagos duplicados eliminados: ${totalCleaned}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanDuplicatePayments();
