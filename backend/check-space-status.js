require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpaceStatus() {
  console.log('🔍 Verificando estado de mesas y órdenes...\n');

  try {
    // 1. Verificar todas las mesas
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*')
      .order('name');

    if (spacesError) {
      console.error('❌ Error obteniendo espacios:', spacesError.message);
      return;
    }

    console.log('📋 ESTADO DE TODAS LAS MESAS:');
    console.log('=' .repeat(50));
    
    spaces.forEach(space => {
      console.log(`🏠 ${space.name}: ${space.status}`);
    });

    // 2. Verificar órdenes activas
    const { data: activeOrders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION']);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes activas:', ordersError.message);
      return;
    }

    console.log(`\n📋 ÓRDENES ACTIVAS (${activeOrders.length}):`);
    console.log('=' .repeat(50));
    
    if (activeOrders.length === 0) {
      console.log('✅ No hay órdenes activas');
    } else {
      activeOrders.forEach(order => {
        console.log(`📦 ${order.orderNumber}: ${order.status} - Espacio: ${order.spaceId}`);
      });
    }

    // 3. Identificar mesas ocupadas sin órdenes activas
    console.log(`\n🔍 ANÁLISIS DE CONSISTENCIA:`);
    console.log('=' .repeat(50));
    
    const occupiedSpaces = spaces.filter(s => s.status === 'OCUPADA');
    const freeSpaces = spaces.filter(s => s.status === 'LIBRE');
    
    console.log(`🏠 Mesas ocupadas: ${occupiedSpaces.length}`);
    console.log(`🏠 Mesas libres: ${freeSpaces.length}`);
    console.log(`📦 Órdenes activas: ${activeOrders.length}`);
    
    // Verificar si hay mesas ocupadas sin órdenes activas
    const activeOrderSpaceIds = activeOrders.map(o => o.spaceId);
    const orphanedSpaces = occupiedSpaces.filter(space => 
      !activeOrderSpaceIds.includes(space.id)
    );
    
    if (orphanedSpaces.length > 0) {
      console.log(`\n⚠️  MESAS HUÉRFANAS (ocupadas sin órdenes activas):`);
      orphanedSpaces.forEach(space => {
        console.log(`   🏠 ${space.name} (ID: ${space.id})`);
      });
    } else {
      console.log(`\n✅ Todas las mesas ocupadas tienen órdenes activas`);
    }
    
    // 4. Verificar si hay órdenes activas sin mesas ocupadas
    const occupiedSpaceIds = occupiedSpaces.map(s => s.id);
    const ordersWithoutOccupiedSpaces = activeOrders.filter(order => 
      !occupiedSpaceIds.includes(order.spaceId)
    );
    
    if (ordersWithoutOccupiedSpaces.length > 0) {
      console.log(`\n⚠️  ÓRDENES SIN MESAS OCUPADAS:`);
      ordersWithoutOccupiedSpaces.forEach(order => {
        console.log(`   📦 ${order.orderNumber} - Espacio ID: ${order.spaceId}`);
      });
    } else {
      console.log(`\n✅ Todas las órdenes activas tienen sus mesas ocupadas`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

checkSpaceStatus();










