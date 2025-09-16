require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteBuggedOrder() {
  console.log('🗑️ ELIMINANDO ORDEN BUGUEADA ORD-20250913-0009');
  console.log('===============================================\n');

  try {
    // 1. Buscar la orden por número
    console.log('1️⃣ Buscando orden ORD-20250913-0009...');
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('orderNumber', 'ORD-20250913-0009')
      .single();

    if (orderError) {
      console.error('❌ Error buscando orden:', orderError);
      return;
    }

    if (!order) {
      console.log('⚠️ No se encontró la orden ORD-20250913-0009');
      return;
    }

    console.log(`✅ Orden encontrada: ${order.orderNumber} (${order.id})`);
    console.log(`📊 Estado: ${order.status}`);
    console.log(`📊 Espacio: ${order.spaceId}`);
    console.log(`📊 Cliente: ${order.customerName}`);

    // 2. Verificar items de la orden
    console.log('\n2️⃣ Verificando items de la orden...');
    const { data: items, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .eq('orderId', order.id);

    if (itemsError) {
      console.error('❌ Error obteniendo items:', itemsError);
      return;
    }

    console.log(`📊 Items encontrados: ${items.length}`);
    items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - Cantidad: ${item.quantity} - Precio: $${item.totalPrice}`);
    });

    // 3. Verificar historial de estados
    console.log('\n3️⃣ Verificando historial de estados...');
    const { data: history, error: historyError } = await supabase
      .from('OrderStatusHistory')
      .select('*')
      .eq('orderId', order.id);

    if (historyError) {
      console.error('❌ Error obteniendo historial:', historyError);
      return;
    }

    console.log(`📊 Entradas en historial: ${history.length}`);
    history.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.status} - ${entry.createdAt}`);
    });

    // 4. Verificar pagos
    console.log('\n4️⃣ Verificando pagos...');
    const { data: payments, error: paymentsError } = await supabase
      .from('OrderPayment')
      .select('*')
      .eq('orderId', order.id);

    if (paymentsError) {
      console.error('❌ Error obteniendo pagos:', paymentsError);
      return;
    }

    console.log(`📊 Pagos encontrados: ${payments.length}`);
    payments.forEach((payment, index) => {
      console.log(`   ${index + 1}. $${payment.amount} - ${payment.isDeliveryService ? 'Delivery' : 'Base'}`);
    });

    // 5. Verificar espacio actual
    console.log('\n5️⃣ Verificando estado del espacio...');
    const { data: space, error: spaceError } = await supabase
      .from('Space')
      .select('*')
      .eq('id', order.spaceId)
      .single();

    if (spaceError) {
      console.error('❌ Error obteniendo espacio:', spaceError);
      return;
    }

    console.log(`📊 Espacio: ${space.name} (${space.code}) - Estado: ${space.status}`);

    // 6. Confirmar eliminación
    console.log('\n6️⃣ ¿Eliminar esta orden? (S/N)');
    console.log('Esta acción eliminará:');
    console.log(`   - Orden: ${order.orderNumber}`);
    console.log(`   - ${items.length} items`);
    console.log(`   - ${history.length} entradas de historial`);
    console.log(`   - ${payments.length} pagos`);
    console.log(`   - Liberará el espacio: ${space.name}`);

    // Simular confirmación (en producción pedirías al usuario)
    const confirmDelete = true; // Cambiar a false si no quieres eliminar

    if (!confirmDelete) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }

    // 7. Eliminar en orden correcto (por foreign keys)
    console.log('\n7️⃣ Eliminando datos relacionados...');

    // Eliminar componentes de items primero
    console.log('   - Eliminando componentes de items...');
    const { error: componentsError } = await supabase
      .from('OrderItemComponent')
      .delete()
      .in('orderItemId', items.map(item => item.id));

    if (componentsError) {
      console.error('❌ Error eliminando componentes:', componentsError);
      return;
    }

    // Eliminar items
    console.log('   - Eliminando items...');
    const { error: deleteItemsError } = await supabase
      .from('OrderItem')
      .delete()
      .eq('orderId', order.id);

    if (deleteItemsError) {
      console.error('❌ Error eliminando items:', deleteItemsError);
      return;
    }

    // Eliminar pagos
    console.log('   - Eliminando pagos...');
    const { error: deletePaymentsError } = await supabase
      .from('OrderPayment')
      .delete()
      .eq('orderId', order.id);

    if (deletePaymentsError) {
      console.error('❌ Error eliminando pagos:', deletePaymentsError);
      return;
    }

    // Eliminar historial
    console.log('   - Eliminando historial...');
    const { error: deleteHistoryError } = await supabase
      .from('OrderStatusHistory')
      .delete()
      .eq('orderId', order.id);

    if (deleteHistoryError) {
      console.error('❌ Error eliminando historial:', deleteHistoryError);
      return;
    }

    // Eliminar orden
    console.log('   - Eliminando orden...');
    const { error: deleteOrderError } = await supabase
      .from('Order')
      .delete()
      .eq('id', order.id);

    if (deleteOrderError) {
      console.error('❌ Error eliminando orden:', deleteOrderError);
      return;
    }

    // 8. Liberar espacio
    console.log('\n8️⃣ Liberando espacio...');
    const { error: freeSpaceError } = await supabase
      .from('Space')
      .update({ 
        status: 'LIBRE',
        updatedAt: new Date().toISOString()
      })
      .eq('id', order.spaceId);

    if (freeSpaceError) {
      console.error('❌ Error liberando espacio:', freeSpaceError);
    } else {
      console.log(`✅ Espacio ${space.name} liberado`);
    }

    console.log('\n🎉 ¡ORDEN ELIMINADA EXITOSAMENTE!');
    console.log('================================');
    console.log(`✅ Orden ${order.orderNumber} eliminada`);
    console.log(`✅ ${items.length} items eliminados`);
    console.log(`✅ ${history.length} entradas de historial eliminadas`);
    console.log(`✅ ${payments.length} pagos eliminados`);
    console.log(`✅ Espacio ${space.name} liberado`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la eliminación
deleteBuggedOrder();

