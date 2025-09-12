const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRPCDirect() {
  console.log('🧪 Probando función RPC directamente...\n');

  try {
    // Probar la función RPC
    const { data: result, error } = await supabase
      .rpc('get_products_for_combo_components');

    if (error) {
      console.error('❌ Error en RPC:', error);
      console.log('\n🔧 Detalles del error:');
      console.log(`   - Código: ${error.code}`);
      console.log(`   - Mensaje: ${error.message}`);
      console.log(`   - Detalles: ${error.details}`);
      console.log(`   - Hint: ${error.hint}`);
    } else {
      console.log(`✅ RPC funcionando! Se obtuvieron ${result.length} productos`);
      if (result.length > 0) {
        console.log('\n📋 Primeros 3 productos:');
        result.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.product_name} - S/. ${product.product_price} (${product.product_category_name})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testRPCDirect();









