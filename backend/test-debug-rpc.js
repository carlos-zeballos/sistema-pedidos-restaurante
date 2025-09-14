// Test para probar la RPC de debugging
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testDebugRPC() {
  console.log('🧪 Iniciando test de RPC de debugging...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // 1. Primero ejecutar la RPC de debugging
    console.log('\n📝 Ejecutando RPC de debugging...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_with_items_debug', {
        p_space_id: '216489b8-a77e-4ecc-9c8a-89cb25e4dfe8', // BARRA1
        p_created_by: '42d2ac16-2811-4e01-9e76-f8ab02d1aea2', // admin
        p_customer_name: 'Test Debug',
        p_customer_phone: '999999999',
        p_total_amount: 85.80,
        p_subtotal: 85.80,
        p_tax: 0,
        p_discount: 0,
        p_notes: 'Test de debugging',
        p_items: [
          {
            productId: 'product-acevichado',
            comboId: null,
            name: 'Acevichado',
            unitPrice: 25.90,
            totalPrice: 25.90,
            quantity: 1,
            notes: ''
          },
          {
            productId: null,
            comboId: 'combo-bento3',
            name: 'Bento 3',
            unitPrice: 59.90,
            totalPrice: 59.90,
            quantity: 1,
            notes: '{"selectedComponents":{"SABOR":[{"name":"Parrillero","quantity":1},{"name":"Shiro","quantity":1}]}}'
          }
        ],
        p_delivery_cost: 0,
        p_is_delivery: false
      });

    if (rpcError) {
      console.error('❌ Error en RPC:', rpcError);
      return;
    }

    console.log('✅ RPC ejecutada exitosamente:', rpcData);

    // 2. Consultar la orden creada
    const orderId = rpcData[0].id;
    console.log('\n🔍 Consultando orden creada:', orderId);

    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          components:OrderItemComponent(*)
        ),
        space:Space(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('❌ Error consultando orden:', orderError);
      return;
    }

    console.log('\n📋 Datos de la orden consultada:');
    console.log(`   Orden: ${order.orderNumber}`);
    console.log(`   Total: $${order.totalAmount}`);
    console.log(`   Subtotal: $${order.subtotal}`);

    console.log('\n📦 Items de la orden:');
    order.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      - Cantidad: x${item.quantity}`);
      console.log(`      - Precio unitario: $${item.unitPrice}`);
      console.log(`      - Precio total: $${item.totalPrice}`);
      console.log(`      - Product ID: ${item.productId}`);
      console.log(`      - Combo ID: ${item.comboId}`);
    });

    // 3. Calcular total original
    const totalOriginal = order.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);

    console.log('\n💰 Cálculos:');
    console.log(`   Total Original: $${totalOriginal.toFixed(2)}`);
    console.log(`   Total de la orden: $${order.totalAmount}`);

    // 4. Limpiar - eliminar la orden de prueba
    console.log('\n🧹 Limpiando orden de prueba...');
    await supabase.from('OrderItem').delete().eq('orderId', orderId);
    await supabase.from('Order').delete().eq('id', orderId);
    await supabase.from('Space').update({ status: 'DISPONIBLE' }).eq('id', '216489b8-a77e-4ecc-9c8a-89cb25e4dfe8');

    console.log('✅ Test completado');

  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testDebugRPC();







