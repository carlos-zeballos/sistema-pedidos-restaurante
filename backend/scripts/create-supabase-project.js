#!/usr/bin/env node

console.log('🚀 GUÍA PASO A PASO PARA CREAR PROYECTO SUPABASE\n');

console.log('📋 PASO 1: ACCEDER A SUPABASE');
console.log('   1. Ve a https://supabase.com');
console.log('   2. Haz clic en "Start your project" o "Sign In"');
console.log('   3. Inicia sesión con tu cuenta (GitHub, Google, etc.)\n');

console.log('📋 PASO 2: CREAR NUEVO PROYECTO');
console.log('   1. En el dashboard, haz clic en "New Project"');
console.log('   2. Selecciona tu organización (o crea una nueva)');
console.log('   3. Completa la información del proyecto:\n');
console.log('      📝 Nombre del proyecto: restaurant-system');
console.log('      🔑 Contraseña de la base de datos: [CREA UNA CONTRASEÑA SEGURA]');
console.log('      🌍 Región: South America (São Paulo) o la más cercana');
console.log('      💰 Plan: Free tier (hasta 500MB)\n');

console.log('📋 PASO 3: CONFIGURAR LA BASE DE DATOS');
console.log('   1. Espera a que se complete la creación (2-3 minutos)');
console.log('   2. Una vez listo, ve a Settings → Database');
console.log('   3. Busca la sección "Connection string"');
console.log('   4. Copia la "URI" completa\n');

console.log('📋 PASO 4: OBTENER LAS CREDENCIALES');
console.log('   En Settings → Database encontrarás:\n');
console.log('   🔗 Connection string: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres');
console.log('   🔑 Database password: [LA CONTRASEÑA QUE CREASTE]');
console.log('   🌐 Host: db.[PROJECT].supabase.co');
console.log('   👤 User: postgres');
console.log('   📊 Database: postgres\n');

console.log('📋 PASO 5: CONFIGURAR EL ARCHIVO .ENV');
console.log('   1. Abre el archivo .env en la carpeta backend');
console.log('   2. Reemplaza la línea DATABASE_URL con tu nueva connection string');
console.log('   3. El formato debe ser:');
console.log('      DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@db.TU_PROYECTO.supabase.co:5432/postgres"\n');

console.log('📋 PASO 6: VERIFICAR LA CONEXIÓN');
console.log('   1. Ejecuta: npm run supabase:diagnostic');
console.log('   2. Si la conexión es exitosa, continúa con el siguiente paso\n');

console.log('📋 PASO 7: CONFIGURAR LA BASE DE DATOS');
console.log('   1. Ejecuta: npm run db:generate');
console.log('   2. Ejecuta: npm run db:push');
console.log('   3. Ejecuta: npm run db:seed\n');

console.log('📋 PASO 8: INICIAR EL SISTEMA');
console.log('   1. Ejecuta: npm run start:dev (para el backend)');
console.log('   2. En otra terminal, ve a la carpeta frontend y ejecuta: npm start\n');

console.log('⚠️  IMPORTANTE:');
console.log('   • Guarda la contraseña de la base de datos en un lugar seguro');
console.log('   • No compartas las credenciales en repositorios públicos');
console.log('   • La URL del proyecto será algo como: https://TU_PROYECTO.supabase.co\n');

console.log('🔧 CONFIGURACIONES ADICIONALES (OPCIONAL):');
console.log('   • En Settings → API, puedes obtener las claves para usar Supabase desde el frontend');
console.log('   • En Settings → Database → Connection pooling, puedes configurar el pool de conexiones');
console.log('   • En Authentication → Settings, puedes configurar la autenticación\n');

console.log('🎯 Una vez que tengas la nueva connection string, ejecuta:');
console.log('   npm run supabase:diagnostic');
console.log('   Para verificar que todo esté funcionando correctamente.\n');

console.log('💡 CONSEJOS:');
console.log('   • Usa una contraseña fuerte (mínimo 12 caracteres)');
console.log('   • Anota el nombre del proyecto y la contraseña');
console.log('   • El proyecto gratuito tiene límites, pero son suficientes para desarrollo\n');

console.log('🚀 ¡Listo para crear tu proyecto! Sigue los pasos y avísame cuando tengas la connection string.');
