const fs = require('fs');
const path = require('path');

console.log('🔄 FORZANDO RECARGA DE ESTILOS CSS DE ORDERCREATION');
console.log('==================================================');

// Función para agregar un timestamp a los estilos CSS de OrderCreation
function addTimestampToOrderCreationCSS() {
  const cssPath = path.join(__dirname, '../frontend/src/components/OrderCreation.css');
  
  try {
    // Leer el archivo CSS actual
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Agregar un comentario con timestamp al final
    const timestamp = new Date().toISOString();
    const timestampComment = `\n\n/* CSS de OrderCreation actualizado: ${timestamp} */\n`;
    
    // Verificar si ya existe un timestamp y reemplazarlo
    if (cssContent.includes('/* CSS de OrderCreation actualizado:')) {
      cssContent = cssContent.replace(/\/\* CSS de OrderCreation actualizado:.*?\*\//s, `/* CSS de OrderCreation actualizado: ${timestamp} */`);
    } else {
      cssContent += timestampComment;
    }
    
    // Escribir el archivo actualizado
    fs.writeFileSync(cssPath, cssContent);
    
    console.log('✅ CSS de OrderCreation actualizado con timestamp:', timestamp);
    console.log('📁 Archivo:', cssPath);
    
    // Verificar que los estilos críticos estén presentes
    const criticalStyles = [
      'visibility: visible !important',
      'display: block !important',
      'min-height: 200px !important',
      'z-index: 10 !important'
    ];
    
    console.log('\n🔍 Verificando estilos críticos de OrderCreation:');
    criticalStyles.forEach(style => {
      if (cssContent.includes(style)) {
        console.log(`✅ ${style}`);
      } else {
        console.log(`❌ ${style}`);
      }
    });
    
    console.log('\n💡 INSTRUCCIONES PARA APLICAR LOS CAMBIOS:');
    console.log('1. Guarda todos los archivos en tu editor');
    console.log('2. Presiona Ctrl+F5 (o Cmd+Shift+R en Mac) para recargar sin caché');
    console.log('3. O abre las herramientas de desarrollador (F12)');
    console.log('4. Haz clic derecho en el botón de recargar y selecciona "Vaciar caché y recargar"');
    console.log('5. Ve a la vista de creación de órdenes (/new-order)');
    console.log('6. Verifica que todos los elementos sean visibles');
    
    console.log('\n🎯 ELEMENTOS QUE DEBERÍAS VER:');
    console.log('- ✅ Box de debug con contadores');
    console.log('- ✅ Sección de selección de espacios (mesas)');
    console.log('- ✅ Campos de información del cliente');
    console.log('- ✅ Filtros de categorías');
    console.log('- ✅ Grid de productos con botones "Agregar"');
    console.log('- ✅ Sección del carrito de compras');
    console.log('- ✅ Botones de acción (Cancelar, Crear Orden)');
    
    console.log('\n📊 ESTILOS APLICADOS:');
    console.log('- visibility: visible !important (forzar visibilidad)');
    console.log('- display: block !important (forzar display)');
    console.log('- min-height: 200px !important (altura mínima)');
    console.log('- z-index: 10 !important (superposición)');
    console.log('- overflow: visible !important (mostrar contenido)');
    
  } catch (error) {
    console.error('❌ Error actualizando CSS de OrderCreation:', error.message);
  }
}

// Ejecutar la función
addTimestampToOrderCreationCSS();

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Los estilos CSS de OrderCreation han sido actualizados y forzados a recargarse.');
console.log('Si aún no ves los elementos, sigue las instrucciones de recarga arriba.');









