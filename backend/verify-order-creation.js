require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function verifyOrderCreation() {
  console.log('🔍 Verificando creación de orden en la base de datos...');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Obtener la orden más reciente
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(3);

    if (ordersError) throw ordersError;

    console.log('📋 Órdenes más recientes:');
    console.log('==========================');
    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Orden ID: ${order.id}`);
      console.log(`   Número: ${order.orderNumber}`);
      console.log(`   Cliente: ${order.customerName}`);
      console.log(`   Total: $${order.totalAmount}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   Creada: ${order.createdAt}`);
    });

    // Obtener los items de la orden más reciente
    if (orders.length > 0) {
      const latestOrderId = orders[0].id;
      
      const { data: orderItems, error: itemsError } = await supabase
        .from('OrderItem')
        .select('*')
        .eq('orderid', latestOrderId);

      if (itemsError) throw itemsError;

      console.log(`\n📦 Items de la orden ${latestOrderId}:`);
      console.log('=====================================');
      if (orderItems.length > 0) {
        orderItems.forEach((item, index) => {
          console.log(`\n${index + 1}. Item ID: ${item.id}`);
          console.log(`   Producto: ${item.name}`);
          console.log(`   Cantidad: ${item.quantity}`);
          console.log(`   Precio unitario: $${item.unitprice}`);
          console.log(`   Precio total: $${item.totalprice}`);
          console.log(`   Estado: ${item.status}`);
          console.log(`   Notas: ${item.notes || 'Sin notas'}`);
        });
      } else {
        console.log('❌ No se encontraron items para esta orden');
      }

      // Verificar que el espacio se marcó como ocupado
      const { data: space, error: spaceError } = await supabase
        .from('Space')
        .select('id, name, status, "updatedAt"')
        .eq('id', orders[0].spaceId)
        .single();

      if (spaceError) throw spaceError;

      console.log(`\n🏠 Estado del espacio ${space.name}:`);
      console.log('=====================================');
      console.log(`   ID: ${space.id}`);
      console.log(`   Estado: ${space.status}`);
      console.log(`   Actualizado: ${space.updatedAt}`);
    }

    console.log('\n✅ Verificación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

verifyOrderCreation().catch(console.error);














