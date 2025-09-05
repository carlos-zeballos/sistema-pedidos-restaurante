require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseDatabaseSchema() {
  console.log('🔍 Diagnóstico del esquema de base de datos...\n');
  
  try {
    // Verificar estructura de la tabla Order
    console.log('📋 Verificando estructura de tabla Order...');
    const { data: orderColumns, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .limit(1);
    
    if (orderError) {
      console.error('❌ Error al acceder a tabla Order:', orderError);
    } else {
      console.log('✅ Tabla Order accesible');
      if (orderColumns && orderColumns.length > 0) {
        const sampleOrder = orderColumns[0];
        console.log('📝 Columnas disponibles:', Object.keys(sampleOrder));
      }
    }
    
    // Verificar estructura de la tabla User
    console.log('\n📋 Verificando estructura de tabla User...');
    const { data: userColumns, error: userError } = await supabase
      .from('User')
      .select('*')
      .limit(1);
    
    if (userError) {
      console.error('❌ Error al acceder a tabla User:', userError);
    } else {
      console.log('✅ Tabla User accesible');
      if (userColumns && userColumns.length > 0) {
        const sampleUser = userColumns[0];
        console.log('📝 Columnas disponibles:', Object.keys(sampleUser));
      }
    }
    
    // Verificar estructura de la tabla Space
    console.log('\n📋 Verificando estructura de tabla Space...');
    const { data: spaceColumns, error: spaceError } = await supabase
      .from('Space')
      .select('*')
      .limit(1);
    
    if (spaceError) {
      console.error('❌ Error al acceder a tabla Space:', spaceError);
    } else {
      console.log('✅ Tabla Space accesible');
      if (spaceColumns && spaceColumns.length > 0) {
        const sampleSpace = spaceColumns[0];
        console.log('📝 Columnas disponibles:', Object.keys(sampleSpace));
      }
    }
    
    // Verificar estructura de la tabla Product
    console.log('\n📋 Verificando estructura de tabla Product...');
    const { data: productColumns, error: productError } = await supabase
      .from('Product')
      .select('*')
      .limit(1);
    
    if (productError) {
      console.error('❌ Error al acceder a tabla Product:', productError);
    } else {
      console.log('✅ Tabla Product accesible');
      if (productColumns && productColumns.length > 0) {
        const sampleProduct = productColumns[0];
        console.log('📝 Columnas disponibles:', Object.keys(sampleProduct));
      }
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

async function testExistingRPC() {
  console.log('\n🧪 Probando RPC existente...');
  
  try {
    // Obtener datos de prueba
    const { data: spaces } = await supabase
      .from('Space')
      .select('id, name')
      .limit(1);
    
    const { data: users } = await supabase
      .from('User')
      .select('id, username')
      .limit(1);
    
    const { data: products } = await supabase
      .from('Product')
      .select('id, name, price')
      .limit(1);
    
    if (!spaces || spaces.length === 0) {
      console.error('❌ No hay espacios disponibles');
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ No hay usuarios disponibles');
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
      p_notes: 'Orden de prueba',
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
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

async function main() {
  console.log('🔧 Iniciando diagnóstico y prueba...\n');
  
  await diagnoseDatabaseSchema();
  await testExistingRPC();
  
  console.log('\n✨ Proceso completado');
}

main().catch(console.error);



