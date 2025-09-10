require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeComboRelationships() {
  console.log('🔍 Analizando relaciones entre combos y componentes...\n');

  try {
    // 1. Verificar OrderItems que son combos
    console.log('1️⃣ ORDERITEMS QUE SON COMBOS:');
    const { data: comboItems, error: comboItemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .not('comboid', 'is', null)
      .limit(5);

    if (comboItemsError) {
      console.error('❌ Error obteniendo combo items:', comboItemsError.message);
    } else {
      console.log('🍱 OrderItems que son combos:', comboItems.length);
      if (comboItems.length > 0) {
        comboItems.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} (Combo ID: ${item.comboid})`);
        });
      }
    }

    // 2. Verificar OrderItemComponent
    console.log('\n2️⃣ ORDERITEMCOMPONENT:');
    const { data: orderItemComponents, error: orderItemComponentsError } = await supabase
      .from('OrderItemComponent')
      .select(`
        *,
        orderItem:OrderItem(*),
        comboComponent:ComboComponent(*)
      `)
      .limit(5);

    if (orderItemComponentsError) {
      console.error('❌ Error obteniendo OrderItemComponents:', orderItemComponentsError.message);
    } else {
      console.log('🧩 OrderItemComponents encontrados:', orderItemComponents.length);
      if (orderItemComponents.length > 0) {
        orderItemComponents.forEach((component, index) => {
          console.log(`   ${index + 1}. OrderItem: ${component.orderItem?.name || 'N/A'}`);
          console.log(`      ComboComponent: ${component.comboComponent?.name || 'N/A'}`);
          console.log(`      Tipo: ${component.comboComponent?.type || 'N/A'}`);
        });
      }
    }

    // 3. Verificar ComboComponents disponibles
    console.log('\n3️⃣ COMBCOMPONENTS DISPONIBLES:');
    const { data: comboComponents, error: comboComponentsError } = await supabase
      .from('ComboComponent')
      .select('*')
      .order('comboId');

    if (comboComponentsError) {
      console.error('❌ Error obteniendo ComboComponents:', comboComponentsError.message);
    } else {
      console.log('🧩 ComboComponents encontrados:', comboComponents.length);
      
      // Agrupar por combo
      const componentsByCombo = {};
      comboComponents.forEach(component => {
        if (!componentsByCombo[component.comboId]) {
          componentsByCombo[component.comboId] = [];
        }
        componentsByCombo[component.comboId].push(component);
      });

      Object.keys(componentsByCombo).forEach(comboId => {
        console.log(`\n   🍱 Combo ID: ${comboId}`);
        componentsByCombo[comboId].forEach(component => {
          console.log(`      - ${component.name} (${component.type}) - $${component.price}`);
        });
      });
    }

    // 4. Verificar si hay datos de componentes seleccionados en alguna parte
    console.log('\n4️⃣ BUSCANDO DATOS DE COMPONENTES SELECCIONADOS:');
    
    // Buscar en OrderItemComponent
    const { data: allOrderItemComponents, error: allOrderItemComponentsError } = await supabase
      .from('OrderItemComponent')
      .select('*');

    if (allOrderItemComponentsError) {
      console.log('   ⚠️  Error obteniendo todos los OrderItemComponents:', allOrderItemComponentsError.message);
    } else {
      console.log(`   📊 Total OrderItemComponents en BD: ${allOrderItemComponents.length}`);
      if (allOrderItemComponents.length > 0) {
        console.log('   📋 Estructura de OrderItemComponent:');
        const firstComponent = allOrderItemComponents[0];
        Object.keys(firstComponent).forEach(key => {
          console.log(`      - ${key}: ${typeof firstComponent[key]} = ${firstComponent[key]}`);
        });
      }
    }

    // 5. Verificar si hay algún campo JSON o similar en OrderItem
    console.log('\n5️⃣ VERIFICANDO CAMPOS ADICIONALES EN ORDERITEM:');
    const { data: sampleOrderItems, error: sampleOrderItemsError } = await supabase
      .from('OrderItem')
      .select('*')
      .limit(3);

    if (sampleOrderItemsError) {
      console.error('❌ Error obteniendo OrderItems de muestra:', sampleOrderItemsError.message);
    } else {
      console.log('   📦 Campos en OrderItem:');
      if (sampleOrderItems.length > 0) {
        const firstItem = sampleOrderItems[0];
        Object.keys(firstItem).forEach(key => {
          const value = firstItem[key];
          const valueType = typeof value;
          console.log(`      - ${key}: ${valueType} = ${value}`);
          
          // Si es un objeto, mostrar su estructura
          if (valueType === 'object' && value !== null) {
            console.log(`        Estructura: ${JSON.stringify(value)}`);
          }
        });
      }
    }

    console.log('\n📊 RESUMEN DE ANÁLISIS:');
    console.log('=' .repeat(50));
    console.log('✅ OrderItems que son combos identificados');
    console.log('✅ OrderItemComponents analizados');
    console.log('✅ ComboComponents disponibles listados');
    console.log('✅ Estructura de datos verificada');
    console.log('✅ Campos adicionales revisados');

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  }
}

analyzeComboRelationships();





