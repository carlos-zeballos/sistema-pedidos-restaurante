const axios = require('axios');

// Simulación de uso del frontend para crear promociones
console.log('🎯 SIMULANDO USO DEL FRONTEND PARA CREAR PROMOCIONES');
console.log('=' .repeat(60));

// Configuración
const API_BASE_URL = 'http://localhost:3001';

// Simular login y obtener token (esto normalmente lo harías en el frontend)
async function simulateLogin() {
  console.log('🔐 Simulando login de administrador...');
  // En el frontend real, aquí harías login y obtendrías el token
  // Por ahora usaremos un token de prueba
  return 'mock-admin-token';
}

// Simular obtener categorías (como lo haría el frontend)
async function simulateGetCategories() {
  console.log('📋 Obteniendo categorías...');
  try {
    const response = await axios.get(`${API_BASE_URL}/catalog/categories`);
    const categories = response.data.filter(cat => cat.isActive);
    console.log(`✅ Categorías obtenidas: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.name}`));
    return categories;
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error.message);
    return [];
  }
}

// Simular obtener productos (como lo haría el frontend)
async function simulateGetProducts() {
  console.log('🛍️ Obteniendo productos para combos...');
  try {
    const response = await axios.get(`${API_BASE_URL}/catalog/products-for-combo-components`);
    const products = response.data;
    console.log(`✅ Productos obtenidos: ${products.length}`);
    
    // Agrupar por categoría
    const byCategory = {};
    products.forEach(product => {
      const category = product.product_category_name;
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(product);
    });
    
    Object.keys(byCategory).forEach(category => {
      console.log(`   - ${category}: ${byCategory[category].length} productos`);
    });
    
    return products;
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    return [];
  }
}

// Simular crear combo (como lo haría el frontend)
async function simulateCreateCombo(comboData) {
  console.log(`\n🎯 Creando combo: ${comboData.name}`);
  console.log(`   Código: ${comboData.code}`);
  console.log(`   Precio: S/. ${comboData.basePrice}`);
  console.log(`   Componentes: ${comboData.components.length}`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/catalog/combos`, comboData);
    console.log(`✅ Combo "${comboData.name}" creado exitosamente`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error creando combo "${comboData.name}":`, error.response?.data || error.message);
    return null;
  }
}

// Simular el proceso completo de creación de promociones
async function simulatePromoCreation() {
  console.log('\n🚀 INICIANDO SIMULACIÓN DE CREACIÓN DE PROMOCIONES');
  console.log('=' .repeat(60));
  
  // Paso 1: Login (simulado)
  const token = await simulateLogin();
  
  // Paso 2: Obtener datos necesarios
  const categories = await simulateGetCategories();
  const products = await simulateGetProducts();
  
  if (categories.length === 0 || products.length === 0) {
    console.error('❌ No se pudieron obtener los datos necesarios');
    return;
  }
  
  // Buscar categoría de combos
  const comboCategory = categories.find(cat => 
    cat.name.toLowerCase().includes('combo') || 
    cat.name.toLowerCase().includes('paquete')
  );
  
  if (!comboCategory) {
    console.error('❌ No se encontró categoría de combos');
    return;
  }
  
  console.log(`\n📂 Categoría seleccionada: ${comboCategory.name}`);
  
  // Definir las promociones que vamos a crear
  const promociones = [
    {
      name: "Promo Nakama",
      code: "PROMO_NAKAMA_001",
      description: "Promoción especial Nakama con selección de makis clásicos y kureizi",
      basePrice: 45.90,
      preparationTime: 25,
      maxSelections: 6,
      selectedCategories: ["Makis clásicos", "Makis Kureizi", "Salsas"]
    },
    {
      name: "Promo Barco Nikkei", 
      code: "PROMO_BARCO_001",
      description: "Barco especial con variedad de makis y entradas nikkei",
      basePrice: 65.90,
      preparationTime: 30,
      maxSelections: 8,
      selectedCategories: ["Entradas", "Makis clásicos", "Makis Kureizi"]
    },
    {
      name: "Promo Bento 1",
      code: "PROMO_BENTO_001", 
      description: "Bento básico con plato principal y acompañamientos",
      basePrice: 35.90,
      preparationTime: 20,
      maxSelections: 4,
      selectedCategories: ["Platos individuales", "Adicionales", "Salsas"]
    },
    {
      name: "Promo Bento 2",
      code: "PROMO_BENTO_002",
      description: "Bento premium con más opciones y variedad", 
      basePrice: 42.90,
      preparationTime: 22,
      maxSelections: 5,
      selectedCategories: ["Platos individuales", "Makis clásicos", "Adicionales", "Salsas"]
    },
    {
      name: "Promo Bento 3",
      code: "PROMO_BENTO_003",
      description: "Bento deluxe con máxima variedad y opciones premium",
      basePrice: 52.90,
      preparationTime: 25,
      maxSelections: 6,
      selectedCategories: ["Platos individuales", "Makis clásicos", "Makis Kureizi", "Adicionales", "Salsas"]
    },
    {
      name: "Promo Puente Nikkei",
      code: "PROMO_PUENTE_001",
      description: "Promoción especial puente con fusión nikkei completa",
      basePrice: 58.90,
      preparationTime: 28,
      maxSelections: 7,
      selectedCategories: ["Entradas", "Platos individuales", "Makis clásicos", "Makis Kureizi", "Salsas"]
    }
  ];
  
  // Crear cada promoción
  for (const promo of promociones) {
    console.log(`\n🎯 CREANDO: ${promo.name}`);
    console.log('-' .repeat(40));
    
    // Simular selección de productos por categoría (como harías con los botones)
    const components = [];
    let ord = 1;
    
    for (const categoryName of promo.selectedCategories) {
      console.log(`📂 Seleccionando productos de: ${categoryName}`);
      
      const categoryProducts = products.filter(p => 
        p.product_category_name.toLowerCase().includes(categoryName.toLowerCase())
      );
      
      console.log(`   ✅ ${categoryProducts.length} productos encontrados`);
      
      // Agregar todos los productos de esta categoría como componentes
      for (const product of categoryProducts) {
        components.push({
          productId: product.product_id,
          name: product.product_name,
          description: product.product_description,
          type: 'SABOR', // Tipo por defecto
          price: product.product_price,
          isRequired: false,
          isAvailable: product.product_is_available,
          maxSelections: 1,
          ord: ord++
        });
      }
    }
    
    // Crear el combo con todos los datos
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
    
    // Simular envío del formulario
    await simulateCreateCombo(comboData);
  }
  
  console.log('\n🎉 ¡SIMULACIÓN COMPLETADA!');
  console.log('=' .repeat(60));
  console.log('✅ Todas las promociones han sido creadas usando el sistema de combos');
  console.log('✅ Ahora puedes verlas en la gestión de combos del frontend');
}

// Ejecutar la simulación
if (require.main === module) {
  simulatePromoCreation().catch(console.error);
}

module.exports = { simulatePromoCreation };





