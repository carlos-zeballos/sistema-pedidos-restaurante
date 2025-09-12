const { createClient } = require('@supabase/supabase-js');

// Intentar obtener las credenciales de las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || 'https://jfvkhoxhiudtxskylnrv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmdmtob3hoaXVkdHhza3lsbnJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ4NzIwMCwiZXhwIjoyMDUxMDYzMjAwfQ.example';

console.log('🔧 Configuración Supabase:');
console.log('   URL:', supabaseUrl);
console.log('   Key presente:', supabaseKey ? 'Sí' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSetup() {
  console.log('\n🔧 Configurando base de datos...\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión...');
    const { data: testData, error: testError } = await supabase
      .from('User')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    console.log('✅ Conexión exitosa');

    // 2. Verificar si existe la función RPC
    console.log('\n2️⃣ Verificando función RPC...');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_order_with_items', {
        p_space_id: '00000000-0000-0000-0000-000000000000',
        p_created_by: '00000000-0000-0000-0000-000000000000',
        p_customer_name: 'Test',
        p_total_amount: 0,
        p_subtotal: 0,
        p_tax: 0,
        p_discount: 0,
        p_items: []
      });

    if (rpcError) {
      console.log('❌ Función RPC no existe o tiene errores:', rpcError.message);
      console.log('   Necesitamos aplicar la función RPC a la base de datos');
    } else {
      console.log('✅ Función RPC existe y funciona');
    }

    // 3. Verificar usuarios
    console.log('\n3️⃣ Verificando usuarios...');
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('*');

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
    } else {
      console.log(`✅ Usuarios encontrados: ${users.length}`);
      if (users.length === 0) {
        console.log('   ⚠️ No hay usuarios en la base de datos');
      } else {
        users.forEach(user => {
          console.log(`   - ${user.username} (${user.role})`);
        });
      }
    }

    // 4. Verificar espacios
    console.log('\n4️⃣ Verificando espacios...');
    const { data: spaces, error: spacesError } = await supabase
      .from('Space')
      .select('*');

    if (spacesError) {
      console.error('❌ Error obteniendo espacios:', spacesError);
    } else {
      console.log(`✅ Espacios encontrados: ${spaces.length}`);
      if (spaces.length === 0) {
        console.log('   ⚠️ No hay espacios en la base de datos');
      } else {
        spaces.forEach(space => {
          console.log(`   - ${space.name} (${space.status})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixDatabaseSetup();
