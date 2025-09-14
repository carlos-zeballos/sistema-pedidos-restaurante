const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qjqjqjqjqjqjqjqjqjqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5MjA5MjAwMCwiZXhwIjoyMDA3NjY4MDAwfQ.example'
);

async function findRecentOrders() {
  try {
    console.log('🔍 Buscando órdenes recientes...');
    
    const { data: orders } = await supabase
      .from('Order')
      .select('id, orderNumber, totalAmount, deliveryCost, createdAt')
      .order('createdAt', { ascending: false })
      .limit(10);
    
    console.log('📋 Últimas 10 órdenes:');
    orders?.forEach((order, i) => {
      console.log(`${i + 1}. ${order.orderNumber}: S/ ${order.totalAmount} (Delivery: ${order.deliveryCost || 0}) - ${order.createdAt}`);
    });
    
    // Buscar orden que tenga totalAmount cerca de 59.90
    const order59 = orders?.find(o => Math.abs(o.totalAmount - 59.90) < 1);
    if (order59) {
      console.log('\n🎯 Orden con monto ~59.90:', order59);
      
      const { data: payments } = await supabase
        .from('OrderPayment')
        .select(`
          id, amount, baseAmount, surchargeAmount, isDeliveryService, createdAt,
          PaymentMethod (name)
        `)
        .eq('orderId', order59.id);
      
      console.log('💰 Pagos de esta orden:', payments?.length || 0);
      payments?.forEach((p, i) => {
        console.log(`${i + 1}. ${p.PaymentMethod?.name}: S/ ${p.amount} (Base: ${p.baseAmount}, Delivery: ${p.surchargeAmount}, isDelivery: ${p.isDeliveryService})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findRecentOrders();

