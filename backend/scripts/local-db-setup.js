#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Base de Datos Local...\n');

console.log('📋 INFORMACIÓN NECESARIA PARA CONFIGURAR:');
console.log('   • Usuario de PostgreSQL (ej: postgres)');
console.log('   • Contraseña de PostgreSQL');
console.log('   • Nombre de la base de datos (ej: restaurant_db)');
console.log('   • Host (ej: localhost)');
console.log('   • Puerto (ej: 5432)\n');

console.log('🔧 FORMATO DE LA URL:');
console.log('   DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB"\n');

console.log('📝 EJEMPLO:');
console.log('   DATABASE_URL="postgresql://postgres:mi_contraseña@localhost:5432/restaurant_db"\n');

console.log('💡 PASOS PARA CONFIGURAR:');
console.log('1. Abre el archivo .env en la carpeta backend');
console.log('2. Reemplaza la línea DATABASE_URL con tu configuración local');
console.log('3. Ejecuta: npm run db:generate');
console.log('4. Ejecuta: npm run db:seed');
console.log('5. Ejecuta: npm run start:dev\n');

console.log('⚠️  IMPORTANTE:');
console.log('   • Asegúrate de que PostgreSQL esté corriendo');
console.log('   • Verifica que la base de datos exista');
console.log('   • Confirma que el usuario tenga permisos\n');

// Verificar si existe .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env encontrado');
  console.log('📝 Actualiza DATABASE_URL con tu configuración local\n');
} else {
  console.log('❌ Archivo .env no encontrado');
  console.log('📝 Ejecuta: copy env.example .env\n');
}

console.log('🚀 Una vez configurado, tu sistema funcionará con la base de datos local!');
