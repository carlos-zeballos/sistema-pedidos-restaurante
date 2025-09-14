// Script para crear promociones manualmente usando la función RPC
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usa las mismas credenciales del backend)
const supabaseUrl = 'https://your-project.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'your-anon-key'; // Reemplaza con tu key

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para crear combo usando la RPC
async function createComboWithRPC(comboData) {
  try {
    const { data, error } = await supabase.rpc('combo_create_or_update_with_components', {
      p_combo_id: null, // null para crear nuevo
      p_code: comboData.code,
      p_name: comboData.name,
      p_description: comboData.description,
      p_base_price: comboData.basePrice,
      p_category_id: comboData.categoryId,
      p_image: comboData.image || '',
      p_is_enabled: comboData.isEnabled,
      p_is_available: comboData.isAvailable,
      p_preparation_time: comboData.preparationTime,
      p_max_selections: comboData.maxSelections,
      p_components: comboData.components
    });

    if (error) {
      console.error(`❌ Error creando combo "${comboData.name}":`, error);
      return null;
    }

    console.log(`✅ Combo "${comboData.name}" creado exitosamente`);
    return data;
  } catch (error) {
    console.error(`❌ Error creando combo "${comboData.name}":`, error.message);
    return null;
  }
}

// Función para obtener categoría de combos
async function getComboCategory() {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .ilike('name', '%combo%')
    .eq('isActive', true)
    .single();

  if (error) {
    console.error('❌ Error obteniendo categoría de combos:', error);
    return null;
  }

  return data;
}

// Función para obtener productos por categoría
async function getProductsByCategory(categoryName) {
  const { data, error } = await supabase
    .from('Product')
    .select(`
      id,
      code,
      name,
      description,
      price,
      categoryId,
      isEnabled,
      isAvailable,
      Category!inner(name)
    `)
    .ilike('Category.name', `%${categoryName}%`)
    .eq('isEnabled', true);

  if (error) {
    console.error(`❌ Error obteniendo productos de ${categoryName}:`, error);
    return [];
  }

  return data || [];
}

// Definición de las promociones
const promociones = [
  {
    name: "Promo Nakama",
    code: "PROMO_NAKAMA_001",
    description: "Promoción especial Nakama con selección de makis clásicos y kureizi. El cliente puede elegir entre una variedad de makis tradicionales y creativos, acompañados de salsas especiales.",
    basePrice: 45.90,
    preparationTime: 25,
    maxSelections: 6,
    selectedCategories: [
      { name: "Makis clásicos", maxSelections: 3 },
      { name: "Makis Kureizi", maxSelections: 2 },
      { name: "Salsas", maxSelections: 1 }
    ]
  },
  {
    name: "Promo Barco Nikkei",
    code: "PROMO_BARCO_001",
    description: "Barco especial con variedad de makis y entradas nikkei. Una experiencia completa que combina lo mejor de la cocina japonesa y peruana.",
    basePrice: 65.90,
    preparationTime: 30,
    maxSelections: 8,
    selectedCategories: [
      { name: "Entradas", maxSelections: 2 },
      { name: "Makis clásicos", maxSelections: 4 },
      { name: "Makis Kureizi", maxSelections: 2 }
    ]
  },
  {
    name: "Promo Bento 1",
    code: "PROMO_BENTO_001",
    description: "Bento básico con plato principal y acompañamientos. Perfecto para una comida completa y balanceada.",
    basePrice: 35.90,
    preparationTime: 20,
    maxSelections: 4,
    selectedCategories: [
      { name: "Platos individuales", maxSelections: 1 },
      { name: "Adicionales", maxSelections: 2 },
      { name: "Salsas", maxSelections: 1 }
    ]
  },
  {
    name: "Promo Bento 2",
    code: "PROMO_BENTO_002",
    description: "Bento premium con más opciones y variedad. Incluye plato principal, makis y acompañamientos.",
    basePrice: 42.90,
    preparationTime: 22,
    maxSelections: 5,
    selectedCategories: [
      { name: "Platos individuales", maxSelections: 1 },
      { name: "Makis clásicos", maxSelections: 2 },
      { name: "Adicionales", maxSelections: 1 },
      { name: "Salsas", maxSelections: 1 }
    ]
  },
  {
    name: "Promo Bento 3",
    code: "PROMO_BENTO_003",
    description: "Bento deluxe con máxima variedad y opciones premium. La experiencia más completa con platos, makis clásicos y kureizi.",
    basePrice: 52.90,
    preparationTime: 25,
    maxSelections: 6,
    selectedCategories: [
      { name: "Platos individuales", maxSelections: 1 },
      { name: "Makis clásicos", maxSelections: 2 },
      { name: "Makis Kureizi", maxSelections: 1 },
      { name: "Adicionales", maxSelections: 1 },
      { name: "Salsas", maxSelections: 1 }
    ]
  },
  {
    name: "Promo Puente Nikkei",
    code: "PROMO_PUENTE_001",
    description: "Promoción especial puente con fusión nikkei completa. Perfecta para fines de semana largos con entradas, platos principales y makis.",
    basePrice: 58.90,
    preparationTime: 28,
    maxSelections: 7,
    selectedCategories: [
      { name: "Entradas", maxSelections: 1 },
      { name: "Platos individuales", maxSelections: 1 },
      { name: "Makis clásicos", maxSelections: 3 },
      { name: "Makis Kureizi", maxSelections: 1 },
      { name: "Salsas", maxSelections: 1 }
    ]
  }
];

