require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTimezoneFix() {
  console.log('🕐 Probando corrección de zona horaria...\n');

  try {
    // 1. Crear una orden de prueba
    console.log('1️⃣ Creando orden de prueba...');
    
    const testOrder = {
      spaceid: '94cc46a7-4c65-4a35-bb37-d3a1fa9e1c35', // Mesa 1
      createdby: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      customername: 'Test Timezone Fix',
      customerphone: '123456789',
      items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Test Timezone Fix',
          unitPrice: 10.00,
          totalPrice: 10.00,
          quantity: 1,
          notes: 'Test de corrección de zona horaria'
        }
      ],
      notes: 'Test de corrección de zona horaria',
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
      console.log('   ❌ Error creando orden:', rpcError.message);
      return;
    }

    const created = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    console.log('   ✅ Orden creada:', created.orderNumber);

    // 2. Obtener la orden de la base de datos
    const { data: order, error: orderError } = await supabase
      .from('Order')
      .select('*')
      .eq('id', created.id)
      .single();

    if (orderError) {
      console.log('   ❌ Error obteniendo orden:', orderError.message);
      return;
    }

    console.log('   📅 createdAt (BD):', order.createdAt);

    // 3. Simular el cálculo del frontend
    console.log('\n2️⃣ Simulando cálculo del frontend...');
    
    const now = new Date();
    const startTime = order.createdAt;
    const startTimeDate = new Date(startTime);
    
    console.log('   🕐 Hora actual:', now.toISOString());
    console.log('   🕐 Hora actual (Local):', now.toLocaleString());
    console.log('   🕐 startTime (BD):', startTime);
    console.log('   🕐 startTimeDate:', startTimeDate.toISOString());
    
    // Verificar si la fecha tiene información de zona horaria
    const hasTimezoneInfo = startTime.includes('Z') || startTime.includes('+') || startTime.includes('-');
    console.log('   🔍 ¿Tiene info de zona horaria?:', hasTimezoneInfo);
    
    let elapsedSeconds;
    if (hasTimezoneInfo) {
      // La fecha ya tiene información de zona horaria, usarla directamente
      elapsedSeconds = Math.max(0, Math.floor((now.getTime() - startTimeDate.getTime()) / 1000));
      console.log('   ✅ Usando fecha con zona horaria');
    } else {
      // La fecha no tiene información de zona horaria, asumir que es UTC
      const utcStartTime = new Date(startTime + 'Z');
      elapsedSeconds = Math.max(0, Math.floor((now.getTime() - utcStartTime.getTime()) / 1000));
      console.log('   🔧 Corrigiendo zona horaria - UTC:', utcStartTime.toISOString());
    }
    
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    console.log('   ⏱️  Tiempo transcurrido:', elapsedSeconds, 'segundos');
    console.log('   ⏱️  Formato HH:MM:SS:', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    
    // 4. Verificar que el tiempo es positivo y razonable
    const isPositive = elapsedSeconds >= 0;
    const isReasonable = elapsedSeconds < 3600; // Menos de 1 hora
    
    console.log('\n3️⃣ Verificando resultados...');
    console.log('   ✅ ¿Tiempo positivo?:', isPositive);
    console.log('   ✅ ¿Tiempo razonable?:', isReasonable);
    
    if (isPositive && isReasonable) {
      console.log('   🎉 ¡Corrección de zona horaria exitosa!');
    } else {
      console.log('   ❌ Problema con la corrección de zona horaria');
    }
    
    // 5. Limpiar - eliminar la orden de prueba
    console.log('\n4️⃣ Limpiando orden de prueba...');
    const { error: deleteError } = await supabase
      .from('Order')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) {
      console.log('   ⚠️  Error eliminando orden de prueba:', deleteError.message);
    } else {
      console.log('   ✅ Orden de prueba eliminada');
    }
    
    // 6. Liberar el espacio
    const { error: spaceError } = await supabase
      .from('Space')
      .update({ status: 'LIBRE' })
      .eq('id', testOrder.spaceid);
    
    if (spaceError) {
      console.log('   ⚠️  Error liberando espacio:', spaceError.message);
    } else {
      console.log('   ✅ Espacio liberado');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testTimezoneFix();


