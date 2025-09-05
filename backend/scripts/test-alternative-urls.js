#!/usr/bin/env node

const { Client } = require('pg');

console.log('🔍 PROBANDO DIFERENTES FORMATOS DE URL\n');

const testUrls = [
  'postgresql://postgres:muchachos98356@db.jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres',
  'postgresql://postgres:muchachos98356@jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres',
  'postgresql://postgres:muchachos98356@jfvkhoxhiudtxskylnrv.supabase.co:6543/postgres',
  'postgresql://postgres:muchachos98356@jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres?sslmode=require'
];

async function testUrl(url, index) {
  console.log(`\n🔗 Probando URL ${index + 1}:`);
  console.log(`   ${url.replace(/:[^:@]*@/, ':****@')}`);
  
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log('   ✅ ¡Conexión exitosa!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`   📅 Hora del servidor: ${result.rows[0].current_time}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔄 Probando diferentes formatos de URL...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < testUrls.length; i++) {
    const success = await testUrl(testUrls[i], i);
    if (success) {
      successCount++;
      console.log(`\n🎉 ¡URL ${i + 1} funciona! Usa esta connection string:`);
      console.log(`   ${testUrls[i]}`);
      break;
    }
  }
  
  if (successCount === 0) {
    console.log('\n❌ Ninguna URL funcionó. Posibles causas:');
    console.log('   1. El proyecto aún está en proceso de activación');
    console.log('   2. La contraseña es incorrecta');
    console.log('   3. El Project ID es incorrecto');
    console.log('   4. Problemas de red/DNS');
    
    console.log('\n💡 SOLUCIONES:');
    console.log('   1. Espera 5-10 minutos y vuelve a intentar');
    console.log('   2. Verifica la connection string en Supabase Dashboard');
    console.log('   3. Intenta desde otra red');
    console.log('   4. Contacta soporte de Supabase');
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
