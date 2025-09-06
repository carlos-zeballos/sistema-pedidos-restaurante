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

async function diagnoseOrderCreation() {
  try {
    console.log('🔧 Iniciando diagnóstico de creación de órdenes...');
    
    // 1) Verificar que existe la función RPC
    console.log('\n📝 Verificando función RPC create_order_with_items...');
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
      console.log('⚠️ Función RPC existe pero falló (esperado con UUIDs inválidos):', rpcError.message);
    } else {
      console.log('✅ Función RPC existe y responde');
    }
    
    // 2) Verificar espacios disponibles
    console.log('\n📝 Verificando espacios disponibles...');
    const { data: spacesData, error: spacesError } = await supabase
      .from('Space')
      .select('id, name, status, type')
      .eq('type', 'MESA')
      .limit(5);
    
    if (spacesError) {
      console.error('❌ Error al obtener espacios:', spacesError);
      return;
    }
    
    console.log('✅ Espacios encontrados:', spacesData?.length || 0);
    spacesData?.forEach(space => {
      console.log(`   - ${space.name}: ${space.status} (${space.type})`);
    });
    
    // 3) Verificar productos disponibles
    console.log('\n📝 Verificando productos disponibles...');
    const { data: productsData, error: productsError } = await supabase
      .from('Product')
      .select('id, name, price, isEnabled, isAvailable')
      .eq('isEnabled', true)
      .eq('isAvailable', true)
      .limit(5);
    
    if (productsError) {
      console.error('❌ Error al obtener productos:', productsError);
      return;
    }
    
    console.log('✅ Productos disponibles:', productsData?.length || 0);
    productsData?.forEach(product => {
      console.log(`   - ${product.name}: $${product.price} (Habilitado: ${product.isEnabled}, Disponible: ${product.isAvailable})`);
    });
    
    // 4) Verificar usuarios disponibles (para createdBy)
    console.log('\n📝 Verificando usuarios disponibles...');
    const { data: usersData, error: usersError } = await supabase
      .from('User')
      .select('id, username, role')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error al obtener usuarios:', usersError);
      return;
    }
    
    console.log('✅ Usuarios encontrados:', usersData?.length || 0);
    usersData?.forEach(user => {
      console.log(`   - ${user.username} (${user.role}): ${user.id}`);
    });
    
    // 5) Intentar crear una orden de prueba con datos válidos
    if (spacesData && spacesData.length > 0 && productsData && productsData.length > 0 && usersData && usersData.length > 0) {
      console.log('\n📝 Intentando crear orden de prueba...');
      
      const testSpace = spacesData[0];
      const testProduct = productsData[0];
      const testUser = usersData[0];
      
      console.log(`   Usando espacio: ${testSpace.name} (${testSpace.id})`);
      console.log(`   Usando producto: ${testProduct.name} (${testProduct.id})`);
      console.log(`   Usando usuario: ${testUser.username} (${testUser.id})`);
      
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
          p_notes: 'Orden de prueba para diagnóstico',
          p_items: [{
            productId: testProduct.id,
            comboId: null,
            name: testProduct.name,
            unitPrice: testProduct.price,
            totalPrice: testProduct.price,
            quantity: 1,
            notes: null
          }]
        });
      
      if (orderError) {
        console.error('❌ Error al crear orden de prueba:', orderError);
        console.error('   Detalles del error:', orderError.details);
        console.error('   Hint:', orderError.hint);
      } else {
        console.log('✅ Orden de prueba creada exitosamente:', orderData);
        
        // Limpiar la orden de prueba
        console.log('\n🧹 Limpiando orden de prueba...');
        if (orderData && orderData[0]) {
          const { error: deleteError } = await supabase
            .from('Order')
            .delete()
            .eq('id', orderData[0].id);
          
          if (deleteError) {
            console.error('⚠️ Error al limpiar orden de prueba:', deleteError);
          } else {
            console.log('✅ Orden de prueba eliminada');
          }
        }
      }
    } else {
      console.log('⚠️ No hay suficientes datos para crear orden de prueba');
    }
    
    // 6) Verificar estructura de tablas
    console.log('\n📝 Verificando estructura de tablas...');
    
    // Verificar tabla Order
    const { data: orderStructure, error: orderStructureError } = await supabase
      .from('Order')
      .select('*')
      .limit(1);
    
    if (orderStructureError) {
      console.error('❌ Error al verificar estructura de tabla Order:', orderStructureError);
    } else {
      console.log('✅ Tabla Order accesible');
    }
    
    // Verificar tabla OrderItem
    const { data: orderItemStructure, error: orderItemStructureError } = await supabase
      .from('OrderItem')
      .select('*')
      .limit(1);
    
    if (orderItemStructureError) {
      console.error('❌ Error al verificar estructura de tabla OrderItem:', orderItemStructureError);
    } else {
      console.log('✅ Tabla OrderItem accesible');
    }
    
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

diagnoseOrderCreation();





