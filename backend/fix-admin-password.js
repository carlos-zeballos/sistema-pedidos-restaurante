const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminPassword() {
  try {
    console.log('🔧 Actualizando contraseña del usuario admin...\n');

    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Contraseña original:', password);
    console.log('Hash generado:', hashedPassword.substring(0, 20) + '...');

    // Actualizar la contraseña del usuario admin
    const { data, error } = await supabase
      .from('User')
      .update({ password: hashedPassword })
      .eq('username', 'admin')
      .select();

    if (error) {
      console.error('❌ Error actualizando contraseña:', error);
      return;
    }

    console.log('✅ Contraseña actualizada exitosamente');
    console.log('Usuario actualizado:', data[0].username);

    console.log('\n🔑 Credenciales actualizadas:');
    console.log('   - Usuario: admin');
    console.log('   - Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdminPassword();
