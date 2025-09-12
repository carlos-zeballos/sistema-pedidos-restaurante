require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixExistingDates() {
  console.log('🔧 Corrigiendo fechas existentes en la base de datos...\n');

  try {
    // 1. Obtener todas las órdenes activas
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION']);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    console.log(`📋 Encontradas ${orders.length} órdenes activas para corregir:`);

    for (const order of orders) {
      console.log(`\n🔧 Corrigiendo orden ${order.orderNumber}:`);
      console.log(`   📅 createdAt original: ${order.createdAt}`);
      console.log(`   📅 updatedAt original: ${order.updatedAt}`);

      // Verificar si ya tiene 'Z'
      const createdAtHasZ = order.createdAt.includes('Z');
      const updatedAtHasZ = order.updatedAt && order.updatedAt.includes('Z');

      if (!createdAtHasZ || !updatedAtHasZ) {
        // Actualizar las fechas para que tengan 'Z'
        const updateData = {};
        
        if (!createdAtHasZ) {
          updateData.createdAt = order.createdAt + 'Z';
          console.log(`   🔧 createdAt corregido: ${updateData.createdAt}`);
        }
        
        if (!updatedAtHasZ && order.updatedAt) {
          updateData.updatedAt = order.updatedAt + 'Z';
          console.log(`   🔧 updatedAt corregido: ${updateData.updatedAt}`);
        }

        const { error: updateError } = await supabase
          .from('Order')
          .update(updateData)
          .eq('id', order.id);

        if (updateError) {
          console.log(`   ❌ Error actualizando orden: ${updateError.message}`);
        } else {
          console.log(`   ✅ Orden ${order.orderNumber} actualizada correctamente`);
        }
      } else {
        console.log(`   ✅ Orden ${order.orderNumber} ya tiene fechas correctas`);
      }
    }

    // 2. También corregir los items de las órdenes
    console.log('\n🔧 Corrigiendo fechas de items...');
    
    const { data: items, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .in('orderid', orders.map(o => o.id));

    if (itemsError) {
      console.error('❌ Error obteniendo items:', itemsError.message);
    } else {
      console.log(`📋 Encontrados ${items.length} items para corregir:`);

      for (const item of items) {
        if (item.createdat && !item.createdat.includes('Z')) {
          console.log(`   🔧 Corrigiendo item ${item.id}: ${item.createdat} -> ${item.createdat}Z`);
          
          const { error: itemUpdateError } = await supabase
            .from('OrderItem')
            .update({ createdat: item.createdat + 'Z' })
            .eq('id', item.id);

          if (itemUpdateError) {
            console.log(`   ❌ Error actualizando item: ${itemUpdateError.message}`);
          } else {
            console.log(`   ✅ Item ${item.id} actualizado correctamente`);
          }
        }
      }
    }

    console.log('\n✅ Corrección de fechas completada');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
}

fixExistingDates();








