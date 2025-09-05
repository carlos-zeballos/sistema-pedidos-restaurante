#!/usr/bin/env node

const { Client } = require('pg');

console.log('🔍 Diagnosticando conexión a Supabase...\n');

// Leer la URL de la base de datos desde .env
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let databaseUrl = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL="([^"]+)"/);
  if (match) {
    databaseUrl = match[1];
  }
}

if (!databaseUrl) {
  console.log('❌ No se encontró DATABASE_URL en el archivo .env');
  console.log('📝 Verifica que el archivo .env contenga:');
  console.log('   DATABASE_URL="postgresql://postgres:CONTRASEÑA@db.PROYECTO.supabase.co:5432/postgres"');
  process.exit(1);
}

console.log('📋 Información de conexión:');
console.log(`   URL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);

// Extraer información de la URL
const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (urlMatch) {
  const [, user, password, host, port, database] = urlMatch;
  console.log(`   Usuario: ${user}`);
  console.log(`   Host: ${host}`);
  console.log(`   Puerto: ${port}`);
  console.log(`   Base de datos: ${database}`);
  console.log(`   Contraseña: ${password ? '****' : 'no especificada'}`);
}

console.log('\n🔧 Posibles problemas y soluciones:\n');

console.log('1️⃣ PROYECTO INACTIVO:');
console.log('   • Ve a https://supabase.com/dashboard');
console.log('   • Verifica que tu proyecto esté activo');
console.log('   • Si está pausado, reactívalo\n');

console.log('2️⃣ IP NO AUTORIZADA:');
console.log('   • En Supabase Dashboard, ve a Settings → Database');
console.log('   • Busca "Connection pooling" o "IP allowlist"');
console.log('   • Agrega tu IP actual a la lista blanca\n');

console.log('3️⃣ CREDENCIALES INCORRECTAS:');
console.log('   • Verifica que la contraseña sea correcta');
console.log('   • En Settings → Database, copia la "Connection string" exacta\n');

console.log('4️⃣ PROYECTO ELIMINADO:');
console.log('   • Verifica que el proyecto aún exista');
console.log('   • Si fue eliminado, crea uno nuevo\n');

console.log('5️⃣ PROBLEMAS DE RED:');
console.log('   • Verifica tu conexión a internet');
console.log('   • Intenta desde otra red si es posible\n');

console.log('🔍 Para verificar tu IP actual:');
console.log('   • Ve a https://whatismyipaddress.com/');
console.log('   • Copia tu IP y agrégala a la whitelist de Supabase\n');

console.log('📞 Si el problema persiste:');
console.log('   • Revisa los logs en Supabase Dashboard');
console.log('   • Verifica el estado del servicio en https://status.supabase.com/');
console.log('   • Contacta soporte de Supabase si es necesario\n');

// Intentar conexión
console.log('\n🔄 Intentando conexión...');
const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('✅ ¡Conexión exitosa!');
    console.log('🎉 Tu base de datos está funcionando correctamente');
    return client.query('SELECT NOW()');
  })
  .then((result) => {
    console.log(`📅 Hora del servidor: ${result.rows[0].now}`);
    return client.end();
  })
  .catch((error) => {
    console.log('❌ Error de conexión:');
    console.log(`   ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solución: El servidor rechazó la conexión');
      console.log('   • Verifica que el proyecto esté activo');
      console.log('   • Revisa la URL de conexión');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Solución: No se puede resolver el host');
      console.log('   • Verifica la URL de conexión');
      console.log('   • Asegúrate de que el proyecto exista');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Solución: Error de autenticación');
      console.log('   • Verifica la contraseña');
      console.log('   • Copia la URL exacta de Supabase');
    }
  });
