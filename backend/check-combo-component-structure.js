require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkComboComponentStructure() {
  console.log('🔍 Verificando estructura de tabla ComboComponent...');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Verificar si la tabla existe
    console.log('\n📊 1. Verificando existencia de tabla ComboComponent...');
    
    const { data: tableData, error: tableError } = await supabase
      .from('ComboComponent')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error al acceder a tabla ComboComponent:', tableError.message);
      return;
    }

    console.log('✅ Tabla ComboComponent accesible');
    
    // 2. Verificar columnas disponibles
    if (tableData && tableData.length > 0) {
      console.log('  Columnas disponibles:', Object.keys(tableData[0]));
    } else {
      console.log('  La tabla está vacía, creando registro de prueba...');
      
      // Crear un registro de prueba
      const { data: testData, error: testError } = await supabase
        .from('ComboComponent')
        .insert({
          comboId: 'test-combo-id',
          productId: 'test-product-id',
          type: 'PLATOS',
          maxSelections: 3
        })
        .select()
        .single();
      
      if (testError) {
        console.log('❌ Error al crear registro de prueba:', testError.message);
        return;
      }
      
      console.log('✅ Registro de prueba creado');
      console.log('  Columnas disponibles:', Object.keys(testData));
      
      // Limpiar el registro de prueba
      await supabase
        .from('ComboComponent')
        .delete()
        .eq('comboId', 'test-combo-id');
    }

    // 3. Verificar datos existentes
    console.log('\n📋 2. Verificando datos existentes...');
    
    const { data: allComponents, error: fetchError } = await supabase
      .from('ComboComponent')
      .select('*')
      .limit(10);

    if (fetchError) {
      console.log('❌ Error al obtener componentes:', fetchError.message);
      return;
    }

    console.log(`✅ Componentes encontrados: ${allComponents.length}`);
    allComponents.forEach((comp, index) => {
      console.log(`  ${index + 1}. Combo: ${comp.comboId}, Producto: ${comp.productId}, Tipo: ${comp.type}, Max: ${comp.maxSelections}`);
    });

    // 4. Verificar el combo que creamos antes
    console.log('\n🔍 3. Verificando combo creado anteriormente...');
    
    const { data: combo, error: comboError } = await supabase
      .from('Combo')
      .select('*')
      .eq('code', 'COMBO_TEST')
      .single();

    if (comboError) {
      console.log('❌ Error al obtener combo:', comboError.message);
      return;
    }

    console.log('✅ Combo encontrado:', combo.name);
    
    // 5. Verificar componentes de este combo
    const { data: comboComponents, error: componentsError } = await supabase
      .from('ComboComponent')
      .select('*')
      .eq('comboId', combo.id);

    if (componentsError) {
      console.log('❌ Error al obtener componentes del combo:', componentsError.message);
      return;
    }

    console.log(`✅ Componentes del combo "${combo.name}": ${comboComponents.length}`);
    comboComponents.forEach((comp, index) => {
      console.log(`  ${index + 1}. Producto ID: ${comp.productId}, Tipo: ${comp.type}, Max: ${comp.maxSelections}`);
      
      // Verificar si el producto existe
      if (comp.productId) {
        supabase
          .from('Product')
          .select('name')
          .eq('id', comp.productId)
          .single()
          .then(({ data: product, error: productError }) => {
            if (productError) {
              console.log(`    ❌ Producto no encontrado: ${comp.productId}`);
            } else {
              console.log(`    ✅ Producto: ${product.name}`);
            }
          });
      }
    });

  } catch (error) {
    console.error('💥 Error general en verificación:', error.message);
  }
}

checkComboComponentStructure().catch(console.error);






