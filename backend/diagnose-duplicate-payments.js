const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5MjA5MjAwMCwiZXhwIjoyMDA3NjY4MDAwfQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseOrder28() {
  console.log('🔍 DIAGNÓSTICO: Pedido #28');
  
  try {
    // Buscar orden por número que contenga "28"
    const { data: orders, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .ilike('orderNumber', '%28%');
      
    if (orderError) {
      console.error('❌ Error buscando orden:', orderError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No se encontró orden con número 28');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Orden encontrada:', {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      deliveryCost: order.deliveryCost
    });
    
    // Buscar TODOS los pagos de esta orden
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
    
    console.log('💰 Pagos encontrados:', payments.length);
    payments.forEach((payment, index) => {
      console.log(`Pago ${index + 1}:`, {
        id: payment.id,
        method: payment.PaymentMethod?.name,
        amount: payment.amount,
        baseAmount: payment.baseAmount,
        surchargeAmount: payment.surchargeAmount,
        isDeliveryService: payment.isDeliveryService,
        createdAt: payment.createdAt
      });
    });
    
    // Análisis de duplicación
    console.log('\n🔍 ANÁLISIS DE DUPLICACIÓN:');
    const methodCounts = {};
    payments.forEach(payment => {
      const method = payment.PaymentMethod?.name;
      const key = `${method}_${payment.isDeliveryService}`;
      if (!methodCounts[key]) {
        methodCounts[key] = [];
      }
      methodCounts[key].push(payment);
    });
    
    Object.entries(methodCounts).forEach(([key, paymentList]) => {
      if (paymentList.length > 1) {
        console.log(`❌ DUPLICADO: ${key} aparece ${paymentList.length} veces`);
        paymentList.forEach((p, i) => {
          console.log(`  - Pago ${i + 1}: S/ ${p.amount} (ID: ${p.id})`);
        });
      } else {
        console.log(`✅ ÚNICO: ${key} aparece 1 vez`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

diagnoseOrder28();

