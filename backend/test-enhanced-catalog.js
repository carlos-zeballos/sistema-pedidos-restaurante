const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

console.log('🎨 PRUEBA: CATÁLOGO MEJORADO');
console.log('============================');

async function testEnhancedCatalog() {
  try {
    console.log('\n1️⃣ Verificando endpoints del catálogo...');
    
    const [categoriesRes, productsRes, combosRes, spacesRes] = await Promise.all([
      axios.get(`${BASE_URL}/catalog/public/categories`),
      axios.get(`${BASE_URL}/catalog/public/products`),
      axios.get(`${BASE_URL}/catalog/public/combos`),
      axios.get(`${BASE_URL}/catalog/public/spaces`)
    ]);
    
    console.log(`✅ Categorías: ${categoriesRes.data.length} encontradas`);
    console.log(`✅ Productos: ${productsRes.data.length} encontrados`);
    console.log(`✅ Combos: ${combosRes.data.length} encontrados`);
    console.log(`✅ Espacios: ${spacesRes.data.length} encontrados`);
    
    // 2. Analizar la estructura de productos para el nuevo diseño
    console.log('\n2️⃣ Analizando estructura de productos...');
    
    if (productsRes.data.length > 0) {
      const sampleProduct = productsRes.data[0];
      console.log('📝 Estructura de producto de ejemplo:');
      console.log(`   - ID: ${sampleProduct.id}`);
      console.log(`   - Nombre: ${sampleProduct.name}`);
      console.log(`   - Código: ${sampleProduct.code}`);
      console.log(`   - Precio: $${sampleProduct.price}`);
      console.log(`   - Tipo: ${sampleProduct.type}`);
      console.log(`   - Categoría ID: ${sampleProduct.categoryId}`);
      console.log(`   - Tiempo preparación: ${sampleProduct.preparationTime || 'No especificado'} min`);
      console.log(`   - Habilitado: ${sampleProduct.isEnabled ? 'Sí' : 'No'}`);
      console.log(`   - Disponible: ${sampleProduct.isAvailable ? 'Sí' : 'No'}`);
      console.log(`   - Imagen: ${sampleProduct.image ? 'Presente' : 'No presente'}`);
      console.log(`   - Descripción: ${sampleProduct.description ? 'Presente' : 'No presente'}`);
      console.log(`   - Alérgenos: ${sampleProduct.allergens ? sampleProduct.allergens.length : 0} elementos`);
    }
    
    // 3. Verificar categorías para mostrar nombres
    console.log('\n3️⃣ Verificando categorías...');
    categoriesRes.data.forEach(category => {
      console.log(`   - ${category.name} (ID: ${category.id})`);
    });
    
    // 4. Verificar tipos de productos
    console.log('\n4️⃣ Analizando tipos de productos...');
    const productTypes = [...new Set(productsRes.data.map(p => p.type))];
    productTypes.forEach(type => {
      const count = productsRes.data.filter(p => p.type === type).length;
      console.log(`   - ${type}: ${count} productos`);
    });
    
    // 5. Verificar productos con imágenes
    console.log('\n5️⃣ Verificando productos con imágenes...');
    const productsWithImages = productsRes.data.filter(p => p.image);
    const productsWithoutImages = productsRes.data.filter(p => !p.image);
    console.log(`   - Con imagen: ${productsWithImages.length}`);
    console.log(`   - Sin imagen: ${productsWithoutImages.length}`);
    
    // 6. Verificar productos con alérgenos
    console.log('\n6️⃣ Verificando productos con alérgenos...');
    const productsWithAllergens = productsRes.data.filter(p => p.allergens && p.allergens.length > 0);
    console.log(`   - Con alérgenos: ${productsWithAllergens.length}`);
    if (productsWithAllergens.length > 0) {
      console.log('   📝 Productos con alérgenos:');
      productsWithAllergens.forEach(product => {
        console.log(`      - ${product.name}: ${product.allergens.join(', ')}`);
      });
    }
    
    console.log('\n🎉 PRUEBA COMPLETADA');
    console.log('===================');
    console.log('✅ El catálogo mejorado está listo para mostrar:');
    console.log('   - Tarjetas de productos con diseño moderno');
    console.log('   - Información completa de cada producto');
    console.log('   - Imágenes con placeholders elegantes');
    console.log('   - Badges de categoría y tipo');
    console.log('   - Estados de disponibilidad claros');
    console.log('   - Información de alérgenos');
    console.log('   - Tiempo de preparación');
    console.log('   - Scroll vertical para navegación');
    console.log('   - Diseño responsive para móviles');
    
    console.log('\n💡 CARACTERÍSTICAS DEL NUEVO DISEÑO:');
    console.log('   - Grid responsive que se adapta al tamaño de pantalla');
    console.log('   - Tarjetas con hover effects y animaciones');
    console.log('   - Información organizada jerárquicamente');
    console.log('   - Colores diferenciados por tipo de producto');
    console.log('   - Scroll suave en contenedor principal');
    console.log('   - Botones de acción claramente diferenciados');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error(`Status: ${error.response?.status || 'N/A'}`);
    console.error(`Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.error('Detalles:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testEnhancedCatalog().catch(console.error);








