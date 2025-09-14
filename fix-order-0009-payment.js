require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrderPayment() {
  console.log('🔧 ARREGLANDO ORDEN ORD-20250913-0009');
  console.log('=====================================\n');

  try {
    // 1. Buscar la orden
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

    console.log(`✅ Orden encontrada: ${order.orderNumber}`);
    console.log(`📊 Estado actual: ${order.status}`);
    console.log(`📊 Pagado actual: ${order.isPaid || false}`);
    console.log(`📊 Cliente: ${order.customerName}`);
    console.log(`📊 Total: $${order.totalAmount}`);

    // 2. Verificar si ya tiene pagos registrados
    console.log('\n2️⃣ Verificando pagos existentes...');
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
      console.log(`   ${index + 1}. $${payment.amount} - ${payment.isDeliveryService ? 'Delivery' : 'Base'} - ${payment.createdAt}`);
    });

    // 3. Si no tiene pagos, crear uno
    if (payments.length === 0) {
      console.log('\n3️⃣ No hay pagos registrados. Creando pago...');
      
      const { data: newPayment, error: paymentError } = await supabase
        .from('OrderPayment')
        .insert({
          orderId: order.id,
          amount: order.totalAmount,
          paymentMethod: 'EFECTIVO',
          isDeliveryService: order.spaceId ? (await supabase.from('Space').select('type').eq('id', order.spaceId).single()).data?.type === 'DELIVERY' : false,
          notes: 'Pago registrado automáticamente',
          createdAt: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) {
        console.error('❌ Error creando pago:', paymentError);
        return;
      }

      console.log(`✅ Pago creado: $${newPayment.amount}`);
    } else {
      console.log('\n3️⃣ Ya tiene pagos registrados. Continuando...');
    }

    // 4. Marcar la orden como pagada
    console.log('\n4️⃣ Marcando orden como pagada...');
    const { error: updateError } = await supabase
      .from('Order')
      .update({
        isPaid: true,
        updatedAt: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error actualizando orden:', updateError);
      return;
    }

    console.log('✅ Orden marcada como pagada (isPaid: true)');

    // 5. Liberar el espacio si es necesario
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

    if (space.status !== 'LIBRE') {
      console.log('   - Liberando espacio...');
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
    } else {
      console.log('   - Espacio ya está libre');
    }

    // 6. Verificar resultado final
    console.log('\n6️⃣ Verificando resultado final...');
    const { data: finalOrder, error: finalError } = await supabase
      .from('Order')
      .select('*')
      .eq('orderNumber', 'ORD-20250913-0009')
      .single();

    if (finalError) {
      console.error('❌ Error verificando resultado:', finalError);
      return;
    }

    console.log('\n🎉 ¡ORDEN ARREGLADA EXITOSAMENTE!');
    console.log('==================================');
    console.log(`✅ Orden: ${finalOrder.orderNumber}`);
    console.log(`✅ Estado: ${finalOrder.status}`);
    console.log(`✅ Pagado: ${finalOrder.isPaid}`);
    console.log(`✅ Espacio: ${space.name} - ${space.status}`);
    console.log('\n📋 La orden ahora debería desaparecer de la vista de mozos');
    console.log('   porque tiene isPaid: true y status: ENTREGADO');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la corrección
fixOrderPayment();

