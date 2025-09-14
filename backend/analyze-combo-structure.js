require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeComboStructure() {
  console.log('🔍 Analizando estructura de combos y componentes...\n');

  try {
    // 1. Verificar estructura de OrderItem
    console.log('1️⃣ ESTRUCTURA DE ORDERITEM:');
    const { data: orderItems, error: itemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .limit(5);

    if (itemsError) {
      console.error('❌ Error obteniendo OrderItems:', itemsError.message);
      return;
    }

    console.log('📦 OrderItems encontrados:', orderItems.length);
    if (orderItems.length > 0) {
      const firstItem = orderItems[0];
      console.log('   Campos disponibles:');
      Object.keys(firstItem).forEach(key => {
        console.log(`   - ${key}: ${typeof firstItem[key]} = ${firstItem[key]}`);
      });
    }

    // 2. Verificar si hay OrderItemComponent
    console.log('\n2️⃣ ESTRUCTURA DE ORDERITEMCOMPONENT:');
    const { data: components, error: componentsError } = await supabase
      .from('OrderItemComponent')
      .select('*')
      .limit(5);

    if (componentsError) {
      console.log('   ⚠️  Tabla OrderItemComponent no existe o error:', componentsError.message);
    } else {
      console.log('🧩 OrderItemComponents encontrados:', components.length);
      if (components.length > 0) {
        const firstComponent = components[0];
        console.log('   Campos disponibles:');
        Object.keys(firstComponent).forEach(key => {
          console.log(`   - ${key}: ${typeof firstComponent[key]} = ${firstComponent[key]}`);
        });
      }
    }

    // 3. Verificar estructura de Combo
    console.log('\n3️⃣ ESTRUCTURA DE COMBO:');
    const { data: combos, error: combosError } = await supabase
      .from('Combo')
      .select('*')
      .limit(3);

    if (combosError) {
      console.log('   ⚠️  Tabla Combo no existe o error:', combosError.message);
    } else {
      console.log('🍱 Combos encontrados:', combos.length);
      if (combos.length > 0) {
        const firstCombo = combos[0];
        console.log('   Campos disponibles:');
        Object.keys(firstCombo).forEach(key => {
          console.log(`   - ${key}: ${typeof firstCombo[key]} = ${firstCombo[key]}`);
        });
      }
    }

    // 4. Verificar estructura de ComboComponent
    console.log('\n4️⃣ ESTRUCTURA DE COMBCOMPONENT:');
    const { data: comboComponents, error: comboComponentsError } = await supabase
      .from('ComboComponent')
      .select('*')
      .limit(5);

    if (comboComponentsError) {
      console.log('   ⚠️  Tabla ComboComponent no existe o error:', comboComponentsError.message);
    } else {
      console.log('🧩 ComboComponents encontrados:', comboComponents.length);
      if (comboComponents.length > 0) {
        const firstComboComponent = comboComponents[0];
        console.log('   Campos disponibles:');
        Object.keys(firstComboComponent).forEach(key => {
          console.log(`   - ${key}: ${typeof firstComboComponent[key]} = ${firstComboComponent[key]}`);
        });
      }
    }

    // 5. Verificar si hay datos de selectedComponents en OrderItem
    console.log('\n5️⃣ VERIFICANDO SELECTEDCOMPONENTS EN ORDERITEM:');
    const { data: itemsWithComponents, error: itemsWithComponentsError } = await supabase
      .from('OrderItem')
      .select('*')
      .not('selectedComponents', 'is', null)
      .limit(3);

    if (itemsWithComponentsError) {
      console.log('   ⚠️  Error obteniendo items con componentes:', itemsWithComponentsError.message);
    } else {
      console.log('📦 Items con selectedComponents:', itemsWithComponents.length);
      if (itemsWithComponents.length > 0) {
        itemsWithComponents.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name}:`);
          console.log(`      selectedComponents: ${JSON.stringify(item.selectedComponents)}`);
        });
      }
    }

    // 6. Verificar todas las tablas disponibles
    console.log('\n6️⃣ TABLAS DISPONIBLES EN LA BD:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('   ⚠️  No se pudieron obtener las tablas:', tablesError.message);
    } else {
      console.log('   Tablas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    console.log('\n📊 RESUMEN DE ANÁLISIS:');
    console.log('=' .repeat(40));
    console.log('✅ Estructura de OrderItem analizada');
    console.log('✅ Componentes de combos verificados');
    console.log('✅ Tablas disponibles listadas');
    console.log('✅ Datos de selectedComponents revisados');

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  }
}

analyzeComboStructure();











