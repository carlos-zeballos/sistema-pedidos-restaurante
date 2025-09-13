const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function getExactFunctionSignature() {
  console.log('🔍 Obteniendo firma exacta de la función RPC...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Obtener la definición exacta de la función
    const functionQuery = `
      SELECT 
        p.parameter_name,
        p.data_type,
        p.parameter_mode,
        p.ordinal_position,
        p.parameter_default
      FROM information_schema.parameters p
      JOIN information_schema.routines r ON p.specific_name = r.specific_name
      WHERE r.routine_name = 'create_order_with_items'
      AND r.routine_schema = 'public'
      ORDER BY p.ordinal_position;
    `;
    
    const result = await client.query(functionQuery);
    
    console.log('📋 Firma exacta de la función create_order_with_items:');
    result.rows.forEach(row => {
      const mode = row.parameter_mode || 'OUT';
      const defaultVal = row.parameter_default ? ` = ${row.parameter_default}` : '';
      console.log(`   ${row.ordinal_position}. ${row.parameter_name}: ${row.data_type} (${mode})${defaultVal}`);
    });

    // También obtener la definición completa de la función
    const definitionQuery = `
      SELECT routine_definition
      FROM information_schema.routines
      WHERE routine_name = 'create_order_with_items'
      AND routine_schema = 'public';
    `;
    
    const defResult = await client.query(definitionQuery);
    if (defResult.rows.length > 0) {
      console.log('\n📝 Definición de la función:');
      console.log(defResult.rows[0].routine_definition.substring(0, 500) + '...');
    }

    // Probar con diferentes firmas posibles
    console.log('\n🧪 Probando diferentes firmas...');
    
    const testSignatures = [
      // Firma original sin delivery
      `create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb)`,
      // Firma con delivery
      `create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb, numeric, boolean)`,
      // Firma con solo delivery_cost
      `create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb, numeric)`,
      // Firma con solo is_delivery
      `create_order_with_items(uuid, uuid, text, text, numeric, numeric, numeric, numeric, text, jsonb, boolean)`
    ];

    for (const signature of testSignatures) {
      try {
        console.log(`\n🔍 Probando firma: ${signature}`);
        
        // Obtener un espacio y usuario para la prueba
        const spaceResult = await client.query('SELECT id FROM "Space" LIMIT 1');
        const userResult = await client.query('SELECT id FROM "User" LIMIT 1');
        
        const testQuery = `SELECT * FROM ${signature}($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
        
        await client.query(testQuery, [
          spaceResult.rows[0].id,
          userResult.rows[0].id,
          'Test',
          '123456789',
          10.0,
          10.0,
          0,
          0,
          'Test',
          '[]',
          0,
          false
        ]);
        
        console.log(`✅ Firma válida: ${signature}`);
        break;
        
      } catch (error) {
        console.log(`❌ Firma inválida: ${signature} - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

getExactFunctionSignature();

