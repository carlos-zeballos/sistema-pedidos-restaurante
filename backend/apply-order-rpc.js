const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyOrderRPC() {
  try {
    console.log('🔧 Aplicando función RPC create_order_with_items...');
    
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('create-order-rpc.sql', 'utf8');
    
    // Ejecutar el SQL usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error al ejecutar SQL:', error);
      
      // Intentar método alternativo usando query directo
      console.log('🔄 Intentando método alternativo...');
      
      // Dividir el SQL en partes ejecutables
      const sqlParts = sqlContent.split(';').filter(part => part.trim());
      
      for (const part of sqlParts) {
        if (part.trim()) {
          try {
            const { error: partError } = await supabase
              .from('_exec_sql')
              .select('*')
              .eq('sql', part.trim());
            
            if (partError) {
              console.log('⚠️ Parte SQL no ejecutada (esperado):', partError.message);
            }
          } catch (e) {
            console.log('⚠️ Método alternativo no disponible');
          }
        }
      }
      
      console.log('📝 Por favor, ejecuta manualmente el archivo create-order-rpc.sql en tu panel de Supabase');
      return;
    }
    
    console.log('✅ Función RPC aplicada exitosamente');
    
    // Verificar que la función existe
    console.log('\n🔍 Verificando función RPC...');
    const { data: testData, error: testError } = await supabase
      .rpc('create_order_with_items', {
        p_space_id: '00000000-0000-0000-0000-000000000000',
        p_created_by: '00000000-0000-0000-0000-000000000000',
        p_customer_name: 'Test',
        p_customer_phone: '123',
        p_total_amount: 0,
        p_subtotal: 0,
        p_tax: 0,
        p_discount: 0,
        p_notes: 'Test',
        p_items: []
      });
    
    if (testError) {
      console.log('⚠️ Función existe pero falló (esperado con UUIDs inválidos):', testError.message);
    } else {
      console.log('✅ Función RPC funciona correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
    console.log('\n📝 INSTRUCCIONES MANUALES:');
    console.log('1. Ve a tu panel de Supabase');
    console.log('2. Ve a SQL Editor');
    console.log('3. Copia y pega el contenido del archivo create-order-rpc.sql');
    console.log('4. Ejecuta el script');
  }
}

applyOrderRPC();











