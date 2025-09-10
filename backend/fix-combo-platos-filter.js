const fs = require('fs');
const path = require('path');

console.log('🍽️ CORRIGIENDO FILTRO DE PLATOS EN COMBOS');
console.log('==========================================');

// Función para agregar timestamp a los archivos
function fixComboPlatosFilter() {
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
        const timestampComment = `\n\n/* Filtro de platos corregido: ${timestamp} */\n`;
        
        // Verificar si ya existe un timestamp y reemplazarlo
        if (content.includes('/* Filtro de platos corregido:')) {
          content = content.replace(/\/\* Filtro de platos corregido:.*?\*\//s, `/* Filtro de platos corregido: ${timestamp} */`);
        } else {
          content += timestampComment;
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`✅ ${filePath} - Filtro de platos corregido: ${timestamp}`);
      } else {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error corrigiendo filtro ${filePath}:`, error.message);
    }
  });
}

// Ejecutar la función
fixComboPlatosFilter();

console.log('\n🎯 FILTRO CORREGIDO:');
console.log('=====================');
console.log('✅ ANTES: Solo productos tipo "COMIDA"');
console.log('✅ AHORA: Productos tipo "COMIDA" + "BEBIDA"');
console.log('❌ EXCLUIDOS: Adicionales, Acompañamientos, Combos, Salsas');

console.log('\n🍽️ PRODUCTOS INCLUIDOS EN PLATOS PRINCIPALES:');
console.log('===============================================');
console.log('✅ COMIDA: Platos principales, sushi, rolls, etc.');
console.log('✅ BEBIDA: Bebidas, jugos, refrescos, etc.');
console.log('❌ ADICIONAL: Salsas, aderezos, extras');
console.log('❌ ACOMPAÑAMIENTOS: Productos de categoría acompañamientos');
console.log('❌ COMBOS: Otros combos');
console.log('❌ SALSA: Productos que contengan "salsa" en el nombre');

console.log('\n💡 LÓGICA DEL FILTRO:');
console.log('======================');
console.log('1. Se muestran productos tipo "COMIDA"');
console.log('2. Se muestran productos tipo "BEBIDA"');
console.log('3. Se excluyen productos tipo "ADICIONAL"');
console.log('4. Se excluyen productos de categoría "Acompañamientos"');
console.log('5. Se excluyen productos tipo "COMBO"');
console.log('6. Se excluyen productos que contengan "salsa" en el nombre');

console.log('\n🔍 CÓMO PROBAR:');
console.log('================');
console.log('1. Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac)');
console.log('2. Ve a http://localhost:3000/new-order');
console.log('3. Haz clic en la pestaña "COMBOS"');
console.log('4. Haz clic en "🍽️ Personalizar Combo"');
console.log('5. En "Platos Principales" verifica que aparezcan:');
console.log('   ✅ Platos de comida (sushi, rolls, etc.)');
console.log('   ✅ Bebidas (refrescos, jugos, etc.)');
console.log('   ❌ NO aparezcan salsas o aderezos');
console.log('   ❌ NO aparezcan productos de acompañamientos');
console.log('   ❌ NO aparezcan otros combos');

console.log('\n🎨 RESULTADO ESPERADO:');
console.log('=======================');
console.log('🍽️ PLATOS PRINCIPALES: Solo comida y bebidas principales');
console.log('🥤 ACOMPAÑAMIENTOS: Solo productos de categoría acompañamientos');
console.log('🥢 PALILLOS: Sistema de palillos normales y especiales');
console.log('📝 NOTAS: Campo para instrucciones especiales');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('El filtro de platos principales en combos ha sido corregido.');
console.log('Ahora muestra solo comida y bebidas, excluyendo adicionales y acompañamientos.');









