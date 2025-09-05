const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { CatalogService } = require('./dist/src/catalog/catalog.service');

async function testServiceInjection() {
  console.log('🔍 Probando inyección de dependencias...');
  
  try {
    console.log('📡 Creando aplicación NestJS...');
    const app = await NestFactory.create(AppModule);
    
    console.log('✅ Aplicación creada');
    
    console.log('📡 Obteniendo CatalogService...');
    const catalogService = app.get(CatalogService);
    
    console.log('✅ CatalogService obtenido');
    
    console.log('📡 Probando método getCategories...');
    const categories = await catalogService.getCategories();
    
    console.log('✅ getCategories ejecutado');
    console.log('📊 Categorías encontradas:', categories?.length || 0);
    
    if (categories && categories.length > 0) {
      console.log('📋 Primera categoría:', categories[0]);
    }
    
    await app.close();
    console.log('✅ Aplicación cerrada');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('📋 Stack:', error.stack);
  }
}

testServiceInjection();
