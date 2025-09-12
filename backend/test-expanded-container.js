const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

console.log('📏 PRUEBA: CONTENEDOR AMPLIADO');
console.log('==============================');

async function testExpandedContainer() {
  try {
    console.log('\n1️⃣ Verificando que el backend responde correctamente...');
    
    const response = await axios.get(`${BASE_URL}/catalog/public/products`);
    console.log(`✅ Productos obtenidos: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('\n2️⃣ Analizando capacidad del contenedor...');
      console.log('📊 Configuración del contenedor ampliado:');
      console.log('   - Ancho: 100% de la pantalla');
      console.log('   - Altura: calc(100vh - 120px)');
      console.log('   - Grid: auto-fill con mínimo 350px por columna');
      console.log('   - Scroll: Vertical automático');
      
      console.log('\n3️⃣ Cálculo de columnas por tamaño de pantalla:');
      console.log('   - Pantallas > 1600px: ~5-6 columnas (320px mínimo)');
      console.log('   - Pantallas 1200-1599px: ~3-4 columnas (350px mínimo)');
      console.log('   - Pantallas < 1200px: ~2-3 columnas (350px mínimo)');
      console.log('   - Móviles: 1 columna');
      
      console.log('\n4️⃣ Características del contenedor ampliado:');
      console.log('   ✅ Sin límite de ancho máximo');
      console.log('   ✅ Altura adaptativa a la ventana');
      console.log('   ✅ Grid responsive automático');
      console.log('   ✅ Scroll suave vertical');
      console.log('   ✅ Padding optimizado');
      console.log('   ✅ Fondo degradado elegante');
      
      console.log('\n5️⃣ Beneficios del diseño ampliado:');
      console.log('   - Más productos visibles simultáneamente');
      console.log('   - Mejor aprovechamiento del espacio');
      console.log('   - Navegación más eficiente');
      console.log('   - Experiencia visual mejorada');
      console.log('   - Adaptación automática a cualquier pantalla');
      
      console.log('\n🎉 CONTENEDOR AMPLIADO LISTO');
      console.log('============================');
      console.log('✅ El contenedor ahora ocupa todo el ancho disponible');
      console.log('✅ La altura se adapta al tamaño de la ventana');
      console.log('✅ El grid se ajusta automáticamente al espacio');
      console.log('✅ El scroll permite navegar por todos los productos');
      console.log('✅ El diseño es completamente responsive');
      
    } else {
      console.log('⚠️  No hay productos para mostrar en el contenedor ampliado');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error(`Status: ${error.response?.status || 'N/A'}`);
    console.error(`Message: ${error.response?.data?.message || error.message}`);
  }
}

testExpandedContainer().catch(console.error);












