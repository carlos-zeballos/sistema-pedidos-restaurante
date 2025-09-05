require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrphanedSpaces() {
  console.log('🔧 Arreglando mesas huérfanas...\n');

  try {
    // 1. Obtener todas las mesas
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*');

    if (spacesError) {
      console.error('❌ Error obteniendo espacios:', spacesError.message);
      return;
    }

    // 2. Obtener órdenes activas
    const { data: activeOrders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION']);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes activas:', ordersError.message);
      return;
    }

    // 3. Identificar mesas ocupadas sin órdenes activas
    const occupiedSpaces = spaces.filter(s => s.status === 'OCUPADA');
    const activeOrderSpaceIds = activeOrders.map(o => o.spaceId);
    const orphanedSpaces = occupiedSpaces.filter(space => 
      !activeOrderSpaceIds.includes(space.id)
    );

    console.log(`📋 Mesas ocupadas: ${occupiedSpaces.length}`);
    console.log(`📦 Órdenes activas: ${activeOrders.length}`);
    console.log(`⚠️  Mesas huérfanas: ${orphanedSpaces.length}`);

    if (orphanedSpaces.length === 0) {
      console.log('✅ No hay mesas huérfanas que arreglar');
      return;
    }

    // 4. Liberar las mesas huérfanas
    console.log('\n🔧 Liberando mesas huérfanas...');
    
    for (const space of orphanedSpaces) {
      console.log(`   🏠 Liberando ${space.name} (ID: ${space.id})`);
      
      const { error: updateError } = await supabase
        .from('Space')
        .update({ status: 'LIBRE' })
        .eq('id', space.id);

      if (updateError) {
        console.log(`   ❌ Error liberando ${space.name}: ${updateError.message}`);
      } else {
        console.log(`   ✅ ${space.name} liberada correctamente`);
      }
    }

    // 5. Verificar el resultado
    console.log('\n🔍 Verificando resultado...');
    
    const { data: updatedSpaces, error: updatedSpacesError } = await supabase
      .from('Space')
      .select('*')
      .order('name');

    if (updatedSpacesError) {
      console.error('❌ Error verificando espacios:', updatedSpacesError.message);
      return;
    }

    const finalOccupiedSpaces = updatedSpaces.filter(s => s.status === 'OCUPADA');
    const finalFreeSpaces = updatedSpaces.filter(s => s.status === 'LIBRE');

    console.log(`\n📊 RESULTADO FINAL:`);
    console.log('=' .repeat(30));
    console.log(`🏠 Mesas ocupadas: ${finalOccupiedSpaces.length}`);
    console.log(`🏠 Mesas libres: ${finalFreeSpaces.length}`);
    console.log(`📦 Órdenes activas: ${activeOrders.length}`);

    if (finalOccupiedSpaces.length === activeOrders.length) {
      console.log('✅ ¡PERFECTO! Todas las mesas ocupadas tienen órdenes activas');
    } else {
      console.log('⚠️  Aún hay inconsistencias');
    }

    console.log('\n📋 Estado final de todas las mesas:');
    updatedSpaces.forEach(space => {
      const status = space.status === 'OCUPADA' ? '🔴' : '🟢';
      console.log(`   ${status} ${space.name}: ${space.status}`);
    });

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  }
}

fixOrphanedSpaces();