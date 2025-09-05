const fs = require('fs');
const path = require('path');

console.log('📋 IMPORTANDO CATEGORÍAS DEL MENÚ');
console.log('==================================');

// Datos de las categorías basadas en el menú
const categories = [
  {
    name: 'ENTRADAS',
    ord: 1,
    description: 'Platos de entrada japoneses y nikkei',
    image: null,
    isActive: true
  },
  {
    name: 'PLATOS INDIVIDUALES',
    ord: 2,
    description: 'Platos principales individuales',
    image: null,
    isActive: true
  },
  {
    name: 'COMBOS Y PAQUETES',
    ord: 3,
    description: 'Combos y paquetes especiales',
    image: null,
    isActive: true
  },
  {
    name: 'MAKIS CLÁSICOS',
    ord: 4,
    description: 'Rolls de sushi clásicos (tabla de 10)',
    image: null,
    isActive: true
  },
  {
    name: 'MAKIS KUREIZI',
    ord: 5,
    description: 'Rolls de sushi creativos (tabla de 10)',
    image: null,
    isActive: true
  },
  {
    name: 'ADICIONALES',
    ord: 6,
    description: 'Productos adicionales y extras',
    image: null,
    isActive: true
  },
  {
    name: 'SALSAS',
    ord: 7,
    description: 'Salsas disponibles para acompañar',
    image: null,
    isActive: true
  },
  {
    name: 'Acompañamientos',
    ord: 8,
    description: 'Productos de acompañamiento para combos',
    image: null,
    isActive: true
  }
];

// Función para generar el script SQL
function generateCategoriesSQL() {
  let sql = `-- =====================================================
-- IMPORTACIÓN DE CATEGORÍAS DEL MENÚ
-- =====================================================
-- Generado: ${new Date().toISOString()}

`;

  categories.forEach((category, index) => {
    sql += `-- ${index + 1}. ${category.name}
SELECT public.category_upsert(
  p_name := '${category.name}',
  p_ord := ${category.ord},
  p_description := '${category.description}',
  p_image := ${category.image ? `'${category.image}'` : 'NULL'},
  p_is_active := ${category.isActive}
) AS category_${index + 1}_id;

`;
  });

  sql += `-- =====================================================
-- VERIFICACIÓN DE CATEGORÍAS CREADAS
-- =====================================================
SELECT 
  id,
  name,
  ord,
  description,
  "isActive",
  "createdAt"
FROM "Category" 
WHERE "isActive" = true 
ORDER BY ord;

`;

  return sql;
}

// Función para generar el script de productos (estructura básica)
function generateProductsStructure() {
  let sql = `-- =====================================================
-- ESTRUCTURA PARA IMPORTAR PRODUCTOS
-- =====================================================
-- Este archivo contiene la estructura para importar productos
-- Se debe ejecutar después de importar las categorías

-- Ejemplo de uso:
-- SELECT public.product_upsert(
--   p_code := 'GYOZA-001',
--   p_name := 'Gyozas (8 unidades)',
--   p_category_id := (SELECT id FROM "Category" WHERE name = 'ENTRADAS'),
--   p_price := 15.90,
--   p_type := 'COMIDA',
--   p_description := 'Empanadas japonesas rellenas de pollo teriyaki',
--   p_image := NULL,
--   p_preparation_time := 15,
--   p_is_enabled := true,
--   p_is_available := true,
--   p_allergens := ARRAY['gluten', 'soja'],
--   p_nutritional_info := '{"calories": 250, "protein": 12}',
--   p_id := NULL
-- );

`;

  return sql;
}

// Generar archivos
try {
  const categoriesSQL = generateCategoriesSQL();
  const productsStructure = generateProductsStructure();
  
  // Escribir archivo de categorías
  const categoriesFilePath = path.join(__dirname, 'import-categories.sql');
  fs.writeFileSync(categoriesFilePath, categoriesSQL, 'utf8');
  
  // Escribir archivo de estructura de productos
  const productsFilePath = path.join(__dirname, 'import-products-structure.sql');
  fs.writeFileSync(productsFilePath, productsStructure, 'utf8');
  
  console.log('✅ Archivos generados exitosamente:');
  console.log(`   📄 ${categoriesFilePath}`);
  console.log(`   📄 ${productsFilePath}`);
  
  console.log('\n📋 CATEGORÍAS A IMPORTAR:');
  console.log('==========================');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (orden: ${cat.ord})`);
  });
  
  console.log('\n🔍 PRÓXIMOS PASOS:');
  console.log('===================');
  console.log('1. Ejecutar import-categories.sql en Supabase');
  console.log('2. Verificar que las categorías se crearon correctamente');
  console.log('3. Usar los IDs de categorías para importar productos');
  console.log('4. Ejecutar import-products-structure.sql como base');
  
  console.log('\n💡 NOTAS IMPORTANTES:');
  console.log('======================');
  console.log('✅ Las categorías se crean con orden específico');
  console.log('✅ Todas las categorías están activas por defecto');
  console.log('✅ Se incluye la categoría "Acompañamientos" para combos');
  console.log('✅ Los productos se importarán en el siguiente paso');
  
} catch (error) {
  console.error('❌ Error generando archivos:', error.message);
}

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Scripts de importación de categorías generados.');
console.log('Listo para ejecutar en Supabase.');




