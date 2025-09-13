require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugItemStructure() {
  console.log('🔍 Verificando estructura de items...\n');

  try {
    // Obtener algunos items de ejemplo
    const { data: items, error } = await supabase
      .from('OrderItem')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error obteniendo items:', error.message);
      return;
    }

    console.log('📦 ESTRUCTURA DE ITEMS:');
    console.log('=' .repeat(50));
    
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. Item ID: ${item.id}`);
      console.log(`   Nombre: ${item.name}`);
      console.log(`   Cantidad: ${item.quantity}`);
      console.log(`   Precio unitario: ${item.unitprice}`);
      console.log(`   Precio total: ${item.totalprice}`);
      console.log(`   Orden ID: ${item.orderid}`);
      console.log(`   Creado: ${item.createdat}`);
    });

    console.log('\n🔍 CAMPOS DISPONIBLES:');
    if (items.length > 0) {
      const firstItem = items[0];
      console.log('   Campos en la BD:');
      Object.keys(firstItem).forEach(key => {
        console.log(`   - ${key}: ${typeof firstItem[key]} = ${firstItem[key]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

debugItemStructure();










