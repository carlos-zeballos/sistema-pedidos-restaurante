require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugTimerDisplay() {
  console.log('🕐 Diagnosticando problema del cronómetro...\n');

  try {
    // 1. Obtener las órdenes activas
    const { data: orders, error: ordersError } = await supabase
      .from('Order')
      .select('*')
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .order('createdAt', { ascending: false });

    if (ordersError) {
      console.error('❌ Error obteniendo órdenes:', ordersError.message);
      return;
    }

    if (orders.length === 0) {
      console.log('⚠️  No hay órdenes activas para analizar');
      return;
    }

    console.log(`📋 Encontradas ${orders.length} órdenes activas:`);

    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Orden ${order.orderNumber}:`);
      console.log(`   📅 createdAt (BD): ${order.createdAt}`);
      console.log(`   📅 updatedAt (BD): ${order.updatedAt}`);
      console.log(`   📊 Estado: ${order.status}`);
      
      // Analizar la fecha
      const now = new Date();
      const createdAt = new Date(order.createdAt);
      
      console.log(`   🕐 Hora actual: ${now.toISOString()}`);
      console.log(`   🕐 Hora actual (Local): ${now.toLocaleString()}`);
      console.log(`   🕐 createdAt (Date): ${createdAt.toISOString()}`);
      console.log(`   🕐 createdAt (Local): ${createdAt.toLocaleString()}`);
      
      // Calcular diferencia
      const diffMs = now.getTime() - createdAt.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      
      console.log(`   ⏱️  Diferencia: ${diffMs} ms`);
      console.log(`   ⏱️  Diferencia: ${diffSeconds} segundos`);
      console.log(`   ⏱️  Diferencia: ${diffMinutes} minutos`);
      console.log(`   ⏱️  Diferencia: ${diffHours} horas`);
      
      // Formatear como en el frontend
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;
      
      console.log(`   🎯 Formato HH:MM:SS: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // Verificar si hay problema de zona horaria
      const hasTimezoneInfo = order.createdAt.includes('Z') || order.createdAt.includes('+') || order.createdAt.includes('-');
      console.log(`   🔍 ¿Tiene info de zona horaria?: ${hasTimezoneInfo}`);
      
      if (diffSeconds < 0) {
        console.log(`   ⚠️  PROBLEMA: Tiempo negativo detectado`);
        
        // Intentar corrección
        const utcStartTime = new Date(order.createdAt + 'Z');
        const correctedDiffMs = now.getTime() - utcStartTime.getTime();
        const correctedDiffSeconds = Math.floor(correctedDiffMs / 1000);
        
        console.log(`   🔧 Corrección UTC: ${utcStartTime.toISOString()}`);
        console.log(`   🔧 Diferencia corregida: ${correctedDiffSeconds} segundos`);
        
        const correctedHours = Math.floor(correctedDiffSeconds / 3600);
        const correctedMinutes = Math.floor((correctedDiffSeconds % 3600) / 60);
        const correctedSeconds = correctedDiffSeconds % 60;
        
        console.log(`   🔧 Formato corregido: ${correctedHours.toString().padStart(2, '0')}:${correctedMinutes.toString().padStart(2, '0')}:${correctedSeconds.toString().padStart(2, '0')}`);
      }
    });

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

debugTimerDisplay();
