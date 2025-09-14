require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOccupiedSpaces() {
  console.log('🔍 Verificando inconsistencia: mesas ocupadas vs pedidos existentes...\n');

  try {
    // 1. Obtener todas las mesas
    console.log('1️⃣ Obteniendo todas las mesas...');
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*')
      .order('name');

    if (spacesError) {
      console.error('❌ Error obteniendo espacios:', spacesError.message);
      return;
    }

    console.log(`   ✅ Total de mesas: ${spaces.length}`);
    
    // 2. Clasificar mesas por estado
    const freeSpaces = spaces.filter(space => space.status === 'LIBRE');
    const occupiedSpaces = spaces.filter(space => space.status === 'OCUPADA');
    
    console.log(`   📊 Mesas libres: ${freeSpaces.length}`);
    console.log(`   📊 Mesas ocupadas: ${occupiedSpaces.length}`);
    
    // 3. Mostrar mesas ocupadas
    console.log('\n2️⃣ Mesas ocupadas:');
    occupiedSpaces.forEach((space, index) => {
      console.log(`   ${index + 1}. ${space.name} (${space.type}) - ID: ${space.id}`);
    });
    
    // 4. Obtener todas las órdenes activas
    console.log('\n3️⃣ Obteniendo órdenes activas...');
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'])
      .order('createdAt', { ascending: false });

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    console.log(`   ✅ Órdenes activas: ${orders.length}`);
    
    // 5. Mostrar órdenes activas
    console.log('\n4️⃣ Órdenes activas:');
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - Mesa: ${order.spaceId} - Estado: ${order.status}`);
    });
    
    // 6. Verificar inconsistencias
    console.log('\n5️⃣ Verificando inconsistencias...');
    
    // Mesas ocupadas sin órdenes activas
    const occupiedSpaceIds = occupiedSpaces.map(space => space.id);
    const orderSpaceIds = orders.map(order => order.spaceId);
    
    const orphanedSpaces = occupiedSpaces.filter(space => 
      !orderSpaceIds.includes(space.id)
    );
    
    console.log(`   🔍 Mesas ocupadas sin órdenes activas: ${orphanedSpaces.length}`);
    
    if (orphanedSpaces.length > 0) {
      console.log('\n   ❌ MESAS HUÉRFANAS (ocupadas sin órdenes):');
      orphanedSpaces.forEach((space, index) => {
        console.log(`      ${index + 1}. ${space.name} (${space.type}) - ID: ${space.id}`);
      });
    }
    
    // Órdenes activas con mesas libres
    const freeSpaceIds = freeSpaces.map(space => space.id);
    const ordersWithFreeSpaces = orders.filter(order => 
      freeSpaceIds.includes(order.spaceId)
    );
    
    console.log(`   🔍 Órdenes activas con mesas libres: ${ordersWithFreeSpaces.length}`);
    
    if (ordersWithFreeSpaces.length > 0) {
      console.log('\n   ❌ ÓRDENES CON MESAS LIBRES:');
      ordersWithFreeSpaces.forEach((order, index) => {
        const space = spaces.find(s => s.id === order.spaceId);
        console.log(`      ${index + 1}. ${order.orderNumber} - Mesa: ${space?.name || 'N/A'} (${space?.status || 'N/A'}) - Estado: ${order.status}`);
      });
    }
    
    // 7. Verificar órdenes pagadas que no liberaron espacios
    console.log('\n6️⃣ Verificando órdenes pagadas...');
    const { data: paidOrders, error: paidError } = await supabase
      .from('Order')
      .select('*')
      .eq('status', 'PAGADO')
      .order('updatedAt', { ascending: false })
      .limit(10);

    if (paidError) {
      console.error('❌ Error obteniendo órdenes pagadas:', paidError.message);
    } else {
      console.log(`   📊 Órdenes pagadas recientes: ${paidOrders.length}`);
      
      if (paidOrders.length > 0) {
        console.log('\n   📋 Órdenes pagadas recientes:');
        paidOrders.forEach((order, index) => {
          const space = spaces.find(s => s.id === order.spaceId);
          console.log(`      ${index + 1}. ${order.orderNumber} - Mesa: ${space?.name || 'N/A'} (${space?.status || 'N/A'}) - Pagada: ${order.updatedAt}`);
        });
      }
    }
    
    // 8. Resumen y recomendaciones
    console.log('\n7️⃣ Resumen:');
    console.log(`   📊 Total mesas: ${spaces.length}`);
    console.log(`   📊 Mesas libres: ${freeSpaces.length}`);
    console.log(`   📊 Mesas ocupadas: ${occupiedSpaces.length}`);
    console.log(`   📊 Órdenes activas: ${orders.length}`);
    console.log(`   ❌ Mesas huérfanas: ${orphanedSpaces.length}`);
    console.log(`   ❌ Órdenes con mesas libres: ${ordersWithFreeSpaces.length}`);
    
    if (orphanedSpaces.length > 0) {
      console.log('\n🔧 RECOMENDACIÓN: Liberar mesas huérfanas');
      console.log('   Ejecutar script para liberar mesas sin órdenes activas');
    }
    
    if (ordersWithFreeSpaces.length > 0) {
      console.log('\n🔧 RECOMENDACIÓN: Ocupar mesas de órdenes activas');
      console.log('   Ejecutar script para ocupar mesas de órdenes activas');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

debugOccupiedSpaces();











