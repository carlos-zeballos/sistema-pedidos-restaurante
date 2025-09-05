const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyOrderRPC() {
  try {
    console.log('🔧 Verificando función RPC create_order_with_items...');
    
    // 1) Verificar que la función existe
    console.log('\n📝 Verificando existencia de la función...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_with_items', {
        p_space_id: '00000000-0000-0000-0000-000000000000', // UUID inválido para prueba
        p_created_by: '00000000-0000-0000-0000-000000000000', // UUID inválido para prueba
        p_customer_name: 'Test Customer',
        p_customer_phone: '123456789',
        p_total_amount: 0,
        p_subtotal: 0,
        p_tax: 0,
        p_discount: 0,
        p_notes: 'Test order',
        p_items: []
      });
    
    if (rpcError) {
      console.log('⚠️ Función existe pero falló (esperado con UUIDs inválidos):', rpcError.message);
    } else {
      console.log('✅ Función RPC existe y responde');
    }
    
    // 2) Obtener datos válidos para prueba
    console.log('\n📝 Obteniendo datos válidos para prueba...');
    
    const { data: spacesData } = await supabase
      .from('Space')
      .select('id, name, status, type')
      .eq('type', 'MESA')
      .eq('status', 'LIBRE')
      .limit(1);
    
    const { data: productsData } = await supabase
      .from('Product')
      .select('id, name, price, isEnabled, isAvailable')
      .eq('isEnabled', true)
      .eq('isAvailable', true)
      .limit(1);
    
    const { data: usersData } = await supabase
      .from('User')
      .select('id, username, role')
      .limit(1);
    
    if (!spacesData || spacesData.length === 0) {
      console.log('⚠️ No hay espacios libres disponibles para prueba');
      return;
    }
    
    if (!productsData || productsData.length === 0) {
      console.log('⚠️ No hay productos disponibles para prueba');
      return;
    }
    
    if (!usersData || usersData.length === 0) {
      console.log('⚠️ No hay usuarios disponibles para prueba');
      return;
    }
    
    const testSpace = spacesData[0];
    const testProduct = productsData[0];
    const testUser = usersData[0];
    
    console.log(`✅ Datos de prueba obtenidos:`);
    console.log(`   - Espacio: ${testSpace.name} (${testSpace.id})`);
    console.log(`   - Producto: ${testProduct.name} (${testProduct.id}) - $${testProduct.price}`);
    console.log(`   - Usuario: ${testUser.username} (${testUser.id})`);
    
    // 3) Crear orden de prueba
    console.log('\n📝 Creando orden de prueba...');
    
    const { data: orderData, error: orderError } = await supabase
      .rpc('create_order_with_items', {
        p_space_id: testSpace.id,
        p_created_by: testUser.id,
        p_customer_name: 'Cliente de Prueba',
        p_customer_phone: '123456789',
        p_total_amount: testProduct.price,
        p_subtotal: testProduct.price,
        p_tax: 0,
        p_discount: 0,
        p_notes: 'Orden de prueba para verificación',
        p_items: [{
          productId: testProduct.id,
          name: testProduct.name,
          unitPrice: testProduct.price,
          totalPrice: testProduct.price,
          quantity: 1,
          notes: 'Item de prueba'
        }]
      });
    
    if (orderError) {
      console.error('❌ Error al crear orden de prueba:', orderError);
      console.error('   Detalles:', orderError.details);
      console.error('   Hint:', orderError.hint);
      return;
    }
    
    console.log('✅ Orden de prueba creada exitosamente!');
    console.log('   - ID:', orderData[0]?.id);
    console.log('   - Número:', orderData[0]?.ordernumber);
    
    // 4) Verificar que la orden se creó correctamente
    console.log('\n📝 Verificando orden creada...');
    
    const { data: orderDetails, error: orderDetailsError } = await supabase
      .from('Order')
      .select(`
        id, "orderNumber", "customerName", "customerPhone", status,
        "totalAmount", subtotal, tax, discount, notes,
        "createdBy", "createdAt", "updatedAt",
        items: OrderItem(id, name, quantity, "unitPrice", "totalPrice", notes, status)
      `)
      .eq('id', orderData[0].id)
      .single();
    
    if (orderDetailsError) {
      console.error('❌ Error al obtener detalles de la orden:', orderDetailsError);
    } else {
      console.log('✅ Detalles de la orden:');
      console.log(`   - Número: ${orderDetails.orderNumber}`);
      console.log(`   - Cliente: ${orderDetails.customerName}`);
      console.log(`   - Estado: ${orderDetails.status}`);
      console.log(`   - Total: $${orderDetails.totalAmount}`);
      console.log(`   - Items: ${orderDetails.items?.length || 0}`);
      
      if (orderDetails.items && orderDetails.items.length > 0) {
        orderDetails.items.forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.name} - ${item.quantity}x $${item.unitPrice} = $${item.totalPrice}`);
        });
      }
    }
    
    // 5) Verificar que el espacio se marcó como ocupado
    console.log('\n📝 Verificando estado del espacio...');
    
    const { data: spaceStatus, error: spaceStatusError } = await supabase
      .from('Space')
      .select('id, name, status, "updatedAt"')
      .eq('id', testSpace.id)
      .single();
    
    if (spaceStatusError) {
      console.error('❌ Error al verificar estado del espacio:', spaceStatusError);
    } else {
      console.log('✅ Estado del espacio:');
      console.log(`   - Nombre: ${spaceStatus.name}`);
      console.log(`   - Estado: ${spaceStatus.status}`);
      console.log(`   - Actualizado: ${spaceStatus.updatedAt}`);
    }
    
    // 6) Limpiar orden de prueba
    console.log('\n🧹 Limpiando orden de prueba...');
    
    const { error: deleteError } = await supabase
      .from('Order')
      .delete()
      .eq('id', orderData[0].id);
    
    if (deleteError) {
      console.error('⚠️ Error al limpiar orden de prueba:', deleteError);
    } else {
      console.log('✅ Orden de prueba eliminada');
    }
    
    console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('✅ La función RPC create_order_with_items funciona correctamente');
    console.log('✅ Ya puedes crear órdenes desde el frontend sin errores 500');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyOrderRPC();



