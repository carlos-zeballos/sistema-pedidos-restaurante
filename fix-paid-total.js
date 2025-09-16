const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fixPaidTotalRPC() {
  console.log('🔧 Corrigiendo función RPC get_orders_report_by_date...\n');
  
  try {
    // Leer el script SQL
    const fs = require('fs');
    const sqlScript = fs.readFileSync('../fix-paid-total-rpc.sql', 'utf8');
    
    // Ejecutar el script
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error ejecutando script:', error);
      return;
    }
    
    console.log('✅ Script ejecutado correctamente');
    
    // Probar la función corregida
    console.log('\n🧪 Probando función corregida...');
    
    const { data: testData, error: testError } = await supabase
      .rpc('get_orders_report_by_date', {
        p_start_date: '2025-01-01',
        p_end_date: '2025-01-31',
        p_status: null,
        p_space_type: null
      });
    
    if (testError) {
      console.error('❌ Error probando función:', testError);
      return;
    }
    
    console.log('✅ Función RPC funcionando correctamente');
    console.log(`📊 Órdenes encontradas: ${testData.length}`);
    
    // Mostrar ejemplo de datos corregidos
    if (testData.length > 0) {
      const sample = testData[0];
      console.log('\n📋 Ejemplo de datos corregidos:');
      console.log(`  - Orden: ${sample.orderNumber}`);
      console.log(`  - Final Total: S/ ${sample.finalTotal}`);
      console.log(`  - Paid Total: S/ ${sample.paidTotal}`);
      console.log(`  - Correcto: ${sample.paidTotal === sample.finalTotal ? '✅' : '❌'}`);
    }
    
  } catch (err) {
    console.error('❌ Error general:', err.message);
  }
}

fixPaidTotalRPC().catch(console.error);
