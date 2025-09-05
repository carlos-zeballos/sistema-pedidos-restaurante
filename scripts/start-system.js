#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Sistema de Restaurante...\n');

const backendPath = path.join(__dirname, '..', 'backend');
const frontendPath = path.join(__dirname, '..', 'frontend');

console.log('📋 Verificando configuración...\n');

// Función para ejecutar comandos
function runCommand(command, cwd, name) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Iniciando ${name}...`);
    
    const child = spawn(command, [], {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} completado exitosamente`);
        resolve();
      } else {
        console.log(`❌ ${name} falló con código ${code}`);
        reject(new Error(`${name} falló`));
      }
    });

    child.on('error', (error) => {
      console.log(`❌ Error iniciando ${name}:`, error.message);
      reject(error);
    });
  });
}

async function startSystem() {
  try {
    console.log('🔧 Configurando base de datos...');
    
    // Configurar base de datos
    await runCommand('npm run db:generate', backendPath, 'Generación de Prisma');
    await runCommand('npm run db:push', backendPath, 'Sincronización de base de datos');
    await runCommand('npm run db:seed', backendPath, 'Población de datos');
    
    console.log('\n🎉 ¡Base de datos configurada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Abre una nueva terminal para el backend:');
    console.log(`   cd ${backendPath}`);
    console.log('   npm run start:dev');
    console.log('\n2. Abre otra terminal para el frontend:');
    console.log(`   cd ${frontendPath}`);
    console.log('   npm start');
    console.log('\n🌐 URLs del sistema:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend: http://localhost:3001');
    console.log('\n🔑 Credenciales:');
    console.log('   Usuario: admin, waiter, cook');
    console.log('   Contraseña: 123456');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verifica que tu DATABASE_URL esté correcta en .env');
    console.log('2. Asegúrate de que tu proyecto Supabase esté activo');
    console.log('3. Verifica tu conexión a internet');
    console.log('4. Revisa los logs para más detalles');
  }
}

// Verificar si el usuario quiere continuar
console.log('⚠️  IMPORTANTE: Asegúrate de haber configurado tu DATABASE_URL en .env');
console.log('   Si no lo has hecho, ejecuta: npm run supabase:guide\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('¿Quieres continuar con la configuración? (y/n): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    startSystem();
  } else {
    console.log('❌ Configuración cancelada');
    console.log('💡 Ejecuta npm run supabase:guide para ver las instrucciones');
  }
});
