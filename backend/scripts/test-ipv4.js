#!/usr/bin/env node

const { Client } = require('pg');
const dns = require('dns').promises;

console.log('🔍 PROBANDO CONEXIÓN CON IPv4 FORZADO\n');

// Forzar IPv4
dns.setDefaultResultOrder('ipv4first');

const testUrls = [
  'postgresql://postgres:muchachos98356@db.jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres',
  'postgresql://postgres:muchachos98356@jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres'
];

async function testDNS() {
  console.log('🌐 Probando resolución DNS con IPv4 forzado...\n');
  
  const hosts = [
    'db.jfvkhoxhiudtxskylnrv.supabase.co',
    'jfvkhoxhiudtxskylnrv.supabase.co'
  ];
  
  for (const host of hosts) {
    try {
      const addresses = await dns.resolve4(host);
      console.log(`✅ ${host} → ${addresses.join(', ')}`);
    } catch (error) {
      console.log(`❌ ${host} → ${error.message}`);
    }
  }
}

async function testConnection(url, index) {
  console.log(`\n🔗 Probando URL ${index + 1} con IPv4 forzado:`);
  console.log(`   ${url.replace(/:[^:@]*@/, ':****@')}`);
  
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
  });

  try {
    console.log('   🔄 Intentando conectar...');
    await client.connect();
    console.log('   ✅ ¡Conexión exitosa!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log(`   📅 Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`   🗄️  Versión: ${result.rows[0].db_version.split(' ')[0]}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  await testDNS();
  
  console.log('\n🔄 Probando conexiones con IPv4 forzado...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < testUrls.length; i++) {
    const success = await testConnection(testUrls[i], i + 1);
    if (success) {
      successCount++;
      console.log(`\n🎉 ¡URL ${i + 1} funciona con IPv4! Usa esta connection string:`);
      console.log(`   ${testUrls[i]}`);
      break;
    }
  }
  
  if (successCount === 0) {
    console.log('\n❌ IPv4 forzado no funcionó. Recomendación:');
    console.log('\n🚀 USAR SUPABASE DIRECTAMENTE:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Accede a tu proyecto "restaurant-system"');
    console.log('   3. Usa la interfaz web para gestionar la base de datos');
    console.log('   4. Puedes crear tablas, insertar datos, y hacer consultas desde ahí');
    
    console.log('\n💡 VENTAJAS DE USAR SUPABASE DIRECTAMENTE:');
    console.log('   • Sin problemas de conectividad IPv4/IPv6');
    console.log('   • Interfaz visual intuitiva');
    console.log('   • Herramientas integradas (SQL Editor, Table Editor)');
    console.log('   • Gestión de autenticación y permisos');
    console.log('   • Monitoreo en tiempo real');
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('   1. Accede a tu dashboard de Supabase');
    console.log('   2. Ve a Table Editor');
    console.log('   3. Crea las tablas manualmente o importa el esquema');
    console.log('   4. Usa SQL Editor para ejecutar consultas');
  } else {
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Ejecuta: npm run supabase:update-env');
    console.log('2. Pega la URL que funcionó');
    console.log('3. Ejecuta: npm run db:generate');
    console.log('4. Ejecuta: npm run db:push');
    console.log('5. Ejecuta: npm run db:seed');
  }
}

main().catch(console.error);
