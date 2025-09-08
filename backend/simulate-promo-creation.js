const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_TOKEN = 'your-admin-token-here'; // Necesitarás obtener un token real

// Headers para las peticiones
const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

// Función para obtener categorías
async function getCategories() {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalog/categories`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error getting categories:', error.message);
    return [];
  }
}

// Función para obtener productos
async function getProducts() {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalog/products-for-combo-components`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error getting products:', error.message);
    return [];
  }
}

// Función para crear combo
async function createCombo(comboData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/catalog/combos`, comboData, { headers });
    console.log(`✅ Combo "${comboData.name}" creado exitosamente`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error creando combo "${comboData.name}":`, error.response?.data || error.message);
    return null;
  }
}

// Definición de las promociones
const promociones = [
  {
    name: "Promo Nakama",
    code: "PROMO_NAKAMA_001",
    description: "Promoción especial Nakama con selección de makis clásicos y kureizi",
    basePrice: 45.90,
    categoryName: "Combos y paquetes",
    preparationTime: 25,
    maxSelections: 6,
    components: [
      // Makis clásicos (máximo 3)
      { type: "SABOR", maxSelections: 3, category: "Makis clásicos" },
      // Makis kureizi (máximo 2) 
      { type: "SABOR", maxSelections: 2, category: "Makis Kureizi" },
      // Salsas (máximo 1)
      { type: "SALSA", maxSelections: 1, category: "Salsas" }
    ]
  },
  {
    name: "Promo Barco Nikkei",
    code: "PROMO_BARCO_001", 
    description: "Barco especial con variedad de makis y entradas nikkei",
    basePrice: 65.90,
    categoryName: "Combos y paquetes",
    preparationTime: 30,
    maxSelections: 8,
    components: [
      // Entradas (máximo 2)
      { type: "ENTRADA", maxSelections: 2, category: "Entradas" },
      // Makis clásicos (máximo 4)
      { type: "SABOR", maxSelections: 4, category: "Makis clásicos" },
      // Makis kureizi (máximo 2)
      { type: "SABOR", maxSelections: 2, category: "Makis Kureizi" }
    ]
  },
  {
    name: "Promo Bento 1",
    code: "PROMO_BENTO_001",
    description: "Bento básico con plato principal y acompañamientos",
    basePrice: 35.90,
    categoryName: "Combos y paquetes", 
    preparationTime: 20,
    maxSelections: 4,
    components: [
      // Plato individual (máximo 1)
      { type: "PLATO", maxSelections: 1, category: "Platos individuales" },
      // Acompañamientos (máximo 2)
      { type: "ACOMPAÑAMIENTO", maxSelections: 2, category: "Adicionales" },
      // Salsas (máximo 1)
      { type: "SALSA", maxSelections: 1, category: "Salsas" }
    ]
  },
  {
    name: "Promo Bento 2",
    code: "PROMO_BENTO_002",
    description: "Bento premium con más opciones y variedad",
    basePrice: 42.90,
    categoryName: "Combos y paquetes",
    preparationTime: 22,
    maxSelections: 5,
    components: [
      // Plato individual (máximo 1)
      { type: "PLATO", maxSelections: 1, category: "Platos individuales" },
      // Makis clásicos (máximo 2)
      { type: "SABOR", maxSelections: 2, category: "Makis clásicos" },
      // Acompañamientos (máximo 1)
      { type: "ACOMPAÑAMIENTO", maxSelections: 1, category: "Adicionales" },
      // Salsas (máximo 1)
      { type: "SALSA", maxSelections: 1, category: "Salsas" }
    ]
  },
  {
    name: "Promo Bento 3",
    code: "PROMO_BENTO_003",
    description: "Bento deluxe con máxima variedad y opciones premium",
    basePrice: 52.90,
    categoryName: "Combos y paquetes",
    preparationTime: 25,
    maxSelections: 6,
    components: [
      // Plato individual (máximo 1)
      { type: "PLATO", maxSelections: 1, category: "Platos individuales" },
      // Makis clásicos (máximo 2)
      { type: "SABOR", maxSelections: 2, category: "Makis clásicos" },
      // Makis kureizi (máximo 1)
      { type: "SABOR", maxSelections: 1, category: "Makis Kureizi" },
      // Acompañamientos (máximo 1)
      { type: "ACOMPAÑAMIENTO", maxSelections: 1, category: "Adicionales" },
      // Salsas (máximo 1)
      { type: "SALSA", maxSelections: 1, category: "Salsas" }
    ]
  },
  {
    name: "Promo Puente Nikkei",
    code: "PROMO_PUENTE_001",
    description: "Promoción especial puente con fusión nikkei completa",
    basePrice: 58.90,
    categoryName: "Combos y paquetes",
    preparationTime: 28,
    maxSelections: 7,
    components: [
      // Entradas (máximo 1)
      { type: "ENTRADA", maxSelections: 1, category: "Entradas" },
      // Plato individual (máximo 1)
      { type: "PLATO", maxSelections: 1, category: "Platos individuales" },
      // Makis clásicos (máximo 3)
      { type: "SABOR", maxSelections: 3, category: "Makis clásicos" },
      // Makis kureizi (máximo 1)
      { type: "SABOR", maxSelections: 1, category: "Makis Kureizi" },
      // Salsas (máximo 1)
      { type: "SALSA", maxSelections: 1, category: "Salsas" }
    ]
  }
];

// Función principal para crear todas las promociones
async function crearPromociones() {
  console.log('🚀 Iniciando creación de promociones...\n');
  
  // Obtener datos necesarios
  console.log('📋 Obteniendo categorías y productos...');
  const categories = await getCategories();
  const products = await getProducts();
  
  if (categories.length === 0 || products.length === 0) {
    console.error('❌ No se pudieron obtener las categorías o productos');
    return;
  }
  
  // Buscar la categoría de combos
  const comboCategory = categories.find(cat => cat.name.toLowerCase().includes('combo'));
  if (!comboCategory) {
    console.error('❌ No se encontró la categoría de combos');
    return;
  }
  
  console.log(`✅ Categoría de combos encontrada: ${comboCategory.name}`);
  console.log(`✅ Productos disponibles: ${products.length}\n`);
  
  // Crear cada promoción
  for (const promo of promociones) {
    console.log(`🎯 Creando: ${promo.name}`);
    
    // Crear componentes basados en las categorías de productos
    const components = [];
    let ord = 1;
    
    for (const comp of promo.components) {
      // Filtrar productos por categoría
      const categoryProducts = products.filter(p => 
        p.product_category_name.toLowerCase().includes(comp.category.toLowerCase())
      );
      
      // Agregar todos los productos de esa categoría como opciones
      for (const product of categoryProducts) {
        components.push({
          productId: product.product_id,
          name: product.product_name,
          description: product.product_description,
          type: comp.type,
          price: product.product_price,
          isRequired: false,
          isAvailable: product.product_is_available,
          maxSelections: comp.maxSelections,
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
    
    await createCombo(comboData);
    console.log(''); // Línea en blanco para separar
  }
  
  console.log('🎉 ¡Todas las promociones han sido creadas!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  crearPromociones().catch(console.error);
}

module.exports = { crearPromociones, promociones };




