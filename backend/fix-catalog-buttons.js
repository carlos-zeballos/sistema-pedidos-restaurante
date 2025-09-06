const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGIENDO VISIBILIDAD DE BOTONES EN CATÁLOGO');
console.log('=================================================');

// Función para agregar estilos de forzado de visibilidad
function fixCatalogButtons() {
  const cssFilePath = path.join(__dirname, '../frontend/src/components/CatalogManagement.css');
  
  try {
    let content = fs.readFileSync(cssFilePath, 'utf8');
    const timestamp = new Date().toISOString();
    
    // Agregar estilos de forzado de visibilidad
    const forceVisibilityStyles = `
/* ===== FORZAR VISIBILIDAD DE BOTONES - ${timestamp} ===== */
.add-button {
  background: #27ae60 !important;
  color: white !important;
  border: none !important;
  padding: 10px 20px !important;
  border-radius: 5px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: background 0.3s ease !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 1000 !important;
  min-width: 150px !important;
  height: auto !important;
  line-height: normal !important;
}

.add-button:hover {
  background: #229954 !important;
  color: white !important;
}

.section-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 20px !important;
  width: 100% !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.section-header h2 {
  color: #2c3e50 !important;
  margin: 0 !important;
  display: block !important;
  visibility: visible !important;
}

.tab-content {
  background: white !important;
  border-radius: 8px !important;
  padding: 15px !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
  width: 100% !important;
  min-height: calc(100vh - 150px) !important;
  box-sizing: border-box !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Forzar visibilidad de todos los botones */
button {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Forzar visibilidad de tabs */
.tabs {
  display: flex !important;
  gap: 10px !important;
  margin-bottom: 30px !important;
  border-bottom: 2px solid #ecf0f1 !important;
  padding-bottom: 10px !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.tab {
  padding: 12px 24px !important;
  border: none !important;
  background: #ecf0f1 !important;
  color: #7f8c8d !important;
  border-radius: 8px 8px 0 0 !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.tab.active {
  background: #3498db !important;
  color: white !important;
}

/* Forzar visibilidad del contenedor principal */
.catalog-management {
  padding: 10px !important;
  max-width: none !important;
  margin: 0 !important;
  width: 100vw !important;
  min-height: 100vh !important;
  box-sizing: border-box !important;
  position: relative !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* ===== FIN FORZAR VISIBILIDAD ===== */
`;

    // Verificar si ya existe el comentario de forzado de visibilidad
    if (!content.includes('FORZAR VISIBILIDAD DE BOTONES')) {
      content += forceVisibilityStyles;
    } else {
      // Reemplazar el comentario existente
      content = content.replace(
        /\/\* ===== FORZAR VISIBILIDAD DE BOTONES - .*? ===== \*\/[\s\S]*?\/\* ===== FIN FORZAR VISIBILIDAD ===== \*\//,
        forceVisibilityStyles.trim()
      );
    }
    
    fs.writeFileSync(cssFilePath, content, 'utf8');
    console.log(`✅ ${cssFilePath} - Visibilidad de botones forzada: ${timestamp}`);
    
  } catch (error) {
    console.error('❌ Error corrigiendo visibilidad de botones:', error.message);
  }
}

// Ejecutar la función
fixCatalogButtons();

console.log('\n🎯 PROBLEMAS CORREGIDOS:');
console.log('=========================');
console.log('✅ Botones de crear forzados a ser visibles');
console.log('✅ Sección header forzada a ser visible');
console.log('✅ Tabs forzados a ser visibles');
console.log('✅ Contenedor principal forzado a ser visible');
console.log('✅ Z-index alto para botones');
console.log('✅ Opacidad y visibilidad forzadas');

console.log('\n🔍 BOTONES QUE DEBERÍAN APARECER:');
console.log('=================================');
console.log('➕ Nuevo Producto (en pestaña Productos)');
console.log('➕ Nueva Categoría (en pestaña Categorías)');
console.log('➕ Nuevo Espacio (en pestaña Espacios)');
console.log('➕ Nuevo Combo (en pestaña Combos)');

console.log('\n💡 CÓMO PROBAR:');
console.log('================');
console.log('1. Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac)');
console.log('2. Ve a http://localhost:3000/catalog-management');
console.log('3. Verifica que aparezcan las 4 pestañas');
console.log('4. Haz clic en cada pestaña y verifica que aparezca el botón de crear');
console.log('5. Los botones deberían ser verdes con texto blanco');

console.log('\n🚨 SI SIGUEN SIN APARECER:');
console.log('==========================');
console.log('1. Verifica que no haya errores en la consola del navegador');
console.log('2. Verifica que el componente CatalogManagement se esté renderizando');
console.log('3. Verifica que no haya conflictos de CSS');
console.log('4. Verifica que el estado activeTab esté funcionando correctamente');

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Estilos de forzado de visibilidad aplicados.');
console.log('Los botones de crear deberían ser visibles ahora.');






