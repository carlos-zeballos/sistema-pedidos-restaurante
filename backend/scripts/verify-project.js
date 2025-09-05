#!/usr/bin/env node

console.log('🔍 VERIFICACIÓN DEL PROYECTO SUPABASE\n');

console.log('📋 INFORMACIÓN DE TU PROYECTO:');
console.log('   • Nombre: restaurant-system');
console.log('   • Project ID: jfvkhoxhiudtxskylnrv');
console.log('   • Contraseña: muchachos98356\n');

console.log('🔧 PASOS PARA VERIFICAR Y SOLUCIONAR:\n');

console.log('1️⃣ VERIFICAR QUE EL PROYECTO ESTÉ ACTIVO:');
console.log('   • Ve a https://supabase.com/dashboard');
console.log('   • Busca tu proyecto "restaurant-system"');
console.log('   • Verifica que el estado sea "Active" (no "Paused")\n');

console.log('2️⃣ OBTENER LA CONNECTION STRING CORRECTA:');
console.log('   • Haz clic en tu proyecto "restaurant-system"');
console.log('   • Ve a Settings → Database');
console.log('   • Busca la sección "Connection string"');
console.log('   • Copia la "URI" completa (no la "Connection pooling")\n');

console.log('3️⃣ VERIFICAR LA URL DEL PROYECTO:');
console.log('   • La URL debe ser: https://jfvkhoxhiudtxskylnrv.supabase.co');
console.log('   • Si no puedes acceder, el proyecto puede estar pausado\n');

console.log('4️⃣ POSIBLES PROBLEMAS:');
console.log('   • El proyecto está pausado (reactívalo)');
console.log('   • El Project ID es incorrecto');
console.log('   • La contraseña es incorrecta');
console.log('   • El proyecto fue eliminado\n');

console.log('5️⃣ SOLUCIONES:');
console.log('   • Si está pausado: Reactiva el proyecto');
console.log('   • Si no existe: Crea uno nuevo');
console.log('   • Si las credenciales son incorrectas: Verifica en Settings → Database\n');

console.log('🎯 UNA VEZ QUE VERIFIQUES:');
console.log('   1. Copia la connection string correcta');
console.log('   2. Ejecuta: npm run supabase:update-env');
console.log('   3. Pega la nueva connection string');
console.log('   4. Ejecuta: npm run supabase:diagnostic\n');

console.log('💡 CONSEJO:');
console.log('   • La connection string debe verse así:');
console.log('     postgresql://postgres:muchachos98356@db.jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres');
console.log('   • Si el host es diferente, usa esa URL\n');

console.log('🚀 Ve a tu dashboard de Supabase y verifica el estado del proyecto.');
