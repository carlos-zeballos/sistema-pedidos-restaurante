const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando backend...');

// Iniciar el backend en modo desarrollo
const backend = spawn('npm', ['run', 'start:dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

backend.on('error', (error) => {
  console.error('❌ Error al iniciar el backend:', error);
});

backend.on('close', (code) => {
  console.log(`Backend terminado con código: ${code}`);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});

