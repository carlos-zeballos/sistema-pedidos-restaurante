#!/usr/bin/env node

const { Client } = require('pg');
const dns = require('dns').promises;

console.log('🔍 PRUEBAS DE CONEXIÓN ALTERNATIVAS\n');

const testHosts = [
  'db.jfvkhoxhiudtxskylnrv.supabase.co',
  'jfvkhoxhiudtxskylnrv.supabase.co',
  'supabase.co'
];

async function testDNS() {
  console.log('🌐 Probando resolución DNS...\n');
  
  for (const host of testHosts) {
    try {
      const addresses = await dns.resolve4(host);
      console.log(`✅ ${host} → ${addresses.join(', ')}`);
    } catch (error) {
      console.log(`❌ ${host} → ${error.message}`);
    }
  }
}

async function testConnection() {
  console.log('\n🔗 Probando conexión directa...\n');
  
  const connectionString = 'postgresql://postgres:muchachos98356@db.jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    query_timeout: 10000
  });

  try {
    console.log('🔄 Intentando conectar...');
    await client.connect();
    console.log('✅ ¡Conexión exitosa!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log(`📅 Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`🗄️  Versión: ${result.rows[0].db_version.split(' ')[0]}`);
    
    await client.end();
  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(`   ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 El problema es DNS. Posibles soluciones:');
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. Intenta desde otra red');
      console.log('   3. Usa un DNS alternativo (8.8.8.8, 1.1.1.1)');
      console.log('   4. El proyecto puede estar en proceso de activación');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 El servidor rechazó la conexión');
      console.log('   1. Verifica que el proyecto esté activo');
      console.log('   2. Revisa la URL de conexión');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Error de autenticación');
      console.log('   1. Verifica la contraseña');
      console.log('   2. Copia la URL exacta de Supabase');
    }
  }
}

async function main() {
  await testDNS();
  await testConnection();
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Si el DNS falla: Espera unos minutos y vuelve a intentar');
  console.log('2. Si la conexión funciona: Continúa con npm run db:generate');
  console.log('3. Si persiste el problema: Verifica en Supabase Dashboard');
}

main().catch(console.error);
