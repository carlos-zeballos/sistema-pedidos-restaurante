require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRealUser() {
  console.log('🔍 Obteniendo un usuario real de la base de datos...\n');

  try {
    const { data: users, error } = await supabase
      .from('User')
      .select('id, username, email')
      .limit(1);

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error.message);
      return;
    }

    if (users && users.length > 0) {
      console.log('✅ Usuario encontrado:');
      console.log(`   - ID: ${users[0].id}`);
      console.log(`   - Username: ${users[0].username}`);
      console.log(`   - Email: ${users[0].email}`);
      return users[0].id;
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
      
      // Crear un usuario de prueba
      console.log('🔧 Creando usuario de prueba...');
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .insert([{
          username: 'test-user',
          email: 'test@example.com',
          password: 'hashed-password',
          role: 'MOZO'
        }])
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creando usuario:', createError.message);
        return null;
      }
      
      console.log('✅ Usuario de prueba creado:');
      console.log(`   - ID: ${newUser.id}`);
      console.log(`   - Username: ${newUser.username}`);
      return newUser.id;
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    return null;
  }
}

getRealUser();


