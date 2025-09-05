const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTriggers() {
  console.log('🔍 Verificando triggers en la tabla Order...\n');

  try {
    // Verificar triggers en la tabla Order
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers', { table_name: 'Order' });

    if (triggersError) {
      console.log('❌ Error obteniendo triggers:', triggersError);
      
      // Intentar obtener triggers de otra manera
      const { data: queryResult, error: queryError } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .eq('event_object_table', 'Order');

      if (queryError) {
        console.log('❌ Error en consulta alternativa:', queryError);
      } else {
        console.log('✅ Triggers encontrados:', queryResult);
      }
    } else {
      console.log('✅ Triggers encontrados:', triggers);
    }

    // Intentar deshabilitar triggers temporalmente
    console.log('\n🔄 Deshabilitando triggers temporalmente...');
    
    try {
      const { error: disableError } = await supabase
        .rpc('disable_all_triggers', { table_name: 'Order' });
      
      if (disableError) {
        console.log('⚠️ No se pudieron deshabilitar triggers:', disableError);
      } else {
        console.log('✅ Triggers deshabilitados temporalmente');
      }
    } catch (e) {
      console.log('⚠️ No se pudieron deshabilitar triggers:', e.message);
    }

    // Probar inserción simple sin triggers
    console.log('\n🧪 Probando inserción simple...');
    
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;
    
    const orderData = {
      ordernumber: orderNumber,
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35',
      customername: 'Cliente Test',
      customerphone: '123456789',
      status: 'PENDIENTE',
      totalamount: 10.00,
      subtotal: 10.00,
      tax: 0,
      discount: 0,
      notes: 'Test sin triggers',
      createdby: '42d2ac16-2811-4e01-9e76-f8ab02d1aea2'
    };

    console.log('📤 Datos a insertar:', JSON.stringify(orderData, null, 2));

    const { data: order, error: orderError } = await supabase
      .from('Order')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error al crear orden:', orderError);
    } else {
      console.log('✅ Orden creada exitosamente:', order.id);
      
      // Limpiar la orden de prueba
      await supabase
        .from('Order')
        .delete()
        .eq('id', order.id);
      
      console.log('🧹 Orden de prueba eliminada');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTriggers();
