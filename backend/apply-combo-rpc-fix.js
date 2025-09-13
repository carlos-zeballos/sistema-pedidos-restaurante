require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyComboRpcFix() {
  console.log('🔧 Aplicando corrección al RPC de combos...');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'fix-combo-rpc.sql');
    if (!fs.existsSync(sqlFile)) {
      console.log('❌ Archivo fix-combo-rpc.sql no encontrado');
      return;
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ Archivo SQL leído correctamente');

    // 2. Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Comandos SQL encontrados: ${commands.length}`);

    // 3. Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim().length === 0) continue;

      console.log(`\n🔧 Ejecutando comando ${i + 1}/${commands.length}...`);
      console.log('Comando:', command.substring(0, 100) + (command.length > 100 ? '...' : ''));

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log('❌ Error al ejecutar comando:', error.message);
          
          // Si es un error de función no encontrada, intentar con sql
          if (error.message.includes('Could not find the function')) {
            console.log('🔄 Intentando con sql()...');
            const { data: sqlData, error: sqlError } = await supabase.sql(command);
            
            if (sqlError) {
              console.log('❌ Error con sql():', sqlError.message);
            } else {
              console.log('✅ Comando ejecutado con sql()');
            }
          }
        } else {
          console.log('✅ Comando ejecutado exitosamente');
          if (data) {
            console.log('Resultado:', data);
          }
        }
      } catch (execError) {
        console.log('❌ Error de ejecución:', execError.message);
      }
    }

    // 4. Verificar que el RPC se creó correctamente
    console.log('\n🔍 Verificando que el RPC se creó correctamente...');
    
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('combo_create_or_update_basic', {
          p_code: 'VERIFY_TEST',
          p_name: 'Combo de Verificación',
          p_base_price: 20.00,
          p_category_id: '6d24ee06-f4a6-4dd3-a5d4-f95e5e4a7bff',
          p_platos_ids: [],
          p_platos_max: 2,
          p_acomp_ids: [],
          p_acomp_max: 1,
          p_description: 'Combo de verificación',
          p_image: null,
          p_is_enabled: true,
          p_is_available: true,
          p_preparation_time: 15,
          p_id: null
        });

      if (rpcError) {
        console.log('❌ Error al probar RPC:', rpcError.message);
      } else {
        console.log('✅ RPC funciona correctamente. ID del combo creado:', rpcData);
        
        // Limpiar el combo de prueba
        await supabase
          .from('Combo')
          .delete()
          .eq('code', 'VERIFY_TEST');
        
        console.log('✅ Combo de prueba eliminado');
      }
    } catch (testError) {
      console.log('❌ Error al probar RPC:', testError.message);
    }

    console.log('\n🎉 Proceso completado. Revisa los resultados arriba.');

  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

applyComboRpcFix().catch(console.error);













