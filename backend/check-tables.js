require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkTables() {
  console.log('🔍 Verificando tablas existentes en la base de datos...');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Intentar obtener datos de diferentes tablas relacionadas con órdenes
    const tables = [
      'Order',
      'OrderItem', 
      'Order_Item',
      'order_item',
      'orderitem',
      'OrderItems',
      'Order_Items'
    ];

    console.log('📋 Probando tablas relacionadas con órdenes:');
    console.log('=============================================');

    for (const tableName of tables) {
      try {
        console.log(`\n🧪 Probando tabla: ${tableName}`);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Error: ${error.message}`);
        } else {
          console.log(`✅ Tabla existe: ${tableName}`);
          if (data && data.length > 0) {
            console.log(`📄 Columnas disponibles: ${Object.keys(data[0]).join(', ')}`);
          } else {
            console.log('📄 Tabla vacía');
          }
        }
      } catch (err) {
        console.log(`❌ Excepción: ${err.message}`);
      }
    }

    // También probar con una consulta SQL directa
    console.log('\n🔍 Probando consulta SQL directa...');
    try {
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('exec_sql', { sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%order%'" });

      if (sqlError) {
        console.log('❌ Error en consulta SQL:', sqlError.message);
      } else {
        console.log('✅ Tablas encontradas con "order":', sqlData);
      }
    } catch (err) {
      console.log('❌ Error en consulta SQL:', err.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTables().catch(console.error);






