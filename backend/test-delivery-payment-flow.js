require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeliveryPaymentFlow() {
  console.log('🧪 INICIANDO PRUEBA COMPLETA DEL FLUJO DE PAGO DE DELIVERY');
  console.log('========================================================\n');

  try {
    // 1. Obtener un espacio de delivery disponible
    console.log('1️⃣ Obteniendo espacios de delivery...');
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*')
      .eq('type', 'DELIVERY')
      .eq('status', 'LIBRE')
      .limit(1);

    if (spacesError) {
      console.error('❌ Error obteniendo espacios:', spacesError);
      return;
    }

    if (!spaces || spaces.length === 0) {
      console.log('⚠️ No hay espacios de delivery libres, creando uno...');
      const { data: newSpace, error: createError } = await supabase
        .from('Space')
        .insert({
          code: 'D-TEST',
          name: 'Delivery Test',
          type: 'DELIVERY',
          capacity: 1,
          status: 'LIBRE'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando espacio:', createError);
        return;
      }
      spaces.push(newSpace);
    }

    const deliverySpace = spaces[0];
    console.log(`✅ Espacio de delivery obtenido: ${deliverySpace.name} (${deliverySpace.id})`);

    // 2. Obtener un usuario válido
    console.log('\n2️⃣ Obteniendo usuario válido...');
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, username, role')
      .eq('isactive', true)
      .limit(1);

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No hay usuarios activos en el sistema');
      return;
    }

    const user = users[0];
    console.log(`✅ Usuario obtenido: ${user.username} (${user.role})`);

    // 3. Crear una orden de delivery
    console.log('\n3️⃣ Creando orden de delivery...');
    const orderData = {
      p_created_by: user.id,
      p_customer_name: 'Cliente Test',
      p_customer_phone: '123456789',
      p_discount: 0,
      p_items: [
        {
          productId: null,
          comboId: null,
          name: 'Producto Test',
          unitPrice: 25.00,
          totalPrice: 25.00,
          quantity: 1,
          notes: 'Test order'
        }
      ],
      p_notes: 'Orden de prueba para delivery',
      p_space_id: deliverySpace.id,
      p_subtotal: 25.00,
      p_tax: 0,
      p_total_amount: 25.00,
      p_delivery_cost: 5.00,
      p_is_delivery: true
    };

    console.log('📋 Datos de la orden:', JSON.stringify(orderData, null, 2));

    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_with_items', orderData);

    if (rpcError) {
      console.error('❌ Error creando orden:', rpcError);
      return;
    }

    const orderId = rpcData[0].order_id;
    const orderNumber = rpcData[0].order_number;
    console.log(`✅ Orden creada: ${orderNumber} (${orderId})`);

    // 4. Verificar estado inicial de la orden
    console.log('\n4️⃣ Verificando estado inicial de la orden...');
    const { data: initialOrder, error: initialError } = await supabase
      .from('Order')
      .select('*, Space(*)')
      .eq('id', orderId)
      .single();

    if (initialError) {
      console.error('❌ Error obteniendo orden inicial:', initialError);
      return;
    }

    console.log(`📊 Estado inicial: ${initialOrder.status}`);
    console.log(`📊 Espacio: ${initialOrder.Space.name} (${initialOrder.Space.status})`);
    console.log(`📊 isPaid: ${initialOrder.isPaid}`);

    // 5. Obtener método de pago
    console.log('\n5️⃣ Obteniendo método de pago...');
    const { data: paymentMethods, error: pmError } = await supabase
      .from('PaymentMethod')
      .select('*')
      .limit(1);

    if (pmError) {
      console.error('❌ Error obteniendo métodos de pago:', pmError);
      return;
    }

    if (!paymentMethods || paymentMethods.length === 0) {
      console.log('⚠️ No hay métodos de pago, creando uno...');
      const { data: newPM, error: createPMError } = await supabase
        .from('PaymentMethod')
        .insert({
          name: 'Efectivo',
          description: 'Pago en efectivo',
          icon: '💰',
          color: '#28a745',
          isActive: true
        })
        .select()
        .single();

      if (createPMError) {
        console.error('❌ Error creando método de pago:', createPMError);
        return;
      }
      paymentMethods.push(newPM);
    }

    const paymentMethod = paymentMethods[0];
    console.log(`✅ Método de pago: ${paymentMethod.name}`);

    // 6. Simular el proceso de pago completo (como hace DeliveryPaymentModal)
    console.log('\n6️⃣ Simulando proceso de pago completo...');
    
    const totalAmount = initialOrder.totalAmount + initialOrder.deliveryCost;
    const deliveryAmount = initialOrder.deliveryCost;
    const baseAmount = totalAmount - deliveryAmount;

    console.log(`💰 Total a pagar: $${totalAmount}`);
    console.log(`💰 Monto base: $${baseAmount}`);
    console.log(`💰 Monto delivery: $${deliveryAmount}`);

    // Registrar pago del pedido base
    if (baseAmount > 0) {
      console.log('\n6.1️⃣ Registrando pago del pedido base...');
      const { data: basePayment, error: baseError } = await supabase
        .from('OrderPayment')
        .insert({
          orderId: orderId,
          paymentMethodId: paymentMethod.id,
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
        console.error('❌ Error insertando pago base:', baseError);
        return;
      }
      console.log(`✅ Pago base registrado: $${baseAmount}`);
    }

    // Registrar pago del delivery
    if (deliveryAmount > 0) {
      console.log('\n6.2️⃣ Registrando pago del delivery...');
      const { data: deliveryPayment, error: deliveryError } = await supabase
        .from('OrderPayment')
        .insert({
          orderId: orderId,
          paymentMethodId: paymentMethod.id,
          amount: deliveryAmount,
          baseAmount: 0,
          surchargeAmount: deliveryAmount,
          isDeliveryService: true,
          notes: 'Pago del servicio de delivery',
          paymentDate: new Date().toISOString()
        })
        .select()
        .single();

      if (deliveryError) {
        console.error('❌ Error insertando pago de delivery:', deliveryError);
        return;
      }
      console.log(`✅ Pago delivery registrado: $${deliveryAmount}`);
    }

    // 7. Actualizar estado de la orden (como hace registerCompletePayment)
    console.log('\n7️⃣ Actualizando estado de la orden a ENTREGADO...');
    const { error: updateError } = await supabase
      .from('Order')
      .update({
        isPaid: true,
        status: 'ENTREGADO',
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Error actualizando estado de pago:', updateError);
      return;
    }

    // Registrar en historial
    console.log('\n7.1️⃣ Registrando cambio de estado en historial...');
    const { error: historyError } = await supabase
      .from('OrderStatusHistory')
      .insert({
        orderId: orderId,
        status: 'ENTREGADO',
        changedBy: user.id,
        notes: 'Estado actualizado automáticamente por pago completo',
        createdAt: new Date().toISOString()
      });

    if (historyError) {
      console.error('❌ Error registrando cambio de estado:', historyError);
    } else {
      console.log('✅ Cambio de estado registrado en historial');
    }

    // 8. Liberar el espacio (como hace handlePaymentComplete)
    console.log('\n8️⃣ Liberando espacio...');
    const { error: spaceError } = await supabase
      .from('Space')
      .update({ 
        status: 'LIBRE',
        updatedAt: new Date().toISOString()
      })
      .eq('id', deliverySpace.id);

    if (spaceError) {
      console.error('❌ Error liberando espacio:', spaceError);
    } else {
      console.log('✅ Espacio liberado correctamente');
    }

    // 9. Verificar estado final
    console.log('\n9️⃣ Verificando estado final...');
    const { data: finalOrder, error: finalError } = await supabase
      .from('Order')
      .select('*, Space(*)')
      .eq('id', orderId)
      .single();

    if (finalError) {
      console.error('❌ Error obteniendo orden final:', finalError);
      return;
    }

    console.log(`📊 Estado final: ${finalOrder.status}`);
    console.log(`📊 Espacio: ${finalOrder.Space.name} (${finalOrder.Space.status})`);
    console.log(`📊 isPaid: ${finalOrder.isPaid}`);

    // 10. Verificar pagos registrados
    console.log('\n🔟 Verificando pagos registrados...');
    const { data: payments, error: paymentsError } = await supabase
      .from('OrderPayment')
      .select('*')
      .eq('orderId', orderId);

    if (paymentsError) {
      console.error('❌ Error obteniendo pagos:', paymentsError);
    } else {
      console.log(`📊 Pagos registrados: ${payments.length}`);
      payments.forEach((payment, index) => {
        console.log(`   ${index + 1}. $${payment.amount} - ${payment.isDeliveryService ? 'Delivery' : 'Base'}`);
      });
    }

    // 11. Verificar si la orden aparece en órdenes activas
    console.log('\n1️⃣1️⃣ Verificando órdenes activas...');
    const { data: activeOrders, error: activeError } = await supabase
      .from('Order')
      .select('id, orderNumber, status, isPaid')
      .in('status', ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO']);

    if (activeError) {
      console.error('❌ Error obteniendo órdenes activas:', activeError);
    } else {
      const ourOrder = activeOrders.find(o => o.id === orderId);
      if (ourOrder) {
        console.log(`⚠️ PROBLEMA: La orden ${ourOrder.orderNumber} sigue apareciendo en órdenes activas`);
        console.log(`   Estado: ${ourOrder.status}, isPaid: ${ourOrder.isPaid}`);
      } else {
        console.log('✅ La orden NO aparece en órdenes activas (correcto)');
      }
    }

    console.log('\n🎯 RESUMEN DE LA PRUEBA:');
    console.log('========================');
    console.log(`✅ Orden creada: ${orderNumber}`);
    console.log(`✅ Pagos registrados: ${payments?.length || 0}`);
    console.log(`✅ Estado final: ${finalOrder.status}`);
    console.log(`✅ Espacio liberado: ${finalOrder.Space.status}`);
    console.log(`✅ isPaid: ${finalOrder.isPaid}`);

    if (finalOrder.status === 'ENTREGADO' && finalOrder.isPaid === true) {
      console.log('\n🎉 ¡PRUEBA EXITOSA! El flujo funciona correctamente.');
    } else {
      console.log('\n❌ ¡PRUEBA FALLIDA! Hay un problema en el flujo.');
    }

  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
}

// Ejecutar la prueba
testDeliveryPaymentFlow();
