#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuración completa del sistema de restaurante\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

async function setupComplete() {
  const backendPath = path.join(__dirname, '..', 'backend');
  const frontendPath = path.join(__dirname, '..', 'frontend');

  log('📋 Verificando estructura del proyecto...', 'blue');
  
  if (!fs.existsSync(backendPath)) {
    log('❌ No se encontró el directorio backend', 'red');
    process.exit(1);
  }

  if (!fs.existsSync(frontendPath)) {
    log('❌ No se encontró el directorio frontend', 'red');
    process.exit(1);
  }

  log('✅ Estructura del proyecto verificada\n', 'green');

  // 1. Configurar Backend
  log('🔧 Configurando Backend...', 'blue');
  
  // Verificar si existe .env
  const envPath = path.join(backendPath, '.env');
  const envExamplePath = path.join(backendPath, 'env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Archivo .env creado desde env.example', 'green');
    } else {
      log('❌ No se encontró env.example', 'red');
      process.exit(1);
    }
  } else {
    log('✅ Archivo .env ya existe', 'green');
  }

  // Instalar dependencias del backend
  log('📦 Instalando dependencias del backend...', 'yellow');
  if (!runCommand('npm install', backendPath)) {
    log('❌ Error instalando dependencias del backend', 'red');
    process.exit(1);
  }

  // Generar cliente Prisma
  log('🗄️ Generando cliente Prisma...', 'yellow');
  if (!runCommand('npm run db:generate', backendPath)) {
    log('❌ Error generando cliente Prisma', 'red');
    process.exit(1);
  }

  log('✅ Backend configurado correctamente\n', 'green');

  // 2. Configurar Frontend
  log('🎨 Configurando Frontend...', 'blue');
  
  // Instalar dependencias del frontend
  log('📦 Instalando dependencias del frontend...', 'yellow');
  if (!runCommand('npm install', frontendPath)) {
    log('❌ Error instalando dependencias del frontend', 'red');
    process.exit(1);
  }

  log('✅ Frontend configurado correctamente\n', 'green');

  // 3. Instrucciones finales
  log('🎉 ¡Configuración completada exitosamente!', 'green');
  log('\n📋 Próximos pasos:', 'blue');
  log('1. Configura tu base de datos:', 'yellow');
  log('   - Para Supabase: npm run supabase:setup');
  log('   - Para PostgreSQL local: Actualiza DATABASE_URL en .env');
  log('\n2. Ejecuta las migraciones:', 'yellow');
  log('   cd backend');
  log('   npm run db:push');
  log('   npm run db:seed');
  log('\n3. Inicia el servidor backend:', 'yellow');
  log('   cd backend');
  log('   npm run start:dev');
  log('\n4. Inicia el frontend (en otra terminal):', 'yellow');
  log('   cd frontend');
  log('   npm start');
  log('\n5. Prueba el sistema:', 'yellow');
  log('   cd backend');
  log('   npm run test:system');
  log('\n🔑 Credenciales de prueba:', 'blue');
  log('   Usuario: admin, waiter, cook');
  log('   Contraseña: 123456');
  log('\n🌐 URLs del sistema:', 'blue');
  log('   Frontend: http://localhost:3000');
  log('   Backend: http://localhost:3001');
  log('   Prisma Studio: http://localhost:5555 (npm run db:studio)');
  log('\n💡 Tips importantes:', 'blue');
  log('- Mantén ambas terminales abiertas (backend y frontend)');
  log('- El backend debe estar corriendo para que el frontend funcione');
  log('- Si tienes problemas, revisa los logs en las terminales');
  log('- Para reiniciar: npm run db:reset en el backend');
}

// Ejecutar configuración
setupComplete();
