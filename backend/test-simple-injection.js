const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');

async function testSimpleInjection() {
  console.log('🔍 Probando inyección simple...');
  
  try {
    console.log('📡 Creando aplicación NestJS...');
    const app = await NestFactory.create(AppModule);
    
    console.log('✅ Aplicación creada');
    
    console.log('📡 Obteniendo SupabaseService...');
    const { SupabaseService } = require('./dist/src/lib/supabase.service');
    const supabaseService = app.get(SupabaseService);
    
    console.log('✅ SupabaseService obtenido');
    
    console.log('📡 Probando getClient...');
    const client = supabaseService.getClient();
    
    console.log('✅ Cliente obtenido');
    
    console.log('📡 Probando query simple...');
    const { data, error } = await client
      .from('Category')
      .select('id,name')
      .limit(1);
    
    if (error) {
      console.log('❌ Error en query:', error);
    } else {
      console.log('✅ Query exitosa');
      console.log('📊 Datos:', data);
    }
    
    await app.close();
    console.log('✅ Aplicación cerrada');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.stack) {
      console.log('📋 Stack:', error.stack);
    }
  }
}

testSimpleInjection();













