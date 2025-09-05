const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFrontendAuth() {
  console.log('🔍 Debugging frontend authentication...\n');

  try {
    // 1. Verificar usuarios disponibles
    console.log('1️⃣ Usuarios disponibles:');
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, email, role, "isActive"')
      .order('role');

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return;
    }

    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.isActive ? 'Activo' : 'Inactivo'}`);
    });

    // 2. Verificar que hay al menos un usuario ADMIN activo
    const adminUsers = users.filter(u => u.role === 'ADMIN' && u.isActive);
    console.log(`\n✅ Usuarios ADMIN activos: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('❌ No hay usuarios ADMIN activos. Esto puede causar problemas de autenticación.');
      return;
    }

    // 3. Simular login de un usuario ADMIN
    console.log('\n2️⃣ Simulando login de usuario ADMIN...');
    const adminUser = adminUsers[0];
    
    // Crear un token JWT simple para testing (en producción esto se haría con el servicio de auth)
    console.log(`✅ Usuario ADMIN para login: ${adminUser.email}`);

    // 4. Probar endpoint con autenticación simulada
    console.log('\n3️⃣ Probando endpoint con autenticación...');
    
    // Simular la llamada que haría el frontend autenticado
    const { data: products, error: productsError } = await supabase
      .rpc('get_products_for_combo_components');

    if (productsError) {
      console.error('❌ Error en endpoint:', productsError);
    } else {
      console.log(`✅ Endpoint funciona! Se obtuvieron ${products.length} productos`);
    }

    console.log('\n📋 Instrucciones para el frontend:');
    console.log('1. Asegúrate de estar logueado como usuario ADMIN');
    console.log('2. Verifica que el token esté en localStorage');
    console.log('3. Revisa la consola del navegador para errores');
    console.log('4. Si hay errores 401/403, el problema es de autenticación');
    console.log('5. Si hay errores 500, el problema es del backend');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugFrontendAuth();