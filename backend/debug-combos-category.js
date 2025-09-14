const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING COMBOS CATEGORY');
console.log('============================');

// Función para agregar timestamp a los archivos
function debugCombosCategory() {
  const filesToUpdate = [
    '../frontend/src/components/OrderCreation.tsx',
    '../frontend/src/components/OrderCreation.css'
  ];

  filesToUpdate.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const timestamp = new Date().toISOString();
        const timestampComment = `\n\n/* Debug combos category: ${timestamp} */\n`;
        
        // Verificar si ya existe un timestamp y reemplazarlo
        if (content.includes('/* Debug combos category:')) {
          content = content.replace(/\/\* Debug combos category:.*?\*\//s, `/* Debug combos category: ${timestamp} */`);
        } else {
          content += timestampComment;
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath} - Debug agregado: ${timestamp}`);
      } else {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error agregando debug ${filePath}:`, error.message);
    }
  });
}

// Ejecutar la función
debugCombosCategory();

console.log('\n🔍 DEBUGGING INSTRUCCIONES:');
console.log('============================');
console.log('1. Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac)');
console.log('2. Ve a http://localhost:3000/new-order');
console.log('3. Abre las herramientas de desarrollador (F12)');
console.log('4. Ve a la pestaña Console');
console.log('5. Haz clic en la pestaña "COMBOS"');
console.log('6. Busca estos logs en la consola:');
console.log('   - "🔍 getSelectedCategoryName: { selectedCategory: ..., categoryName: ..., categories: ... }"');
console.log('   - "🔍 Renderizando productos/combos: { categoryName: ..., isCombosCategory: ..., combosCount: ..., productsCount: ... }"');

console.log('\n🎯 QUÉ BUSCAR:');
console.log('===============');
console.log('✅ Si categoryName es "COMBOS" o "Combos"');
console.log('✅ Si isCombosCategory es true');
console.log('✅ Si combosCount es 3 (o el número de combos disponibles)');
console.log('❌ Si categoryName es null o undefined');
console.log('❌ Si isCombosCategory es false');
console.log('❌ Si combosCount es 0');

console.log('\n💡 POSIBLES PROBLEMAS:');
console.log('======================');
console.log('1. La categoría "COMBOS" no existe en la base de datos');
console.log('2. El nombre de la categoría no es exactamente "COMBOS"');
console.log('3. Los combos no se están cargando correctamente');
console.log('4. El filtrado por categoría no está funcionando');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Debug agregado. Revisa la consola del navegador para diagnosticar el problema.');















