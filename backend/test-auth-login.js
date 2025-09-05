const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const credentials = [
  { username: 'admin', password: 'Admin123!', role: 'ADMIN' },
  { username: 'mozo1', password: 'Mozo123!', role: 'MOZO' },
  { username: 'mozo2', password: 'Mozo123!', role: 'MOZO' },
  { username: 'cocinero1', password: 'Cocina123!', role: 'COCINERO' },
  { username: 'cocinero2', password: 'Cocina123!', role: 'COCINERO' }
];

async function testAuthLogin() {
  console.log('🔐 Probando función RPC auth_login...\n');

  for (const cred of credentials) {
    try {
      console.log(`📝 Probando: ${cred.username} / ${cred.password}`);
      
      const { data, error } = await supabase
        .rpc('auth_login', {
          p_identifier: cred.username,
          p_password: cred.password
        });

      if (error) {
        console.log('❌ Error en RPC:', error.message);
      } else if (data && data.length > 0) {
        const user = data[0];
        console.log('✅ Login exitoso!');
        console.log(`   - Username: ${user.username}`);
        console.log(`   - Nombre: ${user.firstname} ${user.lastname}`);
        console.log(`   - Rol: ${user.role}`);
        console.log(`   - Email: ${user.email}`);
      } else {
        console.log('❌ Credenciales inválidas');
      }
      console.log('');

    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log('');
    }
  }
}

testAuthLogin();