// Función principal
async function crearPromociones() {
  console.log('🎯 CREANDO PROMOCIONES DE SUSHI/NIKKEI');
  console.log('=' .repeat(50));

  // Obtener categoría de combos
  console.log('📂 Obteniendo categoría de combos...');
  const comboCategory = await getComboCategory();
  if (!comboCategory) {
    console.error('❌ No se pudo obtener la categoría de combos');
    return;
  }
  console.log(`✅ Categoría encontrada: ${comboCategory.name}`);

  // Crear cada promoción
  for (const promo of promociones) {
    console.log(`\n🎯 Creando: ${promo.name}`);
    console.log(`   Código: ${promo.code}`);
    console.log(`   Precio: S/. ${promo.basePrice}`);
    console.log(`   Tiempo: ${promo.preparationTime} min`);

    // Obtener productos para cada categoría
    const components = [];
    let ord = 1;

    for (const category of promo.selectedCategories) {
      console.log(`   📂 Obteniendo productos de: ${category.name}`);
      const products = await getProductsByCategory(category.name);
      console.log(`   ✅ ${products.length} productos encontrados`);

      // Agregar productos como componentes
      for (const product of products) {
        components.push({
          productId: product.id,
          name: product.name,
          description: product.description || '',
          type: 'SABOR',
          price: product.price,
          isRequired: false,
          isAvailable: product.isAvailable,
          maxSelections: category.maxSelections,
          ord: ord++
        });
      }
    }

    // Crear el combo
    const comboData = {
      code: promo.code,
      name: promo.name,
      basePrice: promo.basePrice,
      categoryId: comboCategory.id,
      description: promo.description,
      image: '',
      isEnabled: true,
      isAvailable: true,
      preparationTime: promo.preparationTime,
      maxSelections: promo.maxSelections,
      components: components
    };

    await createComboWithRPC(comboData);
  }

  console.log('\n🎉 ¡TODAS LAS PROMOCIONES HAN SIDO CREADAS!');
  console.log('=' .repeat(50));
  console.log('✅ Promo Nakama');
  console.log('✅ Promo Barco Nikkei');
  console.log('✅ Promo Bento 1');
  console.log('✅ Promo Bento 2');
  console.log('✅ Promo Bento 3');
  console.log('✅ Promo Puente Nikkei');
  console.log('\n🚀 Ahora puedes verlas en la gestión de combos del frontend');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  console.log('⚠️  IMPORTANTE: Configura las credenciales de Supabase en este archivo antes de ejecutar');
  console.log('📝 Edita las variables supabaseUrl y supabaseKey con tus credenciales reales');
  // crearPromociones().catch(console.error);
}

module.exports = { crearPromociones, promociones };












