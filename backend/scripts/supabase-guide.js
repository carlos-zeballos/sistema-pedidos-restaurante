#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Guía para crear proyecto en Supabase\n');

console.log('📋 PASOS PARA CREAR TU PROYECTO EN SUPABASE:\n');

console.log('1️⃣ CREAR CUENTA:');
console.log('   • Ve a https://supabase.com');
console.log('   • Haz clic en "Start your project"');
console.log('   • Inicia sesión con GitHub, Google o crea cuenta nueva\n');

console.log('2️⃣ CREAR PROYECTO:');
console.log('   • Haz clic en "New Project"');
console.log('   • Selecciona tu organización');
console.log('   • Nombre: restaurant-system (o el que prefieras)');
console.log('   • Contraseña: Crea una contraseña segura (¡GUÁRDALA!)');
console.log('   • Región: South America (o la más cercana)');
console.log('   • Haz clic en "Create new project"\n');

console.log('3️⃣ OBTENER CREDENCIALES:');
console.log('   • Ve a Settings → Database');
console.log('   • Busca "Connection string"');
console.log('   • Copia la URI que aparece\n');

console.log('4️⃣ CONFIGURAR .ENV:');
console.log('   • Abre el archivo .env en la carpeta backend');
console.log('   • Reemplaza DATABASE_URL con tu URI de Supabase');
console.log('   • Ejemplo:');
console.log('     DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@db.TU_PROYECTO.supabase.co:5432/postgres"\n');

console.log('5️⃣ EJECUTAR COMANDOS:');
console.log('   • npm run db:generate');
console.log('   • npm run db:push');
console.log('   • npm run db:seed\n');

console.log('🔧 COMANDOS PARA EJECUTAR DESPUÉS DE CONFIGURAR:');
console.log('   npm run db:generate');
console.log('   npm run db:push');
console.log('   npm run db:seed');
console.log('   npm run start:dev\n');

console.log('💡 TIPS IMPORTANTES:');
console.log('   • Guarda bien tu contraseña de la base de datos');
console.log('   • La URI debe incluir tu contraseña y referencia del proyecto');
console.log('   • Si tienes problemas, verifica que la IP esté en whitelist');
console.log('   • El proyecto puede tardar unos minutos en estar listo\n');

console.log('🎯 ¿NECESITAS AYUDA?');
console.log('   • Revisa los logs en Supabase Dashboard');
console.log('   • Verifica que la URI esté correcta');
console.log('   • Asegúrate de que el proyecto esté activo\n');

// Verificar si existe .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado');
  console.log('📝 Recuerda actualizar DATABASE_URL con tu URI de Supabase\n');
} else {
  console.log('❌ Archivo .env no encontrado');
  console.log('📝 Ejecuta: copy env.example .env\n');
}

console.log('🚀 ¡Una vez configurado, tu sistema estará listo para usar!');
