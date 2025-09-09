require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCorrectedRPC() {
  console.log('🧪 Probando RPC corregido...\n');
  
  try {
    // Obtener datos de prueba
    const { data: spaces } = await supabase
      .from('Space')
      .select('id, name, "isActive"')
      .eq('isActive', true)
      .limit(1);
    
    const { data: users } = await supabase
      .from('User')
      .select('id, username, isactive')
      .eq('isactive', true)
      .limit(1);
    
    const { data: products } = await supabase
      .from('Product')
      .select('id, name, price, "isEnabled", "isAvailable"')
      .eq('isEnabled', true)
      .eq('isAvailable', true)
      .limit(1);
    
    if (!spaces || spaces.length === 0) {
      console.error('❌ No hay espacios activos disponibles');
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ No hay usuarios activos disponibles');
      return;
    }
    
    if (!products || products.length === 0) {
      console.error('❌ No hay productos disponibles');
      return;
    }
    
    console.log('📋 Datos de prueba obtenidos:');
    console.log('  - Espacio:', spaces[0].name, '(isActive:', spaces[0].isActive, ')');
    console.log('  - Usuario:', users[0].username, '(isactive:', users[0].isactive, ')');
    console.log('  - Producto:', products[0].name, '(isEnabled:', products[0].isEnabled, ', isAvailable:', products[0].isAvailable, ')');
    
    // Crear orden de prueba
    const testOrder = {
      p_created_by: users[0].id,
      p_customer_name: 'Cliente Prueba RPC Corregido',
      p_customer_phone: '123456789',
      p_discount: 0,
      p_items: [{
        productId: products[0].id,
        quantity: 2,
        unitPrice: products[0].price,
        name: products[0].name,
        notes: 'Nota de prueba con RPC corregido'
      }],
      p_notes: 'Orden de prueba con RPC corregido para esquema real',
      p_space_id: spaces[0].id,
      p_subtotal: products[0].price * 2,
      p_tax: 0,
      p_total_amount: products[0].price * 2
    };
    
    console.log('\n🔄 Creando orden de prueba...');
    
    const { data: orderResult, error: orderError } = await supabase
      .rpc('create_order_with_items', testOrder);
    
    if (orderError) {
      console.error('❌ Error al crear orden de prueba:', orderError);
      return;
    }
    
    console.log('✅ Orden creada exitosamente:');
    console.log('  - ID:', orderResult[0].id);
    console.log('  - Número:', orderResult[0].ordernumber);
    
    // Verificar que la orden se creó correctamente
    const { data: createdOrder } = await supabase
      .from('Order')
      .select(`
        id,
        "orderNumber",
        "customerName",
        status,
        "totalAmount",
        subtotal,
        items:OrderItem(id, name, quantity, "unitPrice", "totalPrice")
      `)
      .eq('id', orderResult[0].id)
      .single();
    
    if (createdOrder) {
      console.log('\n📋 Orden verificada en base de datos:');
      console.log('  - Número:', createdOrder.orderNumber);
      console.log('  - Cliente:', createdOrder.customerName);
      console.log('  - Estado:', createdOrder.status);
      console.log('  - Total:', createdOrder.totalAmount);
      console.log('  - Items:', createdOrder.items.length);
      
      if (createdOrder.items.length > 0) {
        console.log('  - Primer item:', createdOrder.items[0].name, 'x', createdOrder.items[0].quantity);
      }
    }
    
    console.log('\n🎉 ¡RPC corregido funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

async function main() {
  console.log('🔧 Probando RPC corregido para esquema real...\n');
  
  await testCorrectedRPC();
  
  console.log('\n✨ Proceso completado');
}

main().catch(console.error);







