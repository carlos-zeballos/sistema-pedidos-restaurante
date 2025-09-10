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

async function checkOrderStructure() {
  try {
    console.log('🔧 Verificando estructura de la tabla Order...');
    
    // Intentar obtener una orden existente para ver la estructura
    const { data: orderData, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .limit(1);
    
    if (orderError) {
      console.error('❌ Error al obtener datos de Order:', orderError);
      return;
    }
    
    if (orderData && orderData.length > 0) {
      console.log('✅ Estructura de la tabla Order:');
      const order = orderData[0];
      Object.keys(order).forEach(key => {
        console.log(`   - ${key}: ${typeof order[key]} = ${order[key]}`);
      });
    } else {
      console.log('⚠️ No hay órdenes en la tabla para verificar estructura');
      
      // Intentar insertar una orden de prueba para ver la estructura
      console.log('📝 Intentando insertar orden de prueba...');
      
      const { data: testOrder, error: testError } = await supabase
        .from('Order')
        .insert({
          "spaceId": "00000000-0000-0000-0000-000000000000",
          "customerName": "Test",
          "customerPhone": "123",
          "status": "PENDIENTE",
          "totalAmount": 0,
          "subtotal": 0,
          "tax": 0,
          "discount": 0,
          "notes": "Test",
          "createdBy": "00000000-0000-0000-0000-000000000000"
        })
        .select()
        .single();
      
      if (testError) {
        console.error('❌ Error al insertar orden de prueba:', testError);
        console.error('   Detalles:', testError.details);
        console.error('   Hint:', testError.hint);
      } else {
        console.log('✅ Orden de prueba creada:');
        Object.keys(testOrder).forEach(key => {
          console.log(`   - ${key}: ${typeof testOrder[key]} = ${testOrder[key]}`);
        });
        
        // Limpiar orden de prueba
        const { error: deleteError } = await supabase
          .from('Order')
          .delete()
          .eq('id', testOrder.id);
        
        if (deleteError) {
          console.error('⚠️ Error al limpiar orden de prueba:', deleteError);
        } else {
          console.log('✅ Orden de prueba eliminada');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkOrderStructure();








