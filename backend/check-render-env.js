// =========================================================
// SCRIPT PARA VERIFICAR VARIABLES DE ENTORNO EN RENDER
// =========================================================

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO EN RENDER...\n');

// Variables requeridas para Supabase
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
];

console.log('📋 VARIABLES REQUERIDAS:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('KEY') || varName.includes('SECRET') ? 
      `${value.substring(0, 10)}...` : value) : 
    'NO CONFIGURADA';
  
  console.log(`${status} ${varName}: ${displayValue}`);
});

console.log('\n🔧 CONFIGURACIÓN ACTUAL:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`PORT: ${process.env.PORT || 'undefined'}`);

// Verificar Supabase específicamente
console.log('\n🔗 CONFIGURACIÓN SUPABASE:');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  console.log('✅ Supabase configurado correctamente');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...`);
} else {
  console.log('❌ Supabase NO configurado');
  console.log('Variables faltantes:');
  if (!supabaseUrl) console.log('  - SUPABASE_URL');
  if (!supabaseKey) console.log('  - SUPABASE_SERVICE_ROLE_KEY');
}

// Verificar base de datos
console.log('\n🗄️ CONFIGURACIÓN BASE DE DATOS:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log('✅ DATABASE_URL configurada');
  console.log(`URL: ${dbUrl.substring(0, 50)}...`);
} else {
  console.log('❌ DATABASE_URL NO configurada');
}

console.log('\n📝 INSTRUCCIONES PARA RENDER:');
console.log('1. Ve a tu dashboard de Render');
console.log('2. Selecciona tu servicio backend');
console.log('3. Ve a "Environment"');
console.log('4. Agrega estas variables:');
console.log('   - SUPABASE_URL: https://tu-proyecto.supabase.co');
console.log('   - SUPABASE_SERVICE_ROLE_KEY: tu-service-role-key');
console.log('   - DATABASE_URL: postgresql://...');
console.log('   - JWT_SECRET: tu-jwt-secret');
console.log('   - PORT: 3001');
console.log('   - NODE_ENV: production');
console.log('5. Guarda y redepleya el servicio');

