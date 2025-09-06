require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkOrderItemStructure() {
  console.log('🔍 Verificando estructura de la tabla OrderItem...');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Obtener información de la tabla OrderItem
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'OrderItem')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (error) throw error;

    console.log('📋 Estructura de la tabla OrderItem:');
    console.log('=====================================');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Verificar si existe orderId o order_id
    const orderIdColumn = columns.find(col => 
      col.column_name.toLowerCase() === 'orderid' || 
      col.column_name.toLowerCase() === 'order_id'
    );

    if (orderIdColumn) {
      console.log(`\n✅ Columna encontrada: ${orderIdColumn.column_name}`);
    } else {
      console.log('\n❌ No se encontró columna orderId o order_id');
    }

    // Mostrar algunas filas de ejemplo
    console.log('\n📄 Ejemplo de datos en OrderItem:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('OrderItem')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.log('❌ Error al obtener datos de ejemplo:', sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      console.log('Primera fila:', sampleData[0]);
    } else {
      console.log('No hay datos en la tabla OrderItem');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrderItemStructure().catch(console.error);




