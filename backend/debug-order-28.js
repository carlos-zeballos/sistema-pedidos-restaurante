const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5NDU2Nzg5MCwiZXhwIjoyMDEwMTQzODkwfQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrder28() {
  console.log('🔍 Investigando pedido #28...\n');

  try {
    // 1. Buscar la orden #28
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('orderNumber', 'ORD-20250913-0028')
      .single();

    if (orderError) {
      console.error('❌ Error buscando orden:', orderError);
      return;
    }

    if (!order) {
      console.log('❌ Orden #28 no encontrada');
      return;
    }

    console.log('📋 ORDEN #28:');
    console.log(`   ID: ${order.id}`);
    console.log(`   Número: ${order.orderNumber}`);
    console.log(`   Total: S/ ${order.totalAmount}`);
    console.log(`   Delivery Cost: S/ ${order.deliveryCost || 0}`);
    console.log(`   Estado: ${order.status}`);
    console.log(`   Pagado: ${order.isPaid}`);
    console.log(`   Tipo de espacio: ${order.spaceType}`);
    console.log('');

    // 2. Buscar TODOS los pagos de esta orden
    const { data: payments, error: paymentsError } = await supabase
      .from('OrderPayment')
      .select(`
        *,
        PaymentMethod (
          name,
          icon,
          color
        )
      `)
      .eq('orderId', order.id)
      .order('createdAt', { ascending: true });

    if (paymentsError) {
      console.error('❌ Error buscando pagos:', paymentsError);
      return;
    }

    console.log(`💰 PAGOS REGISTRADOS (${payments.length}):`);
    payments.forEach((payment, index) => {
      console.log(`   ${index + 1}. Método: ${payment.PaymentMethod?.name || 'N/A'}`);
      console.log(`      Amount: S/ ${payment.amount}`);
      console.log(`      Base Amount: S/ ${payment.baseAmount || 0}`);
      console.log(`      Surcharge Amount: S/ ${payment.surchargeAmount || 0}`);
      console.log(`      Is Delivery: ${payment.isDeliveryService}`);
      console.log(`      Fecha: ${payment.paymentDate}`);
      console.log(`      Notas: ${payment.notes || 'N/A'}`);
      console.log('');
    });

    // 3. Análisis de duplicación
    console.log('🔍 ANÁLISIS DE DUPLICACIÓN:');
    
    const basePayments = payments.filter(p => !p.isDeliveryService);
    const deliveryPayments = payments.filter(p => p.isDeliveryService);
    
    console.log(`   Pagos base: ${basePayments.length}`);
    console.log(`   Pagos delivery: ${deliveryPayments.length}`);
    
    if (basePayments.length > 1) {
      console.log('   ⚠️  DUPLICACIÓN DETECTADA en pagos base!');
      basePayments.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.PaymentMethod?.name}: S/ ${p.amount}`);
      });
    }
    
    if (deliveryPayments.length > 1) {
      console.log('   ⚠️  DUPLICACIÓN DETECTADA en pagos delivery!');
      deliveryPayments.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.PaymentMethod?.name}: S/ ${p.amount}`);
      });
    }

    // 4. Verificar si hay pagos duplicados exactos
    const paymentGroups = {};
    payments.forEach(payment => {
      const key = `${payment.paymentMethodId}-${payment.amount}-${payment.isDeliveryService}`;
      if (!paymentGroups[key]) {
        paymentGroups[key] = [];
      }
      paymentGroups[key].push(payment);
    });

    console.log('\n🔍 GRUPOS DE PAGOS IDÉNTICOS:');
    Object.entries(paymentGroups).forEach(([key, group]) => {
      if (group.length > 1) {
        console.log(`   ⚠️  DUPLICADO: ${key} (${group.length} veces)`);
        group.forEach((p, i) => {
          console.log(`      ${i + 1}. ID: ${p.id}, Fecha: ${p.paymentDate}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugOrder28();

