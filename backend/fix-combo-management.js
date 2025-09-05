require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function diagnoseComboIssues() {
  console.log('🔍 Diagnóstico de problemas en gestión de combos...');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Verificar estructura de tablas
    console.log('\n📊 1. Verificando estructura de tablas...');
    
    const { data: comboTable, error: comboError } = await supabase
      .from('Combo')
      .select('*')
      .limit(1);
    
    if (comboError) {
      console.log('❌ Error al acceder a tabla Combo:', comboError.message);
    } else {
      console.log('✅ Tabla Combo accesible');
      // Mostrar columnas disponibles
      if (comboTable && comboTable.length > 0) {
        console.log('  Columnas disponibles:', Object.keys(comboTable[0]));
      }
    }

    const { data: categoryTable, error: categoryError } = await supabase
      .from('Category')
      .select('*')
      .limit(1);
    
    if (categoryError) {
      console.log('❌ Error al acceder a tabla Category:', categoryError.message);
    } else {
      console.log('✅ Tabla Category accesible');
      if (categoryTable && categoryTable.length > 0) {
        console.log('  Columnas disponibles:', Object.keys(categoryTable[0]));
      }
    }

    const { data: productTable, error: productError } = await supabase
      .from('Product')
      .select('*')
      .limit(1);
    
    if (productError) {
      console.log('❌ Error al acceder a tabla Product:', productError.message);
    } else {
      console.log('✅ Tabla Product accesible');
      if (productTable && productTable.length > 0) {
        console.log('  Columnas disponibles:', Object.keys(productTable[0]));
      }
    }

    // 2. Verificar categorías existentes
    console.log('\n📂 2. Verificando categorías...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('Category')
      .select('id, name, isactive')
      .eq('isactive', true);

    if (categoriesError) {
      console.log('❌ Error al obtener categorías:', categoriesError.message);
    } else {
      console.log(`✅ Categorías encontradas: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`);
      });
    }

    // 3. Verificar productos por tipo
    console.log('\n🍽️ 3. Verificando productos por tipo...');
    
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, name, type, categoryid, isactive, isavailable')
      .eq('isactive', true)
      .eq('isavailable', true);

    if (productsError) {
      console.log('❌ Error al obtener productos:', productsError.message);
    } else {
      console.log(`✅ Productos encontrados: ${products.length}`);
      
      const comidaProducts = products.filter(p => p.type === 'COMIDA');
      const bebidaProducts = products.filter(p => p.type === 'BEBIDA');
      const postreProducts = products.filter(p => p.type === 'POSTRE');
      
      console.log(`  - COMIDA: ${comidaProducts.length} productos`);
      console.log(`  - BEBIDA: ${bebidaProducts.length} productos`);
      console.log(`  - POSTRE: ${postreProducts.length} productos`);
      
      if (comidaProducts.length > 0) {
        console.log('  Ejemplos de COMIDA:');
        comidaProducts.slice(0, 3).forEach(p => {
          console.log(`    * ${p.name} (ID: ${p.id})`);
        });
      }
    }

    // 4. Verificar combos existentes
    console.log('\n🍽️ 4. Verificando combos existentes...');
    
    const { data: combos, error: combosError } = await supabase
      .from('Combo')
      .select('id, name, code, isactive, isavailable');

    if (combosError) {
      console.log('❌ Error al obtener combos:', combosError.message);
    } else {
      console.log(`✅ Combos encontrados: ${combos.length}`);
      combos.forEach(combo => {
        console.log(`  - ${combo.name} (${combo.code}) - Activo: ${combo.isactive}, Disponible: ${combo.isavailable}`);
      });
    }

    // 5. Verificar RPCs de combo
    console.log('\n🔧 5. Verificando RPCs de combo...');
    
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('combo_create_or_update_basic', {
        p_code: 'TEST_RPC',
        p_name: 'Test RPC',
        p_base_price: 10.00,
        p_category_id: categories?.[0]?.id || 'test-category',
        p_platos_ids: [],
        p_platos_max: 2,
        p_acomp_ids: [],
        p_acomp_max: 1,
        p_description: 'Test RPC',
        p_image: null,
        p_is_enabled: true,
        p_is_available: true,
        p_preparation_time: 15,
        p_id: null
      });

    if (rpcError) {
      console.log('❌ Error en RPC combo_create_or_update_basic:', rpcError.message);
      
      // Verificar si el RPC existe
      console.log('\n🔍 Verificando si el RPC existe...');
      const { data: functions, error: functionsError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .ilike('routine_name', '%combo%');
      
      if (functionsError) {
        console.log('❌ Error al verificar funciones:', functionsError.message);
      } else {
        console.log('📋 Funciones de combo disponibles:');
        functions.forEach(f => console.log(`  - ${f.routine_name}`));
      }
    } else {
      console.log('✅ RPC combo_create_or_update_basic funciona correctamente');
      console.log('ID del combo creado:', rpcData);
    }

    // 6. Recomendaciones
    console.log('\n💡 6. RECOMENDACIONES:');
    
    if (!categories || categories.length === 0) {
      console.log('❌ PROBLEMA: No hay categorías activas');
      console.log('   SOLUCIÓN: Crear al menos una categoría en la base de datos');
    }
    
    if (!products || products.length === 0) {
      console.log('❌ PROBLEMA: No hay productos disponibles');
      console.log('   SOLUCIÓN: Crear productos en la base de datos');
    }
    
    if (products && products.length > 0) {
      const comidaProducts = products.filter(p => p.type === 'COMIDA');
      if (comidaProducts.length === 0) {
        console.log('❌ PROBLEMA: No hay productos de tipo COMIDA');
        console.log('   SOLUCIÓN: Crear productos con type = "COMIDA"');
      }
    }
    
    if (rpcError) {
      console.log('❌ PROBLEMA: RPC combo_create_or_update_basic no funciona');
      console.log('   SOLUCIÓN: Verificar que el RPC esté creado en la base de datos');
    }

    // 7. Crear combo de prueba si todo está bien
    if (categories && categories.length > 0 && products && products.length > 0 && !rpcError) {
      console.log('\n🧪 7. Creando combo de prueba...');
      
      const testCombo = {
        code: 'TEST_COMBO',
        name: 'Combo de Prueba',
        basePrice: 25.90,
        categoryId: categories[0].id,
        platosIds: products.filter(p => p.type === 'COMIDA').slice(0, 2).map(p => p.id),
        platosMax: 2,
        acompIds: [],
        acompMax: 0,
        chopsticksQuantity: 1,
        chopsticksType: 'NORMAL',
        description: 'Combo de prueba para testing',
        isEnabled: true,
        isAvailable: true,
        preparationTime: 15
      };

      console.log('📋 Datos del combo de prueba:', JSON.stringify(testCombo, null, 2));
      
      const { data: testComboData, error: testComboError } = await supabase
        .rpc('combo_create_or_update_basic', {
          p_code: testCombo.code,
          p_name: testCombo.name,
          p_base_price: testCombo.basePrice,
          p_category_id: testCombo.categoryId,
          p_platos_ids: testCombo.platosIds,
          p_platos_max: testCombo.platosMax,
          p_acomp_ids: testCombo.acompIds,
          p_acomp_max: testCombo.acompMax,
          p_description: testCombo.description,
          p_image: null,
          p_is_enabled: testCombo.isEnabled,
          p_is_available: testCombo.isAvailable,
          p_preparation_time: testCombo.preparationTime,
          p_id: null
        });

      if (testComboError) {
        console.log('❌ Error al crear combo de prueba:', testComboError.message);
      } else {
        console.log('✅ Combo de prueba creado exitosamente con ID:', testComboData);
      }
    }

  } catch (error) {
    console.error('💥 Error general en diagnóstico:', error.message);
  }
}

diagnoseComboIssues().catch(console.error);
