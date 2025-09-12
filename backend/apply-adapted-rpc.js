require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAdaptedRPC() {
  console.log('🚀 Aplicando RPC adaptado a la base de datos...');
  
  try {
    // Leer el archivo SQL
    const fs = require('fs');
    const sqlContent = fs.readFileSync('./adapted-order-rpc.sql', 'utf8');
    
    console.log('📄 Contenido del archivo SQL cargado');
    
    // Aplicar el SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error al aplicar SQL:', error);
      return;
    }
    
    console.log('✅ RPC adaptado aplicado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testAdaptedRPC() {
  console.log('\n🧪 Probando RPC adaptado...');
  
  try {
    // Obtener datos de prueba
    const { data: spaces } = await supabase
      .from('Space')
      .select('id, name, "isActive"')
      .eq('isActive', true)
      .limit(1);
    
    const { data: users } = await supabase
      .from('User')
      .select('id, username, "isActive"')
      .eq('isActive', true)
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
    console.log('  - Espacio:', spaces[0].name);
    console.log('  - Usuario:', users[0].username);
    console.log('  - Producto:', products[0].name);
    
    // Crear orden de prueba
    const testOrder = {
      p_created_by: users[0].id,
      p_customer_name: 'Cliente Prueba',
      p_customer_phone: '123456789',
      p_discount: 0,
      p_items: [{
        productId: products[0].id,
        quantity: 2,
        unitPrice: products[0].price,
        name: products[0].name,
        notes: 'Nota de prueba'
      }],
      p_notes: 'Orden de prueba con RPC adaptado',
      p_space_id: spaces[0].id,
      p_subtotal: products[0].price * 2,
      p_tax: 0,
      p_total_amount: products[0].price * 2
    };
    
    console.log('🔄 Creando orden de prueba...');
    
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
      console.log('📋 Orden verificada en base de datos:');
      console.log('  - Número:', createdOrder.orderNumber);
      console.log('  - Cliente:', createdOrder.customerName);
      console.log('  - Estado:', createdOrder.status);
      console.log('  - Total:', createdOrder.totalAmount);
      console.log('  - Items:', createdOrder.items.length);
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

async function main() {
  console.log('🔧 Iniciando aplicación de RPC adaptado...\n');
  
  await applyAdaptedRPC();
  await testAdaptedRPC();
  
  console.log('\n✨ Proceso completado');
}

main().catch(console.error);












