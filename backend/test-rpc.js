const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRPC() {
  try {
    console.log('🔍 Probando función RPC...\n');

    // Probar la función RPC directamente
    const { data, error } = await supabase
      .rpc('get_user_by_credentials', {
        p_username: 'admin',
        p_password: 'Admin123!'
      });

    if (error) {
      console.error('❌ Error en RPC:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Usuario encontrado:');
      console.log('   - Username:', data[0].username);
      console.log('   - Nombre:', data[0].firstname, data[0].lastname);
      console.log('   - Rol:', data[0].role);
    } else {
      console.log('❌ No se encontró usuario con esas credenciales');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRPC();
