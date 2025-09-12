const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co'; // Reemplazar con tu URL real
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.example'; // Reemplazar con tu key real

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🔧 Creando usuario administrador...\n');

  try {
    // 1. Verificar si ya existe un usuario admin
    const { data: existingUsers, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('username', 'admin');

    if (fetchError) {
      console.error('❌ Error obteniendo usuarios:', fetchError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Usuario admin ya existe:', existingUsers[0]);
      return;
    }

    // 2. Crear usuario admin
    const { data: newUser, error: createError } = await supabase
      .from('User')
      .insert([
        {
          username: 'admin',
          email: 'admin@sistema.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      .select();

    if (createError) {
      console.error('❌ Error creando usuario:', createError);
      return;
    }

    console.log('✅ Usuario admin creado:', newUser[0]);

    // 3. Crear contraseña usando Supabase Auth (si está habilitado)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@sistema.com',
        password: 'Admin123!',
        options: {
          data: {
            username: 'admin',
            role: 'ADMIN'
          }
        }
      });

      if (authError) {
        console.log('⚠️ Auth no disponible, pero usuario creado en tabla User');
      } else {
        console.log('✅ Usuario creado en Auth también:', authData);
      }
    } catch (authError) {
      console.log('⚠️ Auth no disponible, pero usuario creado en tabla User');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createAdminUser();

