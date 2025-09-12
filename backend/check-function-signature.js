const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=disable'
});

async function checkFunctionSignature() {
  console.log('🔍 Verificando firma de la función RPC...\n');

  try {
    await client.connect();
    console.log('✅ Conexión exitosa');

    // Verificar la firma exacta de la función
    const signatureQuery = `
      SELECT 
        routine_name,
        parameter_name,
        parameter_mode,
        p.data_type as param_type
      FROM information_schema.routines r
      LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
      WHERE routine_name = 'create_order_with_items' 
      AND routine_schema = 'public'
      ORDER BY p.ordinal_position;
    `;
    
    const result = await client.query(signatureQuery);
    
    console.log('📋 Firma de la función:');
    result.rows.forEach(row => {
      console.log(`   ${row.parameter_name || 'RETURN'}: ${row.param_type || row.data_type} (${row.parameter_mode || 'OUT'})`);
    });

    // Verificar si hay funciones con nombres similares
    const similarQuery = `
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_name LIKE '%order%' 
      AND routine_schema = 'public';
    `;
    
    const similarResult = await client.query(similarQuery);
    console.log('\n🔍 Funciones relacionadas con órdenes:');
    similarResult.rows.forEach(row => {
      console.log(`   - ${row.routine_name} (${row.routine_type})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkFunctionSignature();
