require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateDeliveryOrder() {
  console.log('🧪 SIMULANDO CREACIÓN DE PEDIDO DE DELIVERY');
  console.log('============================================\n');

  try {
    // 1. Buscar un espacio de delivery disponible
    const { data: deliverySpace, error: spaceError } = await supabase
      .from('Space')
      .select('*')
      .eq('type', 'DELIVERY')
      .eq('status', 'LIBRE')
      .limit(1);

    if (spaceError) {
      console.error('❌ Error obteniendo espacio de delivery:', spaceError);
      return;
    }

    if (!deliverySpace || deliverySpace.length === 0) {
      console.log('❌ No hay espacios de delivery disponibles');
      return;
    }

    const space = deliverySpace[0];
    console.log(`📍 Espacio de delivery encontrado: ${space.name} (${space.code})`);

    // 2. Buscar un usuario para crear la orden
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, firstname, lastname')
      .eq('role', 'MOZO')
      .limit(1);

    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError);
      return;
    }

    if (!user || user.length === 0) {
      console.log('❌ No hay usuarios disponibles');
      return;
    }

    const mozo = user[0];
    console.log(`👤 Usuario encontrado: ${mozo.firstname} ${mozo.lastname}`);

    // 3. Buscar un producto para agregar
    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('id, name, price')
      .eq('isAvailable', true)
      .limit(1);

    if (productError) {
      console.error('❌ Error obteniendo producto:', productError);
      return;
    }

    if (!product || product.length === 0) {
      console.log('❌ No hay productos disponibles');
      return;
    }

    const producto = product[0];
    console.log(`🍣 Producto encontrado: ${producto.name} - S/ ${producto.price}`);

    // 4. Crear la orden usando el RPC
    const orderData = {
      p_created_by: mozo.id,
      p_customer_name: 'Cliente Prueba',
      p_customer_phone: '999999999',
      p_discount: 0,
      p_items: [{
        productId: producto.id,
        name: producto.name,
        unitPrice: producto.price,
        totalPrice: producto.price,
        quantity: 1,
        notes: null
      }],
      p_notes: 'Pedido de prueba para simular delivery',
      p_space_id: space.id,
      p_subtotal: producto.price,
      p_tax: 0,
      p_total_amount: producto.price,
      p_delivery_cost: 11, // S/ 11.00 de delivery
      p_is_delivery: true
    };

    console.log('\n🚀 Creando orden con RPC...');
    console.log('Datos de la orden:', JSON.stringify(orderData, null, 2));

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('create_order_with_items', orderData);

    if (rpcError) {
      console.error('❌ Error en RPC:', rpcError);
      return;
    }

    const orderId = rpcResult[0].order_id;
    const orderNumber = rpcResult[0].order_number;

    console.log(`✅ Orden creada exitosamente:`);
    console.log(`   ID: ${orderId}`);
    console.log(`   Número: ${orderNumber}`);

    // 5. Verificar la orden creada
    const { data: createdOrder, error: orderError } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "totalAmount",
        "deliveryCost",
        "isDelivery",
        "originalTotal",
        "finalTotal"
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Error obteniendo orden creada:', orderError);
      return;
    }

    console.log('\n📋 ORDEN CREADA:');
    console.log(`   Número: ${createdOrder.orderNumber}`);
    console.log(`   Total Amount: S/ ${createdOrder.totalAmount}`);
    console.log(`   Delivery Cost: S/ ${createdOrder.deliveryCost}`);
    console.log(`   Is Delivery: ${createdOrder.isDelivery}`);
    console.log(`   Original Total: S/ ${createdOrder.originalTotal}`);
    console.log(`   Final Total: S/ ${createdOrder.finalTotal}`);

    // 6. Simular pago con monto modificado (como en la imagen)
    console.log('\n💰 SIMULANDO PAGO CON MONTO MODIFICADO:');
    console.log('   Base del pedido: S/ 29.90');
    console.log('   Delivery modificado: S/ 40.90 (en lugar de S/ 11.00)');
    console.log('   Total a pagar: S/ 70.80');

    // Simular el pago usando el servicio corregido
    const totalAmount = 70.80;
    const deliveryAmount = 40.90; // Monto modificado
    const baseAmount = totalAmount - deliveryAmount; // 29.90

    console.log('\n🔧 REGISTRANDO PAGOS SEPARADOS:');
    console.log(`   Pago Base: S/ ${baseAmount}`);
    console.log(`   Pago Delivery: S/ ${deliveryAmount}`);

    // Buscar método de pago
    const { data: paymentMethod, error: methodError } = await supabase
      .from('PaymentMethod')
      .select('id, name')
      .eq('isActive', true)
      .limit(1);

    if (methodError) {
      console.error('❌ Error obteniendo método de pago:', methodError);
      return;
    }

    const method = paymentMethod[0];
    console.log(`💳 Método de pago: ${method.name}`);

    // Registrar pago base
    const { data: basePayment, error: baseError } = await supabase
      .from('OrderPayment')
      .insert({
        orderId: orderId,
        paymentMethodId: method.id,
        amount: baseAmount,
        baseAmount: baseAmount,
        surchargeAmount: 0,
        isDeliveryService: false,
        notes: 'Pago base del pedido',
        paymentDate: new Date().toISOString()
      })
      .select()
      .single();

    if (baseError) {
      console.error('❌ Error registrando pago base:', baseError);
      return;
    }

    console.log('✅ Pago base registrado:', basePayment);

    // Registrar pago de delivery
    const { data: deliveryPayment, error: deliveryError } = await supabase
      .from('OrderPayment')
      .insert({
        orderId: orderId,
        paymentMethodId: method.id,
        amount: deliveryAmount,
        baseAmount: 0,
        surchargeAmount: deliveryAmount,
        isDeliveryService: true,
        notes: 'Pago de delivery (monto modificado)',
        paymentDate: new Date().toISOString()
      })
      .select()
      .single();

    if (deliveryError) {
      console.error('❌ Error registrando pago de delivery:', deliveryError);
      return;
    }

    console.log('✅ Pago de delivery registrado:', deliveryPayment);

    // Marcar orden como pagada
    const { error: updateError } = await supabase
      .from('Order')
      .update({
        isPaid: true,
        status: 'ENTREGADO',
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Error actualizando orden:', updateError);
      return;
    }

    console.log('✅ Orden marcada como pagada y entregada');

    // 7. Verificar resultado final
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    const { data: finalOrder, error: finalError } = await supabase
      .from('Order')
      .select(`
        "orderNumber",
        "totalAmount",
        "deliveryCost",
        payments:OrderPayment(
          amount,
          "baseAmount",
          "surchargeAmount",
          "isDeliveryService"
        )
      `)
      .eq('id', orderId)
      .single();

    if (finalError) {
      console.error('❌ Error en verificación final:', finalError);
      return;
    }

    console.log(`📦 Orden: ${finalOrder.orderNumber}`);
    console.log(`💰 Total Amount: S/ ${finalOrder.totalAmount}`);
    console.log(`🚚 Delivery Cost: S/ ${finalOrder.deliveryCost}`);
    console.log(`💳 Pagos (${finalOrder.payments.length}):`);
    
    finalOrder.payments.forEach((payment, index) => {
      console.log(`   ${index + 1}. Amount: S/ ${payment.amount}`);
      console.log(`      Base: S/ ${payment.baseAmount}`);
      console.log(`      Surcharge: S/ ${payment.surchargeAmount}`);
      console.log(`      Is Delivery: ${payment.isDeliveryService}`);
    });

    const totalPaid = finalOrder.payments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`📊 Total Pagado: S/ ${totalPaid}`);

    console.log('\n🎯 RESULTADO ESPERADO EN REPORTES:');
    console.log('   Métodos de Pago: S/ 29.90 (solo base)');
    console.log('   Delivery por Método: S/ 40.90 (solo delivery)');
    console.log('   Ventas Totales: Base S/ 29.90 + Delivery S/ 40.90');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simulateDeliveryOrder();
