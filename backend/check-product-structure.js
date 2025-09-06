const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductStructure() {
  console.log('🔍 Verificando estructura de la tabla Product...\n');

  try {
    // Obtener información de columnas de la tabla Product
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, character_maximum_length, is_nullable')
      .eq('table_name', 'Product')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error obteniendo estructura de columnas:', columnsError);
      return;
    }

    console.log('📋 Estructura de la tabla Product:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Obtener algunos productos de ejemplo
    console.log('\n📦 Productos de ejemplo:');
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, code, name, price, description, "categoryId"')
      .limit(3);

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError);
      return;
    }

    products.forEach(product => {
      console.log(`   - ${product.name} (${product.code}) - S/. ${product.price}`);
      console.log(`     Descripción: "${product.description}"`);
      console.log(`     Categoría: ${product.categoryId}`);
    });

    // Probar la función RPC directamente
    console.log('\n🧪 Probando función RPC directamente...');
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('get_products_for_combo_components');

    if (rpcError) {
      console.error('❌ Error en RPC:', rpcError);
    } else {
      console.log(`✅ RPC funcionando! Se obtuvieron ${rpcResult.length} productos`);
      if (rpcResult.length > 0) {
        console.log('📋 Primer producto:');
        const first = rpcResult[0];
        console.log(`   - ID: ${first.product_id}`);
        console.log(`   - Código: ${first.product_code}`);
        console.log(`   - Nombre: ${first.product_name}`);
        console.log(`   - Precio: ${first.product_price}`);
        console.log(`   - Categoría: ${first.product_category_name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkProductStructure();


