require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentRPC() {
  console.log('🔍 Verificando RPC actual...');
  
  try {
    // Intentar llamar al RPC para ver si existe y qué error da
    const testCall = {
      p_created_by: '00000000-0000-0000-0000-000000000000',
      p_customer_name: 'test',
      p_customer_phone: 'test',
      p_discount: 0,
      p_items: '[]',
      p_notes: 'test',
      p_space_id: '00000000-0000-0000-0000-000000000000',
      p_subtotal: 0,
      p_tax: 0,
      p_total_amount: 0
    };
    
    const { data, error } = await supabase.rpc('create_order_with_items', testCall);
    
    if (error) {
      console.log('📋 Error actual del RPC:', error.message);
      if (error.message.includes('ambiguous')) {
        console.log('⚠️  El RPC tiene referencias ambiguas - necesita ser corregido');
        return false;
      }
    } else {
      console.log('✅ RPC funciona correctamente');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error al verificar RPC:', error.message);
  }
  
  return false;
}

async function showInstructions() {
  console.log('\n📋 INSTRUCCIONES PARA APLICAR EL RPC CORREGIDO:');
  console.log('================================================');
  console.log('1. Ve al SQL Editor de Supabase');
  console.log('2. Copia el contenido del archivo: corrected-order-rpc.sql');
  console.log('3. Pega y ejecuta el script completo');
  console.log('4. Vuelve aquí y ejecuta: node test-corrected-rpc.js');
  console.log('');
  console.log('📄 Contenido del archivo corrected-order-rpc.sql:');
  console.log('================================================');
  
  try {
    const fs = require('fs');
    const sqlContent = fs.readFileSync('./corrected-order-rpc.sql', 'utf8');
    console.log(sqlContent);
  } catch (error) {
    console.error('❌ Error al leer el archivo SQL:', error.message);
  }
}

async function main() {
  console.log('🔧 Verificando estado del RPC...\n');
  
  const isWorking = await checkCurrentRPC();
  
  if (!isWorking) {
    await showInstructions();
  }
  
  console.log('\n✨ Proceso completado');
}

main().catch(console.error);



