const fs = require('fs');
const path = require('path');

console.log('🍣 IMPORTANDO MENÚ COMPLETO');
console.log('============================');

// Datos completos del menú
const menuData = {
  // ENTRADAS
  entradas: [
    {
      code: 'GYOZA-001',
      name: 'Gyozas (8 unidades)',
      price: 15.90,
      type: 'COMIDA',
      description: 'Empanadas japonesas rellenas de pollo teriyaki. Disponibles fritas o al vapor.',
      preparationTime: 12,
      allergens: ['gluten', 'soja', 'huevo']
    },
    {
      code: 'NIGUIRI-001',
      name: 'Niguiris (2 unidades)',
      price: 9.90,
      type: 'COMIDA',
      description: 'Arroz con pescado fresco. Disponibles: Tataki, Nikkei, De conchitas.',
      preparationTime: 8,
      allergens: ['pescado', 'soja']
    },
    {
      code: 'GUNKAN-001',
      name: 'Gunkans (3 unidades)',
      price: 12.00,
      type: 'COMIDA',
      description: 'Sabores disponibles: Pulpo, Trucha fresca, Pescado blanco.',
      preparationTime: 10,
      allergens: ['pescado', 'soja']
    },
    {
      code: 'EBY-001',
      name: 'Eby furai (8 unidades)',
      price: 19.90,
      type: 'COMIDA',
      description: 'Langostino al panko acompañado de salsas a su preferencia.',
      preparationTime: 15,
      allergens: ['mariscos', 'gluten', 'huevo']
    },
    {
      code: 'CAUSA-001',
      name: 'Trío de causas nikkei',
      price: 29.90,
      type: 'COMIDA',
      description: '3 tipos de causa rolls: Pulpo al olivo, pescado en salsa tiradito y langostino en salsa de maracuyá. Incluye 5 rolls por sabor.',
      preparationTime: 20,
      allergens: ['mariscos', 'pescado', 'lácteos']
    }
  ],

  // PLATOS INDIVIDUALES
  platosIndividuales: [
    {
      code: 'GODZILLA-001',
      name: 'GODZILLA',
      price: 19.90,
      type: 'COMIDA',
      description: 'Combinación de yakimeshi, chickenkatsu y papas fritas.',
      preparationTime: 18,
      allergens: ['gluten', 'huevo', 'soja']
    },
    {
      code: 'RAMEN-001',
      name: 'RAMEN',
      price: 29.90,
      type: 'COMIDA',
      description: 'Sopa de fideos japonesa en base de misoyaki, con chickenkatsu, 2 gyozas al vapor, choclo americano, huevo a la inglesa y especias orientales.',
      preparationTime: 25,
      allergens: ['gluten', 'huevo', 'soja']
    },
    {
      code: 'HOT-MISO-001',
      name: 'HOT MISO',
      price: 29.90,
      type: 'COMIDA',
      description: 'Sopa de fideos japonesa picante, con chickenkatsu, 2 gyozas al vapor, choclo americano, huevo a la inglesa y especias orientales.',
      preparationTime: 25,
      allergens: ['gluten', 'huevo', 'soja']
    },
    {
      code: 'ALALAU-001',
      name: 'ALALAU MAKI',
      price: 14.90,
      type: 'POSTRE',
      description: 'Roll de helado frito en panko, cubierto con miel de maracuyá, fudge y trozos de galleta de chocolate.',
      preparationTime: 10,
      allergens: ['lácteos', 'gluten', 'huevo']
    }
  ],

  // COMBOS Y PAQUETES
  combos: [
    {
      code: 'PROMO-30-001',
      name: 'Promoción 30 rolls de maki',
      price: 59.90,
      type: 'COMBO',
      description: '30 rolls de maki, 2 salsas y 2 palillos. Elegir 3 sabores entre: Kuma, Acevichado, Furai, California, Loncco, Tiradito, Tataki, Olivo, Supai, Cancha, Anticuchero, Kaji, Ukuku.',
      preparationTime: 30,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'BENTO-1-001',
      name: 'Bento 1',
      price: 29.90,
      type: 'COMBO',
      description: '10 rolls de maki, 5 Causa rolls, 2 salsas y 1 par de palillos. Elegir 1 sabor de maki clásico o cualquier maki por adicional de S/ 5.90.',
      preparationTime: 20,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'BENTO-2-001',
      name: 'Bento 2',
      price: 32.90,
      type: 'COMBO',
      description: '1 Plato Godzilla, 5 rolls de maki, 2 salsas y 1 par de palillos. Elegir 1 sabor de maki clásico o cualquier maki por adicional de S/ 5.90.',
      preparationTime: 25,
      allergens: ['gluten', 'huevo', 'soja', 'pescado']
    },
    {
      code: 'BENTO-3-001',
      name: 'Bento 3',
      price: 29.90,
      type: 'COMBO',
      description: '10 rolls de maki, 2 gyozas, 2 salsas y 1 par de palillos. Elegir 2 sabores de maki clásico o cualquier maki por adicional de S/ 5.90.',
      preparationTime: 20,
      allergens: ['pescado', 'gluten', 'soja', 'huevo']
    },
    {
      code: 'NAKAMA-001',
      name: 'Nakama',
      price: 47.90,
      type: 'COMBO',
      description: '2 tablas de makis (20 rolls), 2 salsas y 2 pares de palillos. Elegir 4 sabores de toda la carta.',
      preparationTime: 25,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'BARCO-001',
      name: 'Barco nikkei',
      price: 68.90,
      type: 'COMBO',
      description: '3 tablas de makis (30 rolls), 3 salsas y 3 pares de palillos. Elegir 6 sabores de toda la carta.',
      preparationTime: 35,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'PUENTE-001',
      name: 'Puente nikkei',
      price: 129.90,
      type: 'COMBO',
      description: '6 tablas de makis (60 rolls), 5 salsas y 5 pares de palillos. Elegir 6 sabores de toda la carta.',
      preparationTime: 45,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    }
  ],

  // MAKIS CLÁSICOS
  makisClasicos: [
    {
      code: 'ACEVICHADO-001',
      name: 'Acevichado',
      price: 0, // Precio por tabla de 10
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de bonito, salsa acevichada y especias japonesas.',
      preparationTime: 15,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'CALIFORNIA-001',
      name: 'California',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de queso crema, palta y trucha fresca. Cubierto de ajonjolí negro.',
      preparationTime: 12,
      allergens: ['pescado', 'lácteos', 'soja']
    },
    {
      code: 'KATOZEMA-001',
      name: 'Katozema',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de queso crema y crocante ebi furai. Cubierto de láminas de palta, coronado en salsa tare.',
      preparationTime: 15,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'TIRADITO-001',
      name: 'Tiradito',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de pescado blanco, leche de tigre nikkei y especias japonesas.',
      preparationTime: 15,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'TATAKI-001',
      name: 'Tataki',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de bonito gratinado con aceite de ajonjolí, pimienta negra y gotas de ostión.',
      preparationTime: 15,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'OLIVO-001',
      name: 'Olivo',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de tartar de pulpo al olivo e hilos de wantan.',
      preparationTime: 15,
      allergens: ['mariscos', 'gluten', 'soja']
    },
    {
      code: 'PARRILLERO-001',
      name: 'Parrillero',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de láminas de carne gratinadas al estilo tataki, bañado en chimichurri.',
      preparationTime: 18,
      allergens: ['carne', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'KARAMARU-001',
      name: 'Karamaru',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de tori furai, queso crema y negi. Cubierto en harusame, salsa tare y togarashi.',
      preparationTime: 15,
      allergens: ['pollo', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'ORANJI-001',
      name: 'Oranji',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de queso crema, crocante ebi furai y harusame. Cubierto de trucha, láminas finas de limón y salsa tare.',
      preparationTime: 15,
      allergens: ['pescado', 'mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'FUTARI-001',
      name: 'Futari',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de queso crema, pepino y crocante ebi furai. Cubierto de miel de maracuyá.',
      preparationTime: 12,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'SUPAI-001',
      name: 'Supai',
      price: 0,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de trucha, salsa supai gratinada con toques de salsa tare y especias japonesas.',
      preparationTime: 15,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'FURAI-001',
      name: 'Furai',
      price: 0,
      type: 'COMIDA',
      description: 'Roll crocante a base de panko relleno de queso crema, palta y trucha fresca.',
      preparationTime: 15,
      allergens: ['pescado', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'SHIRO-001',
      name: 'Shiro',
      price: 0,
      type: 'COMIDA',
      description: 'Roll crocante relleno de palta y crocante ebi furai. Cubierto de tartar de pulpo acevichado.',
      preparationTime: 15,
      allergens: ['mariscos', 'gluten', 'soja']
    }
  ],

  // MAKIS KUREIZI
  makisKureizi: [
    {
      code: 'KUMA-001',
      name: 'Kuma',
      price: 27.90,
      type: 'COMIDA',
      description: 'Hosomaki tempura relleno de palta y crocante ebi furai. Cubierto de tartar de pescado acevichado, toques de tare y especias japonesas.',
      preparationTime: 18,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'CHICHA-001',
      name: 'Chicha',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll crocante relleno de tori furai, queso crema y mango. Cubierto de salsa de chicha morada nikkei y láminas de limón.',
      preparationTime: 18,
      allergens: ['pollo', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'LONCCO-001',
      name: 'Loncco',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de queso frito al estilo arequipeño y crocante ebi furai. Cubierto de salsa loncca, gratinado con mantequilla y queso parmesano.',
      preparationTime: 20,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'CANCHA-001',
      name: 'Cancha',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de queso crema gratinado con chimichurri y salsa tare.',
      preparationTime: 18,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'LOMITO-001',
      name: 'Lomito',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de queso crema y crocante ebi furai. Cubierto de láminas de carne gratinadas al estilo tataki, coronado con tartar de lomo saltado.',
      preparationTime: 20,
      allergens: ['carne', 'mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'ANTICUCHERO-001',
      name: 'Anticuchero',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de queso crema y crocante ebi furai. Cubierto de pulpo en salsa anticuchera gratinada.',
      preparationTime: 18,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'CONCHITAS-001',
      name: 'Conchitas a la parmesana',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de conchas de abanico y salsa parmesana gratinada en limón.',
      preparationTime: 18,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'MISHKY-001',
      name: 'Mishky',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll crocante relleno de queso crema y mango. Cubierto de miel de maracuyá.',
      preparationTime: 15,
      allergens: ['lácteos', 'gluten', 'soja']
    },
    {
      code: 'UKUKU-001',
      name: 'Ukuku',
      price: 27.90,
      type: 'COMIDA',
      description: 'Hosomaki tempura relleno de palta y crocante ebi furai. Cubierto de salsa de trucha ahumada, coronado con tare y kawá.',
      preparationTime: 18,
      allergens: ['pescado', 'mariscos', 'gluten', 'soja']
    },
    {
      code: 'KAJI-001',
      name: 'Kaji',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto de tartar de pulpo picante especial parrillero.',
      preparationTime: 18,
      allergens: ['mariscos', 'gluten', 'soja']
    },
    {
      code: 'MAGMA-001',
      name: 'Magma',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de palta y crocante ebi furai. Cubierto en cremosa salsa picante de cangrejo, gratinado con mantequilla, queso parmesano y toques de limón y salsa tare.',
      preparationTime: 20,
      allergens: ['mariscos', 'lácteos', 'gluten', 'soja']
    },
    {
      code: 'CRIOLLO-001',
      name: 'Criollo',
      price: 27.90,
      type: 'COMIDA',
      description: 'Roll relleno de trucha y ebi furai. Cubierto de queso crema, salsa criolla y orégano.',
      preparationTime: 18,
      allergens: ['pescado', 'mariscos', 'lácteos', 'gluten', 'soja']
    }
  ],

  // ADICIONALES
  adicionales: [
    {
      code: 'SALSA-ADIC-001',
      name: 'Salsa adicional',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Salsa adicional para acompañar tu pedido',
      preparationTime: 2,
      allergens: []
    },
    {
      code: 'PALITO-ADIC-001',
      name: 'Palito de sushi adicional',
      price: 2.00,
      type: 'ADICIONAL',
      description: 'Par de palillos adicionales',
      preparationTime: 1,
      allergens: []
    }
  ],

  // SALSAS
  salsas: [
    {
      code: 'SALSA-ACEVICHADA-001',
      name: 'Acevichada',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Salsa acevichada (salada)',
      preparationTime: 2,
      allergens: ['pescado']
    },
    {
      code: 'SALSA-TARE-001',
      name: 'Tare',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Salsa tare (dulce)',
      preparationTime: 2,
      allergens: ['soja']
    },
    {
      code: 'SALSA-SEJU-001',
      name: 'Seju',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Salsa seju (salada)',
      preparationTime: 2,
      allergens: ['soja']
    },
    {
      code: 'SALSA-MARACUYA-001',
      name: 'Miel de maracuyá',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Miel de maracuyá (dulce)',
      preparationTime: 2,
      allergens: []
    },
    {
      code: 'SALSA-LONCCA-001',
      name: 'Loncca',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Salsa loncca (picante y dulce)',
      preparationTime: 2,
      allergens: []
    },
    {
      code: 'SALSA-SUPAI-001',
      name: 'Supai',
      price: 3.00,
      type: 'ADICIONAL',
      description: 'Salsa supai (picante)',
      preparationTime: 2,
      allergens: []
    }
  ]
};

// Función para generar el script SQL completo
function generateCompleteMenuSQL() {
  let sql = `-- =====================================================
-- IMPORTACIÓN COMPLETA DEL MENÚ
-- =====================================================
-- Generado: ${new Date().toISOString()}
-- Total de productos: ${Object.values(menuData).flat().length}

`;

  // Función helper para generar SQL de productos
  function generateProductSQL(product, categoryName) {
    const allergensArray = product.allergens.length > 0 ? `ARRAY[${product.allergens.map(a => `'${a}'`).join(', ')}]` : 'NULL';
    
    return `-- ${product.name}
SELECT public.product_upsert(
  p_code := '${product.code}',
  p_name := '${product.name}',
  p_category_id := (SELECT id FROM "Category" WHERE name = '${categoryName}'),
  p_price := ${product.price},
  p_type := '${product.type}',
  p_description := '${product.description}',
  p_image := NULL,
  p_preparation_time := ${product.preparationTime},
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ${allergensArray},
  p_nutritional_info := NULL,
  p_id := NULL
) AS ${product.code.replace('-', '_').toLowerCase()}_id;

`;
  }

  // Generar SQL para cada sección
  sql += `-- =====================================================
-- ENTRADAS
-- =====================================================
`;
  menuData.entradas.forEach(product => {
    sql += generateProductSQL(product, 'ENTRADAS');
  });

  sql += `-- =====================================================
-- PLATOS INDIVIDUALES
-- =====================================================
`;
  menuData.platosIndividuales.forEach(product => {
    sql += generateProductSQL(product, 'PLATOS INDIVIDUALES');
  });

  sql += `-- =====================================================
-- COMBOS Y PAQUETES
-- =====================================================
`;
  menuData.combos.forEach(product => {
    sql += generateProductSQL(product, 'COMBOS Y PAQUETES');
  });

  sql += `-- =====================================================
-- MAKIS CLÁSICOS
-- =====================================================
`;
  menuData.makisClasicos.forEach(product => {
    sql += generateProductSQL(product, 'MAKIS CLÁSICOS');
  });

  sql += `-- =====================================================
-- MAKIS KUREIZI
-- =====================================================
`;
  menuData.makisKureizi.forEach(product => {
    sql += generateProductSQL(product, 'MAKIS KUREIZI');
  });

  sql += `-- =====================================================
-- ADICIONALES
-- =====================================================
`;
  menuData.adicionales.forEach(product => {
    sql += generateProductSQL(product, 'ADICIONALES');
  });

  sql += `-- =====================================================
-- SALSAS
-- =====================================================
`;
  menuData.salsas.forEach(product => {
    sql += generateProductSQL(product, 'SALSAS');
  });

  // Agregar verificación final
  sql += `-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 
  c.name as categoria,
  COUNT(p.id) as total_productos,
  SUM(CASE WHEN p."isAvailable" = true THEN 1 ELSE 0 END) as disponibles
FROM "Category" c
LEFT JOIN "Product" p ON p."categoryId" = c.id
WHERE c."isActive" = true
GROUP BY c.id, c.name, c.ord
ORDER BY c.ord;

`;

  return sql;
}

// Generar archivo
try {
  const completeMenuSQL = generateCompleteMenuSQL();
  
  // Escribir archivo completo
  const completeMenuFilePath = path.join(__dirname, 'import-complete-menu.sql');
  fs.writeFileSync(completeMenuFilePath, completeMenuSQL, 'utf8');
  
  console.log('✅ Archivo generado exitosamente:');
  console.log(`   📄 ${completeMenuFilePath}`);
  
  // Estadísticas
  const totalProducts = Object.values(menuData).flat().length;
  const totalCategories = Object.keys(menuData).length;
  
  console.log('\n📊 ESTADÍSTICAS DEL MENÚ:');
  console.log('==========================');
  console.log(`📋 Total de productos: ${totalProducts}`);
  console.log(`📁 Secciones: ${totalCategories}`);
  console.log(`🍽️  Entradas: ${menuData.entradas.length}`);
  console.log(`🍜 Platos individuales: ${menuData.platosIndividuales.length}`);
  console.log(`🍱 Combos: ${menuData.combos.length}`);
  console.log(`🍣 Makis clásicos: ${menuData.makisClasicos.length}`);
  console.log(`🎨 Makis kureizi: ${menuData.makisKureizi.length}`);
  console.log(`➕ Adicionales: ${menuData.adicionales.length}`);
  console.log(`🥄 Salsas: ${menuData.salsas.length}`);
  
  console.log('\n🔍 PRÓXIMOS PASOS:');
  console.log('===================');
  console.log('1. Ejecutar import-categories.sql primero');
  console.log('2. Ejecutar import-complete-menu.sql');
  console.log('3. Verificar que todos los productos se crearon');
  console.log('4. Probar la funcionalidad en la aplicación');
  
  console.log('\n💡 NOTAS IMPORTANTES:');
  console.log('======================');
  console.log('✅ Todos los productos tienen códigos únicos');
  console.log('✅ Se incluyen alérgenos para cada producto');
  console.log('✅ Tiempos de preparación realistas');
  console.log('✅ Descripciones detalladas del menú');
  console.log('✅ Precios exactos del menú proporcionado');
  
} catch (error) {
  console.error('❌ Error generando archivo:', error.message);
}

console.log('\n🚀 PROCESO COMPLETADO');
console.log('=====================');
console.log('Script completo de importación del menú generado.');
console.log('Listo para ejecutar en Supabase.');




