require('dotenv').config();

console.log('🔍 Verificando variables de entorno...');
console.log('=====================================');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NO ENCONTRADA`);
    allVarsPresent = false;
  }
});

console.log('\n=====================================');
if (allVarsPresent) {
  console.log('✅ Todas las variables de entorno están presentes');
} else {
  console.log('❌ Faltan variables de entorno');
}

// Probar creación del cliente Supabase
console.log('\n🔍 Probando creación del cliente Supabase...');
try {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ No se pueden crear las variables de Supabase');
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'public' },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Cliente Supabase creado correctamente');
  }
} catch (error) {
  console.log('❌ Error creando cliente Supabase:', error.message);
}








