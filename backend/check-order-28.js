const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qjqjqjqjqjqjqjqjqjqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5MjA5MjAwMCwiZXhwIjoyMDA3NjY4MDAwfQ.example'
);

async function checkOrder28() {
  try {
    console.log('🔍 Buscando orden #28...');
    
    const { data: orders } = await supabase
      .from('Order')
      .select('id, orderNumber, totalAmount, deliveryCost')
      .ilike('orderNumber', '%28%')
      .limit(1);
    
    if (!orders || orders.length === 0) {
      console.log('❌ No se encontró orden #28');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Orden:', order);
    
    const { data: payments } = await supabase
      .from('OrderPayment')
      .select(`
        id, amount, baseAmount, surchargeAmount, isDeliveryService, createdAt,
        PaymentMethod (name)
      `)
      .eq('orderId', order.id);
    
    console.log('💰 Pagos:', payments?.length || 0);
    payments?.forEach((p, i) => {
      console.log(`${i + 1}. ${p.PaymentMethod?.name}: S/ ${p.amount} (Base: ${p.baseAmount}, Delivery: ${p.surchargeAmount}, isDelivery: ${p.isDeliveryService})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkOrder28();

