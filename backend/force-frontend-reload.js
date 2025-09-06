const fs = require('fs');
const path = require('path');

console.log('🔄 FORZANDO RECARGA DEL FRONTEND');
console.log('================================');

// Función para agregar un timestamp a los archivos principales del frontend
function addTimestampToFiles() {
  const files = [
    '../frontend/src/components/Catalog.tsx',
    '../frontend/src/components/OrderCreation.tsx',
    '../frontend/src/services/api.ts'
  ];

  files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const timestamp = new Date().toISOString();
        const timestampComment = `\n\n/* Frontend actualizado: ${timestamp} */\n`;
        
        // Verificar si ya existe un timestamp y reemplazarlo
        if (content.includes('/* Frontend actualizado:')) {
          content = content.replace(/\/\* Frontend actualizado:.*?\*\//s, `/* Frontend actualizado: ${timestamp} */`);
        } else {
          content += timestampComment;
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath} actualizado con timestamp: ${timestamp}`);
      } else {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
  });
}

// Ejecutar la función
addTimestampToFiles();

console.log('\n💡 INSTRUCCIONES PARA VERIFICAR EL FRONTEND:');
console.log('=============================================');
console.log('1. Abre el navegador y ve a http://localhost:3000');
console.log('2. Abre las herramientas de desarrollador (F12)');
console.log('3. Ve a la pestaña Console');
console.log('4. Navega a la vista del catálogo (/catalog)');
console.log('5. Busca estos logs en la consola:');
console.log('   - "🔄 Catalog.loadData - Iniciando carga de datos..."');
console.log('   - "✅ Catalog.loadData - Categorías cargadas: X"');
console.log('   - "✅ Catalog.loadData - Productos cargados: X"');
console.log('6. Si ves errores, compártelos para diagnosticar el problema');

console.log('\n🔍 LOGS ESPERADOS EN LA CONSOLA:');
console.log('=================================');
console.log('✅ "🔄 Catalog.loadData - Iniciando carga de datos..."');
console.log('✅ "📡 Catalog.loadData - Llamando a catalogService.getCategories()..."');
console.log('✅ "✅ Catalog.loadData - Categorías cargadas: 9"');
console.log('✅ "📡 Catalog.loadData - Llamando a catalogService.getProducts()..."');
console.log('✅ "✅ Catalog.loadData - Productos cargados: X"');
console.log('✅ "🎉 Catalog.loadData - Datos cargados exitosamente"');

console.log('\n❌ POSIBLES ERRORES:');
console.log('====================');
console.log('❌ "Error al cargar los datos: Network Error" - Problema de conexión');
console.log('❌ "Error al cargar los datos: Request failed with status code 500" - Error del backend');
console.log('❌ "Error al cargar los datos: Request failed with status code 404" - Endpoint no encontrado');
console.log('❌ "Error al cargar los datos: Unauthorized" - Problema de autenticación');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Los archivos del frontend han sido actualizados.');
console.log('Ahora recarga la página y revisa la consola del navegador.');






