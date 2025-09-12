require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTimerCalculation() {
  console.log('⏰ Probando cálculo del cronómetro...\n');

  try {
    // 1. Obtener una orden activa
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .limit(1);

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    if (orders.length === 0) {
      console.log('⚠️  No hay órdenes activas para probar');
      return;
    }

    const order = orders[0];
    console.log(`📋 Probando con orden ${order.orderNumber}:`);
    console.log(`   📅 createdAt: ${order.createdAt}`);

    // 2. Simular el cálculo del frontend
    const currentTime = new Date();
    const startTime = order.createdAt;
    const startTimeDate = new Date(startTime);
    
    console.log(`   🕐 currentTime: ${currentTime.toISOString()}`);
    console.log(`   🕐 startTimeDate: ${startTimeDate.toISOString()}`);
    
    // Calcular diferencia
    const timeDiff = currentTime.getTime() - startTimeDate.getTime();
    const elapsedSeconds = Math.max(0, Math.floor(timeDiff / 1000));
    
    console.log(`   ⏱️  timeDiff: ${timeDiff} ms`);
    console.log(`   ⏱️  elapsedSeconds: ${elapsedSeconds} segundos`);
    
    // Formatear como en el frontend
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    console.log(`   🎯 Formato HH:MM:SS: ${formattedTime}`);
    
    // 3. Verificar que el tiempo es positivo y razonable
    const isPositive = elapsedSeconds >= 0;
    const isReasonable = elapsedSeconds < 3600; // Menos de 1 hora
    
    console.log(`\n✅ Verificación:`);
    console.log(`   ¿Tiempo positivo?: ${isPositive}`);
    console.log(`   ¿Tiempo razonable?: ${isReasonable}`);
    
    if (isPositive && isReasonable) {
      console.log(`   🎉 ¡Cálculo correcto! El cronómetro debería mostrar: ${formattedTime}`);
    } else {
      console.log(`   ❌ Problema con el cálculo`);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testTimerCalculation();









