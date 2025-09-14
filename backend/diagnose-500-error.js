const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

console.log('🔍 DIAGNÓSTICO DE ERROR 500');
console.log('==========================');

// 1. Verificar variables de entorno
console.log('\n1. Variables de entorno:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Presente' : '❌ Faltante');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Presente' : '❌ Faltante');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ ERROR: Variables de entorno faltantes');
  console.log('Crea un archivo .env con:');
  console.log('SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  process.exit(1);
}

// 2. Crear cliente Supabase
console.log('\n2. Creando cliente Supabase...');
try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Cliente Supabase creado correctamente');
} catch (error) {
  console.log('❌ Error creando cliente Supabase:', error.message);
  process.exit(1);
}

// 3. Probar conexión a la base de datos
console.log('\n3. Probando conexión a la base de datos...');
async function testConnection() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Probar consulta simple
    const { data, error } = await supabase
      .from('Category')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log('❌ Error en consulta:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a base de datos exitosa');
    console.log('📊 Datos de prueba:', data);
    return true;
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

// 4. Probar RPCs
console.log('\n4. Probando RPCs...');
async function testRPCs() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Probar auth_login
    const { data: authData, error: authError } = await supabase
      .rpc('auth_login', {
        p_identifier: 'admin',
        p_password: 'Admin123!'
      });
    
    if (authError) {
      console.log('❌ Error en auth_login:', authError.message);
    } else {
      console.log('✅ auth_login funcionando');
    }
    
    // Probar category_upsert
    const { data: catData, error: catError } = await supabase
      .rpc('category_upsert', {
        p_name: 'Test Category',
        p_ord: 999
      });
    
    if (catError) {
      console.log('❌ Error en category_upsert:', catError.message);
    } else {
      console.log('✅ category_upsert funcionando');
    }
    
  } catch (error) {
    console.log('❌ Error probando RPCs:', error.message);
  }
}

// Ejecutar diagnóstico
async function runDiagnosis() {
  const connectionOk = await testConnection();
  if (connectionOk) {
    await testRPCs();
  }
  
  console.log('\n📋 RESUMEN:');
  console.log('- Si todas las pruebas pasan, el problema está en NestJS');
  console.log('- Si fallan las pruebas, el problema está en Supabase');
  console.log('- Verifica que el archivo .env tenga las credenciales correctas');
}

runDiagnosis().catch(console.error);















