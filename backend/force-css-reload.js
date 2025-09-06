const fs = require('fs');
const path = require('path');

console.log('🔄 FORZANDO RECARGA DE ESTILOS CSS');
console.log('==================================');

// Función para agregar un timestamp a los estilos CSS
function addTimestampToCSS() {
  const cssPath = path.join(__dirname, '../frontend/src/components/CatalogManagement.css');
  
  try {
    // Leer el archivo CSS actual
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Agregar un comentario con timestamp al final
    const timestamp = new Date().toISOString();
    const timestampComment = `\n\n/* CSS actualizado: ${timestamp} */\n`;
    
    // Verificar si ya existe un timestamp y reemplazarlo
    if (cssContent.includes('/* CSS actualizado:')) {
      cssContent = cssContent.replace(/\/\* CSS actualizado:.*?\*\//s, `/* CSS actualizado: ${timestamp} */`);
    } else {
      cssContent += timestampComment;
    }
    
    // Escribir el archivo actualizado
    fs.writeFileSync(cssPath, cssContent);
    
    console.log('✅ CSS actualizado con timestamp:', timestamp);
    console.log('📁 Archivo:', cssPath);
    
    // Verificar que los estilos críticos estén presentes
    const criticalStyles = [
      'width: 100vw !important',
      'height: calc(100vh - 100px) !important',
      'grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important'
    ];
    
    console.log('\n🔍 Verificando estilos críticos:');
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
    console.log('5. Verifica que el área de productos ahora ocupe toda la pantalla');
    
    console.log('\n🎯 CAMBIOS QUE DEBERÍAS VER:');
    console.log('- El contenedor de productos ocupa toda la pantalla');
    console.log('- Las tarjetas de productos son más compactas');
    console.log('- Hay más productos visibles simultáneamente');
    console.log('- El scroll es suave y permite navegar por todos los productos');
    
  } catch (error) {
    console.error('❌ Error actualizando CSS:', error.message);
  }
}

// Ejecutar la función
addTimestampToCSS();

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Los estilos CSS han sido actualizados y forzados a recargarse.');
console.log('Si aún no ves los cambios, sigue las instrucciones de recarga arriba.');





