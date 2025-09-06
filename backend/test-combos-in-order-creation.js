const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testCombosInOrderCreation() {
  console.log('🧪 PROBANDO COMBOS EN CREACIÓN DE ÓRDENES');
  console.log('==========================================');

  try {
    console.log('\n📡 Probando endpoint de combos...');
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/catalog/public/combos`,
      timeout: 5000
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Combos recibidos: ${Array.isArray(response.data) ? response.data.length : 'N/A'} elementos`);
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('\n📝 Primer combo:');
      const firstCombo = response.data[0];
      console.log(`   - ID: ${firstCombo.id}`);
      console.log(`   - Nombre: ${firstCombo.name}`);
      console.log(`   - Precio base: $${firstCombo.basePrice}`);
      console.log(`   - Disponible: ${firstCombo.isAvailable ? 'Sí' : 'No'}`);
      console.log(`   - Componentes: ${firstCombo.components ? firstCombo.components.length : 0}`);
      
      if (firstCombo.components && firstCombo.components.length > 0) {
        console.log('\n🍽️ Componentes del combo:');
        firstCombo.components.forEach((comp, index) => {
          console.log(`   ${index + 1}. ${comp.name} - ${comp.type} - $${comp.price}`);
        });
      }
    } else {
      console.log('⚠️  No hay combos disponibles en la base de datos');
    }

    console.log('\n🎯 VERIFICACIÓN EN EL FRONTEND:');
    console.log('===============================');
    console.log('1. Ve a http://localhost:3000/new-order');
    console.log('2. Abre las herramientas de desarrollador (F12)');
    console.log('3. Ve a la pestaña Console');
    console.log('4. Busca estos logs:');
    console.log('   - "📡 OrderCreation.loadData - Llamando a catalogService.getCombos()..."');
    console.log('   - "✅ OrderCreation.loadData - Combos cargados: X"');
    console.log('5. Verifica que en el debug box aparezca: "Combos: X"');
    console.log('6. Busca la sección "🍽️ Seleccionar Combos"');
    console.log('7. Deberías ver los combos con botones "🍽️ Agregar Combo"');

    console.log('\n🔍 SI NO VES COMBOS:');
    console.log('====================');
    console.log('❌ Si el debug box muestra "Combos: 0":');
    console.log('   - No hay combos en la base de datos');
    console.log('   - Ve a la vista de gestión de catálogo para crear combos');
    console.log('❌ Si hay combos pero no se muestran:');
    console.log('   - Revisa la consola del navegador para errores');
    console.log('   - Verifica que el endpoint /catalog/public/combos funcione');

    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Si no hay combos, crea algunos en la vista de gestión');
    console.log('2. Si hay combos, verifica que se muestren en la vista de órdenes');
    console.log('3. Prueba agregar un combo al carrito');
    console.log('4. Verifica que el combo aparezca en el carrito con el precio correcto');

  } catch (error) {
    console.error('❌ Error probando combos:', error.message);
    console.error('   Status:', error.response?.status || 'N/A');
    console.error('   Response:', error.response?.data || 'N/A');
  }
}

testCombosInOrderCreation().catch(console.error);





