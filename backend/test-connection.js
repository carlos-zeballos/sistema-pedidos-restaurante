const { Client } = require('pg');

const testUrls = [
  {
    name: 'Pooler con SSL',
    url: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require'
  },
  {
    name: 'Pooler sin SSL',
    url: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'
  },
  {
    name: 'Directo con SSL',
    url: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@db.jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres?sslmode=require'
  },
  {
    name: 'Directo sin SSL',
    url: 'postgresql://postgres.jfvkhoxhiudtxskylnrv:muchachos98356@db.jfvkhoxhiudtxskylnrv.supabase.co:5432/postgres'
  }
];

async function testConnection(url, name) {
  const client = new Client({
    connectionString: url,
    ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : false
  });

  try {
    console.log(`\n🔍 Probando: ${name}`);
    console.log(`📡 URL: ${url.replace(/:[^:@]*@/, ':****@')}`);
    
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log(`⏰ Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`📊 Versión: ${result.rows[0].version.split(' ')[0]}`);
    
    await client.end();
    return { success: true, url, name };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    await client.end();
    return { success: false, url, name, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de conexión a Supabase...\n');
  
  for (const test of testUrls) {
    const result = await testConnection(test.url, test.name);
    if (result.success) {
      console.log('\n🎉 ¡Conexión exitosa encontrada!');
      console.log(`📝 URL que funciona: ${result.url}`);
      return result;
    }
  }
  
  console.log('\n💥 Ninguna conexión funcionó. Verifica:');
  console.log('1. Que el proyecto esté activo en Supabase');
  console.log('2. Que las credenciales sean correctas');
  console.log('3. Que no haya firewall bloqueando');
  
  return null;
}

runTests().catch(console.error);
