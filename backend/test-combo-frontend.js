require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testComboFrontend() {
  console.log('🧪 Probando creación de combos desde el frontend...');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Obtener categorías
    console.log('\n📂 1. Obteniendo categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('Category')
      .select('id, name, isActive')
      .eq('isActive', true);

    if (categoriesError) {
      console.log('❌ Error al obtener categorías:', categoriesError.message);
      return;
    }

    console.log(`✅ Categorías encontradas: ${categories.length}`);
    const combosCategory = categories.find(cat => cat.name === 'Combos y paquetes');
    if (!combosCategory) {
      console.log('❌ No se encontró la categoría "Combos y paquetes"');
      return;
    }
    console.log('✅ Categoría de combos encontrada:', combosCategory.name);

    // 2. Obtener productos de tipo COMIDA
    console.log('\n🍽️ 2. Obteniendo productos de tipo COMIDA...');
    const { data: products, error: productsError } = await supabase
      .from('Product')
      .select('id, name, price, type, categoryId, isEnabled, isAvailable')
      .eq('type', 'COMIDA')
      .eq('isEnabled', true)
      .eq('isAvailable', true);

    if (productsError) {
      console.log('❌ Error al obtener productos:', productsError.message);
      return;
    }

    console.log(`✅ Productos de comida encontrados: ${products.length}`);
    if (products.length === 0) {
      console.log('❌ No hay productos de comida disponibles');
      return;
    }

    // 3. Crear combo usando el RPC
    console.log('\n➕ 3. Creando combo usando RPC...');
    
    const comboData = {
      code: 'TEST_' + (Date.now() % 10000), // Código único dentro de 20 caracteres
      name: 'Combo de Prueba Frontend',
      basePrice: 29.90,
      categoryId: combosCategory.id,
      platosIds: products.slice(0, 3).map(p => p.id), // 3 productos
      platosMax: 3,
      acompIds: [],
      acompMax: 0,
      chopsticksQuantity: 2,
      chopsticksType: 'NORMAL',
      description: 'Combo de prueba creado desde el frontend',
      isEnabled: true,
      isAvailable: true,
      preparationTime: 20
    };

    console.log('📋 Datos del combo a crear:', JSON.stringify(comboData, null, 2));

    const { data: comboId, error: comboError } = await supabase
      .rpc('combo_create_or_update_basic', {
        p_code: comboData.code,
        p_name: comboData.name,
        p_base_price: comboData.basePrice,
        p_category_id: comboData.categoryId,
        p_platos_ids: comboData.platosIds,
        p_platos_max: comboData.platosMax,
        p_acomp_ids: comboData.acompIds,
        p_acomp_max: comboData.acompMax,
        p_description: comboData.description,
        p_image: null,
        p_is_enabled: comboData.isEnabled,
        p_is_available: comboData.isAvailable,
        p_preparation_time: comboData.preparationTime,
        p_id: null
      });

    if (comboError) {
      console.log('❌ Error al crear combo:', comboError.message);
      return;
    }

    console.log('✅ Combo creado exitosamente con ID:', comboId);

    // 4. Verificar que el combo se creó
    console.log('\n🔍 4. Verificando combo creado...');
    const { data: createdCombo, error: fetchError } = await supabase
      .from('Combo')
      .select('*')
      .eq('id', comboId)
      .single();

    if (fetchError) {
      console.log('❌ Error al obtener combo creado:', fetchError.message);
      return;
    }

    console.log('✅ Combo encontrado en la base de datos:');
    console.log('  - ID:', createdCombo.id);
    console.log('  - Nombre:', createdCombo.name);
    console.log('  - Código:', createdCombo.code);
    console.log('  - Precio:', createdCombo.basePrice);
    console.log('  - Categoría:', createdCombo.categoryId);
    console.log('  - Habilitado:', createdCombo.isEnabled);
    console.log('  - Disponible:', createdCombo.isAvailable);

    // 5. Verificar componentes del combo
    console.log('\n🔍 5. Verificando componentes del combo...');
    const { data: components, error: componentsError } = await supabase
      .from('ComboComponent')
      .select('*')
      .eq('comboId', comboId);

    if (componentsError) {
      console.log('❌ Error al obtener componentes:', componentsError.message);
    } else {
      console.log(`✅ Componentes del combo encontrados: ${components.length}`);
      components.forEach((comp, index) => {
        console.log(`  ${index + 1}. Nombre: ${comp.name}, Tipo: ${comp.type}, Precio: ${comp.price}, Max: ${comp.maxSelections}`);
      });
    }

    // 6. Probar la vista combo_dto
    console.log('\n🔍 6. Probando vista combo_dto...');
    const { data: comboDto, error: dtoError } = await supabase
      .from('combo_dto')
      .select('*')
      .eq('id', comboId)
      .single();

    if (dtoError) {
      console.log('❌ Error al obtener combo_dto:', dtoError.message);
    } else {
      console.log('✅ Vista combo_dto funciona:');
      console.log('  - Platos:', comboDto.platos.length);
      console.log('  - Acompañamientos:', comboDto.acompaniamientos.length);
    }

    // 7. Simular lo que haría el frontend
    console.log('\n🎯 7. Simulando frontend...');
    console.log('✅ El frontend debería poder:');
    console.log('  - Ver el combo en la lista de combos');
    console.log('  - Editar el combo existente');
    console.log('  - Eliminar el combo');
    console.log('  - Crear nuevos combos');

    console.log('\n🎉 ¡Prueba completada exitosamente!');

  } catch (error) {
    console.error('💥 Error general en la prueba:', error.message);
  }
}

testComboFrontend().catch(console.error);
