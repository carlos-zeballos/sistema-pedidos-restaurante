require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkCurrentRPC() {
  console.log('🔍 Verificando RPC actual en la base de datos...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Probar el RPC directamente
    console.log('🧪 Probando RPC directamente...');
    const testData = {
      p_created_by: '1a8a16ea-b645-457c-a3d1-86ca00159b7b',
      p_customer_name: 'Test Cliente',
      p_customer_phone: '123456789',
      p_discount: 0,
      p_items: [
        {
          productId: 'c015c69d-2212-46b4-9594-8d97905b3116',
          name: 'Gyozas (8 unidades)',
          unitPrice: 15.9,
          quantity: 1,
          notes: 'Test'
        }
      ],
      p_notes: 'Test desde script',
      p_space_id: 'aa09d6a3-f05c-4f14-8f72-92139f5a42cf',
      p_subtotal: 15.9,
      p_tax: 0,
      p_total_amount: 15.9
    };

    console.log('📋 Datos de prueba:', JSON.stringify(testData, null, 2));

    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('create_order_with_items', testData);

    if (rpcError) {
      console.log('❌ Error al ejecutar RPC:', rpcError);
    } else {
      console.log('✅ RPC ejecutado exitosamente:', rpcResult);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkCurrentRPC().catch(console.error);
