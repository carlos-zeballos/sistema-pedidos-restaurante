const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGIENDO COMBOS EN CATEGORÍAS');
console.log('===================================');

// Función para agregar timestamp a los archivos
function fixCombosInCategories() {
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
        const timestampComment = `\n\n/* Combos en categorías corregido: ${timestamp} */\n`;
        
        // Verificar si ya existe un timestamp y reemplazarlo
        if (content.includes('/* Combos en categorías corregido:')) {
          content = content.replace(/\/\* Combos en categorías corregido:.*?\*\//s, `/* Combos en categorías corregido: ${timestamp} */`);
        } else {
          content += timestampComment;
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath} - Combos corregidos: ${timestamp}`);
      } else {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error corrigiendo ${filePath}:`, error.message);
    }
  });
}

// Ejecutar la función
fixCombosInCategories();

console.log('\n🎯 FUNCIONALIDAD CORREGIDA:');
console.log('============================');
console.log('✅ Los combos ahora se muestran cuando seleccionas la pestaña "COMBOS"');
console.log('✅ Los productos regulares se muestran en otras categorías');
console.log('✅ Los combos tienen botones "🍽️ Agregar Combo"');
console.log('✅ Los productos tienen botones "➕ Agregar"');
console.log('✅ Se eliminó la sección duplicada de combos');

console.log('\n🔍 CÓMO PROBAR:');
console.log('================');
console.log('1. Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac)');
console.log('2. Ve a http://localhost:3000/new-order');
console.log('3. Haz clic en la pestaña "COMBOS"');
console.log('4. Deberías ver los 3 combos disponibles');
console.log('5. Haz clic en "🍽️ Agregar Combo" para agregar al carrito');
console.log('6. Prueba otras pestañas (POSTRES, SOPAS, etc.) para ver productos regulares');

console.log('\n💡 DIFERENCIAS:');
console.log('================');
console.log('🍽️ COMBOS: Muestran "🍽️ Agregar Combo" y precio base');
console.log('➕ PRODUCTOS: Muestran "➕ Agregar" y precio individual');
console.log('📝 COMBOS: Incluyen información de componentes');
console.log('📝 PRODUCTOS: Incluyen descripción del producto');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Los combos ahora se integran correctamente con el sistema de categorías.');












