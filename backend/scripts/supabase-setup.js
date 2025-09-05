#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Supabase para tu proyecto...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env creado desde env.example');
  } else {
    console.log('❌ No se encontró env.example');
    process.exit(1);
  }
} else {
  console.log('✅ Archivo .env ya existe');
}

console.log('\n📋 Pasos para configurar Supabase:');
console.log('1. Ve a https://supabase.com y crea un nuevo proyecto');
console.log('2. En la configuración del proyecto, ve a "Database"');
console.log('3. Copia la "Connection string" (URI)');
console.log('4. Reemplaza la DATABASE_URL en tu archivo .env');
console.log('5. Ejecuta los siguientes comandos:\n');

console.log('   npm run db:generate');
console.log('   npm run db:push');
console.log('   npm run db:seed\n');

console.log('🔍 Para verificar la conexión:');
console.log('   npm run db:studio\n');

console.log('🚀 Para iniciar el servidor:');
console.log('   npm run start:dev\n');

console.log('💡 Tips para Supabase:');
console.log('- Asegúrate de que tu IP esté en la whitelist de Supabase');
console.log('- Usa la connection string con SSL habilitado');
console.log('- Verifica que las variables de entorno estén correctas');
console.log('- Si tienes problemas, revisa los logs en Supabase Dashboard');
