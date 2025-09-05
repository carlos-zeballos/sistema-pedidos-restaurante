const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdmin() {
  try {
    console.log('🔍 Verificando usuario admin...\n');

    // Obtener el usuario admin
    const { data: users, error } = await supabase
      .from('User')
      .select('*')
      .eq('username', 'admin');

    if (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No se encontró el usuario admin');
      return;
    }

    const admin = users[0];
    console.log('✅ Usuario admin encontrado:');
    console.log('   - Username:', admin.username);
    console.log('   - Nombre:', admin.firstname, admin.lastname);
    console.log('   - Rol:', admin.role);
    console.log('   - Activo:', admin.isactive);
    console.log('   - Password hash:', admin.password.substring(0, 20) + '...');

    // Verificar si la contraseña admin123 coincide con el hash
    const password = 'admin123';
    const isValid = await bcrypt.compare(password, admin.password);
    
    console.log('\n🔐 Verificación de contraseña:');
    console.log('   - Contraseña a verificar:', password);
    console.log('   - ¿Es válida?:', isValid ? '✅ SÍ' : '❌ NO');

    if (!isValid) {
      console.log('\n🔄 Generando nuevo hash para admin123...');
      const newHash = await bcrypt.hash(password, 10);
      
      const { error: updateError } = await supabase
        .from('User')
        .update({ password: newHash })
        .eq('username', 'admin');

      if (updateError) {
        console.error('❌ Error actualizando contraseña:', updateError);
      } else {
        console.log('✅ Contraseña actualizada correctamente');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyAdmin();
