const fs = require('fs');
const path = require('path');

console.log('🔄 FORZANDO RECARGA DE ESTILOS CSS DEL CATÁLOGO');
console.log('===============================================');

// Función para agregar un timestamp a los estilos CSS del catálogo
function addTimestampToCatalogCSS() {
  const cssPath = path.join(__dirname, '../frontend/src/components/Catalog.css');
  
  try {
    // Leer el archivo CSS actual
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Agregar un comentario con timestamp al final
    const timestamp = new Date().toISOString();
    const timestampComment = `\n\n/* CSS del catálogo actualizado: ${timestamp} */\n`;
    
    // Verificar si ya existe un timestamp y reemplazarlo
    if (cssContent.includes('/* CSS del catálogo actualizado:')) {
      cssContent = cssContent.replace(/\/\* CSS del catálogo actualizado:.*?\*\//s, `/* CSS del catálogo actualizado: ${timestamp} */`);
    } else {
      cssContent += timestampComment;
    }
    
    // Escribir el archivo actualizado
    fs.writeFileSync(cssPath, cssContent);
    
    console.log('✅ CSS del catálogo actualizado con timestamp:', timestamp);
    console.log('📁 Archivo:', cssPath);
    
    // Verificar que los estilos críticos estén presentes
    const criticalStyles = [
      'width: 100vw !important',
      'min-height: calc(100vh - 20px) !important',
      'grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important'
    ];
    
    console.log('\n🔍 Verificando estilos críticos del catálogo:');
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
    console.log('5. Verifica que el área de productos del catálogo ahora ocupe toda la pantalla');
    
    console.log('\n🎯 CAMBIOS QUE DEBERÍAS VER EN EL CATÁLOGO:');
    console.log('- El contenedor del catálogo ocupa toda la pantalla');
    console.log('- Las tarjetas de productos son más compactas');
    console.log('- Hay más productos visibles simultáneamente');
    console.log('- El grid se adapta automáticamente al espacio disponible');
    console.log('- Mejor aprovechamiento del espacio de pantalla');
    
    console.log('\n📊 CONFIGURACIÓN APLICADA:');
    console.log('- Ancho: 100vw (pantalla completa)');
    console.log('- Altura: calc(100vh - 20px) (casi toda la pantalla)');
    console.log('- Grid: minmax(280px, 1fr) (más productos por fila)');
    console.log('- Gap: 15px (espaciado optimizado)');
    console.log('- Estilos forzados con !important');
    
  } catch (error) {
    console.error('❌ Error actualizando CSS del catálogo:', error.message);
  }
}

// Ejecutar la función
addTimestampToCatalogCSS();

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Los estilos CSS del catálogo han sido actualizados y forzados a recargarse.');
console.log('Si aún no ves los cambios, sigue las instrucciones de recarga arriba.');








