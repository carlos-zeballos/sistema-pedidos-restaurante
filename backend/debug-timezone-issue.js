require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugTimezoneIssue() {
  console.log('🕐 Diagnosticando problema de zona horaria...\n');

  try {
    // 1. Obtener una orden reciente
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(1);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    if (orders.length === 0) {
      console.log('⚠️  No hay órdenes para analizar');
      return;
    }

    const order = orders[0];
    console.log('📋 Orden encontrada:');
    console.log(`   ID: ${order.id}`);
    console.log(`   Número: ${order.orderNumber}`);
    console.log(`   createdAt (BD): ${order.createdAt}`);
    console.log(`   updatedAt (BD): ${order.updatedAt}`);

    // 2. Analizar las fechas
    console.log('\n🕐 Análisis de fechas:');
    
    const createdAtBD = new Date(order.createdAt);
    const now = new Date();
    
    console.log(`   createdAt (BD): ${order.createdAt}`);
    console.log(`   createdAt (Date): ${createdAtBD}`);
    console.log(`   createdAt (ISO): ${createdAtBD.toISOString()}`);
    console.log(`   createdAt (Local): ${createdAtBD.toLocaleString()}`);
    console.log(`   Hora actual: ${now.toISOString()}`);
    console.log(`   Hora actual (Local): ${now.toLocaleString()}`);
    
    // 3. Calcular diferencia
    const diffMs = now.getTime() - createdAtBD.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    
    console.log(`\n⏱️  Diferencia de tiempo:`);
    console.log(`   Milisegundos: ${diffMs}`);
    console.log(`   Segundos: ${diffSeconds}`);
    console.log(`   Minutos: ${diffMinutes}`);
    console.log(`   Horas: ${diffHours}`);
    
    // 4. Verificar zona horaria
    console.log(`\n🌍 Información de zona horaria:`);
    console.log(`   Zona horaria del sistema: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`   Offset UTC: ${now.getTimezoneOffset()} minutos`);
    console.log(`   Offset UTC: ${now.getTimezoneOffset() / 60} horas`);
    
    // 5. Probar diferentes interpretaciones
    console.log(`\n🧪 Probando diferentes interpretaciones:`);
    
    // Interpretar como UTC
    const createdAtUTC = new Date(order.createdAt + 'Z');
    const diffUTC = now.getTime() - createdAtUTC.getTime();
    console.log(`   Interpretando como UTC: ${createdAtUTC.toISOString()}`);
    console.log(`   Diferencia (UTC): ${Math.floor(diffUTC / 1000)} segundos`);
    
    // Interpretar como local
    const createdAtLocal = new Date(order.createdAt);
    const diffLocal = now.getTime() - createdAtLocal.getTime();
    console.log(`   Interpretando como local: ${createdAtLocal.toISOString()}`);
    console.log(`   Diferencia (Local): ${Math.floor(diffLocal / 1000)} segundos`);
    
    // 6. Verificar si la fecha tiene información de zona horaria
    console.log(`\n🔍 Análisis de formato de fecha:`);
    console.log(`   ¿Termina en Z?: ${order.createdAt.endsWith('Z')}`);
    console.log(`   ¿Termina en +00:00?: ${order.createdAt.endsWith('+00:00')}`);
    console.log(`   ¿Tiene offset?: ${order.createdAt.includes('+') || order.createdAt.includes('-')}`);
    
    // 7. Crear una nueva orden para probar
    console.log(`\n🧪 Creando orden de prueba con timestamp explícito...`);
    
    const testOrder = {
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35', // Mesa 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Test Timezone',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Test Timezone',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Test de zona horaria'
        }
      ],
      notes: 'Test de zona horaria',
      totalamount: 10.00,
      subtotal: 10.00,
      tax: 0.00,
      discount: 0.00
    };

    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_with_items', {
        p_space_id: testOrder.spaceid,
        p_created_by: testOrder.createdby,
        p_customer_name: testOrder.customername,
        p_customer_phone: testOrder.customerphone,
        p_total_amount: testOrder.totalamount,
        p_subtotal: testOrder.subtotal,
        p_tax: testOrder.tax,
        p_discount: testOrder.discount,
        p_notes: testOrder.notes,
        p_items: testOrder.items
      });

    if (rpcError) {
      console.log('   ❌ Error creando orden de prueba:', rpcError.message);
    } else {
      const created = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      console.log('   ✅ Orden de prueba creada:', created.orderNumber);
      console.log(`   📅 createdAt: ${created.createdAt}`);
      
      // Verificar inmediatamente
      const { data: newOrder, error: newOrderError } = await supabase
        .from('Order')
        .select('*')
        .eq('id', created.id)
        .single();
      
      if (newOrderError) {
        console.log('   ❌ Error obteniendo orden nueva:', newOrderError.message);
      } else {
        console.log(`   📅 createdAt (BD): ${newOrder.createdAt}`);
        const newCreatedAt = new Date(newOrder.createdAt);
        const newDiff = now.getTime() - newCreatedAt.getTime();
        console.log(`   ⏱️  Diferencia: ${Math.floor(newDiff / 1000)} segundos`);
      }
    }

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

debugTimezoneIssue();





