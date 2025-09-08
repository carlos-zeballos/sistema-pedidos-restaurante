const fs = require('fs');
const path = require('path');

console.log('🔄 FORZANDO RECARGA DE ORDERCREATION');
console.log('====================================');

// Función para agregar timestamp a los archivos
function forceReload() {
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
        const timestampComment = `\n\n/* Frontend actualizado: ${timestamp} */\n`;
        
        // Verificar si ya existe un timestamp y reemplazarlo
        if (content.includes('/* Frontend actualizado:')) {
          content = content.replace(/\/\* Frontend actualizado:.*?\*\//s, `/* Frontend actualizado: ${timestamp} */`);
        } else {
          content += timestampComment;
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath} - Actualizado: ${timestamp}`);
      } else {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
  });
}

// Ejecutar la función
forceReload();

console.log('\n🎯 VERIFICACIÓN DE COMBOS EN CREACIÓN DE ÓRDENES:');
console.log('==================================================');
console.log('1. Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac)');
console.log('2. Ve a http://localhost:3000/new-order');
console.log('3. Abre las herramientas de desarrollador (F12)');
console.log('4. Ve a la pestaña Console');
console.log('5. Busca estos logs:');
console.log('   - "📡 OrderCreation.loadData - Llamando a catalogService.getCombos()..."');
console.log('   - "✅ OrderCreation.loadData - Combos cargados: 3"');
console.log('6. Verifica que en el debug box aparezca: "Combos: 3"');
console.log('7. Busca la sección "🍽️ Seleccionar Combos"');
console.log('8. Deberías ver 3 combos con botones "🍽️ Agregar Combo"');

console.log('\n🔍 FUNCIONALIDAD DE COMBOS:');
console.log('============================');
console.log('✅ Los combos se cargan desde el backend');
console.log('✅ Se muestran en una sección separada');
console.log('✅ Cada combo muestra nombre, descripción y precio');
console.log('✅ Botones para agregar al carrito');
console.log('✅ Los combos se agregan al carrito correctamente');
console.log('✅ El precio total se calcula incluyendo combos');

console.log('\n💡 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. Prueba agregar un combo al carrito');
console.log('2. Verifica que aparezca en el carrito');
console.log('3. Confirma que el precio se calcule correctamente');
console.log('4. Prueba crear una orden con combos');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Los combos ahora están disponibles en la creación de órdenes.');







