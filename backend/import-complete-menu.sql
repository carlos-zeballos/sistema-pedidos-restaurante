-- =====================================================
-- IMPORTACIÓN COMPLETA DEL MENÚ
-- =====================================================
-- Generado: 2025-08-31T11:09:11.498Z
-- Total de productos: 49

-- =====================================================
-- ENTRADAS
-- =====================================================
-- Gyozas (8 unidades)
SELECT public.product_upsert(
  p_code := 'GYOZA-001',
  p_name := 'Gyozas (8 unidades)',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ENTRADAS'),
  p_price := 15.9,
  p_type := 'COMIDA',
  p_description := 'Empanadas japonesas rellenas de pollo teriyaki. Disponibles fritas o al vapor.',
  p_image := NULL,
  p_preparation_time := 12,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['gluten', 'soja', 'huevo'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS gyoza_001_id;

-- Niguiris (2 unidades)
SELECT public.product_upsert(
  p_code := 'NIGUIRI-001',
  p_name := 'Niguiris (2 unidades)',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ENTRADAS'),
  p_price := 9.9,
  p_type := 'COMIDA',
  p_description := 'Arroz con pescado fresco. Disponibles: Tataki, Nikkei, De conchitas.',
  p_image := NULL,
  p_preparation_time := 8,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS niguiri_001_id;

-- Gunkans (3 unidades)
SELECT public.product_upsert(
  p_code := 'GUNKAN-001',
  p_name := 'Gunkans (3 unidades)',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ENTRADAS'),
  p_price := 12,
  p_type := 'COMIDA',
  p_description := 'Sabores disponibles: Pulpo, Trucha fresca, Pescado blanco.',
  p_image := NULL,
  p_preparation_time := 10,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS gunkan_001_id;

-- Eby furai (8 unidades)
SELECT public.product_upsert(
  p_code := 'EBY-001',
  p_name := 'Eby furai (8 unidades)',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ENTRADAS'),
  p_price := 19.9,
  p_type := 'COMIDA',
  p_description := 'Langostino al panko acompañado de salsas a su preferencia.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'gluten', 'huevo'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS eby_001_id;

-- Trío de causas nikkei
SELECT public.product_upsert(
  p_code := 'CAUSA-001',
  p_name := 'Trío de causas nikkei',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ENTRADAS'),
  p_price := 29.9,
  p_type := 'COMIDA',
  p_description := '3 tipos de causa rolls: Pulpo al olivo, pescado en salsa tiradito y langostino en salsa de maracuyá. Incluye 5 rolls por sabor.',
  p_image := NULL,
  p_preparation_time := 20,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'pescado', 'lácteos'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS causa_001_id;

-- =====================================================
-- PLATOS INDIVIDUALES
-- =====================================================
-- GODZILLA
SELECT public.product_upsert(
  p_code := 'GODZILLA-001',
  p_name := 'GODZILLA',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'PLATOS INDIVIDUALES'),
  p_price := 19.9,
  p_type := 'COMIDA',
  p_description := 'Combinación de yakimeshi, chickenkatsu y papas fritas.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['gluten', 'huevo', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS godzilla_001_id;

-- RAMEN
SELECT public.product_upsert(
  p_code := 'RAMEN-001',
  p_name := 'RAMEN',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'PLATOS INDIVIDUALES'),
  p_price := 29.9,
  p_type := 'COMIDA',
  p_description := 'Sopa de fideos japonesa en base de misoyaki, con chickenkatsu, 2 gyozas al vapor, choclo americano, huevo a la inglesa y especias orientales.',
  p_image := NULL,
  p_preparation_time := 25,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['gluten', 'huevo', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS ramen_001_id;

-- HOT MISO
SELECT public.product_upsert(
  p_code := 'HOT-MISO-001',
  p_name := 'HOT MISO',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'PLATOS INDIVIDUALES'),
  p_price := 29.9,
  p_type := 'COMIDA',
  p_description := 'Sopa de fideos japonesa picante, con chickenkatsu, 2 gyozas al vapor, choclo americano, huevo a la inglesa y especias orientales.',
  p_image := NULL,
  p_preparation_time := 25,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['gluten', 'huevo', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS hot_miso-001_id;

-- ALALAU MAKI
SELECT public.product_upsert(
  p_code := 'ALALAU-001',
  p_name := 'ALALAU MAKI',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'PLATOS INDIVIDUALES'),
  p_price := 14.9,
  p_type := 'POSTRE',
  p_description := 'Roll de helado frito en panko, cubierto con miel de maracuyá, fudge y trozos de galleta de chocolate.',
  p_image := NULL,
  p_preparation_time := 10,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['lácteos', 'gluten', 'huevo'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS alalau_001_id;

-- =====================================================
-- COMBOS Y PAQUETES
-- =====================================================
-- Promoción 30 rolls de maki
SELECT public.product_upsert(
  p_code := 'PROMO-30-001',
  p_name := 'Promoción 30 rolls de maki',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 59.9,
  p_type := 'COMBO',
  p_description := '30 rolls de maki, 2 salsas y 2 palillos. Elegir 3 sabores entre: Kuma, Acevichado, Furai, California, Loncco, Tiradito, Tataki, Olivo, Supai, Cancha, Anticuchero, Kaji, Ukuku.',
  p_image := NULL,
  p_preparation_time := 30,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS promo_30-001_id;

-- Bento 1
SELECT public.product_upsert(
  p_code := 'BENTO-1-001',
  p_name := 'Bento 1',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 29.9,
  p_type := 'COMBO',
  p_description := '10 rolls de maki, 5 Causa rolls, 2 salsas y 1 par de palillos. Elegir 1 sabor de maki clásico o cualquier maki por adicional de S/ 5.90.',
  p_image := NULL,
  p_preparation_time := 20,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS bento_1-001_id;

-- Bento 2
SELECT public.product_upsert(
  p_code := 'BENTO-2-001',
  p_name := 'Bento 2',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 32.9,
  p_type := 'COMBO',
  p_description := '1 Plato Godzilla, 5 rolls de maki, 2 salsas y 1 par de palillos. Elegir 1 sabor de maki clásico o cualquier maki por adicional de S/ 5.90.',
  p_image := NULL,
  p_preparation_time := 25,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['gluten', 'huevo', 'soja', 'pescado'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS bento_2-001_id;

-- Bento 3
SELECT public.product_upsert(
  p_code := 'BENTO-3-001',
  p_name := 'Bento 3',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 29.9,
  p_type := 'COMBO',
  p_description := '10 rolls de maki, 2 gyozas, 2 salsas y 1 par de palillos. Elegir 2 sabores de maki clásico o cualquier maki por adicional de S/ 5.90.',
  p_image := NULL,
  p_preparation_time := 20,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'gluten', 'soja', 'huevo'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS bento_3-001_id;

-- Nakama
SELECT public.product_upsert(
  p_code := 'NAKAMA-001',
  p_name := 'Nakama',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 47.9,
  p_type := 'COMBO',
  p_description := '2 tablas de makis (20 rolls), 2 salsas y 2 pares de palillos. Elegir 4 sabores de toda la carta.',
  p_image := NULL,
  p_preparation_time := 25,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS nakama_001_id;

-- Barco nikkei
SELECT public.product_upsert(
  p_code := 'BARCO-001',
  p_name := 'Barco nikkei',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 68.9,
  p_type := 'COMBO',
  p_description := '3 tablas de makis (30 rolls), 3 salsas y 3 pares de palillos. Elegir 6 sabores de toda la carta.',
  p_image := NULL,
  p_preparation_time := 35,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS barco_001_id;

-- Puente nikkei
SELECT public.product_upsert(
  p_code := 'PUENTE-001',
  p_name := 'Puente nikkei',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'COMBOS Y PAQUETES'),
  p_price := 129.9,
  p_type := 'COMBO',
  p_description := '6 tablas de makis (60 rolls), 5 salsas y 5 pares de palillos. Elegir 6 sabores de toda la carta.',
  p_image := NULL,
  p_preparation_time := 45,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS puente_001_id;

-- =====================================================
-- MAKIS CLÁSICOS
-- =====================================================
-- Acevichado
SELECT public.product_upsert(
  p_code := 'ACEVICHADO-001',
  p_name := 'Acevichado',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de bonito, salsa acevichada y especias japonesas.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS acevichado_001_id;

-- California
SELECT public.product_upsert(
  p_code := 'CALIFORNIA-001',
  p_name := 'California',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso crema, palta y trucha fresca. Cubierto de ajonjolí negro.',
  p_image := NULL,
  p_preparation_time := 12,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'lácteos', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS california_001_id;

-- Katozema
SELECT public.product_upsert(
  p_code := 'KATOZEMA-001',
  p_name := 'Katozema',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso crema y crocante ebi furai. Cubierto de láminas de palta, coronado en salsa tare.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS katozema_001_id;

-- Tiradito
SELECT public.product_upsert(
  p_code := 'TIRADITO-001',
  p_name := 'Tiradito',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de pescado blanco, leche de tigre nikkei y especias japonesas.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS tiradito_001_id;

-- Tataki
SELECT public.product_upsert(
  p_code := 'TATAKI-001',
  p_name := 'Tataki',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de bonito gratinado con aceite de ajonjolí, pimienta negra y gotas de ostión.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS tataki_001_id;

-- Olivo
SELECT public.product_upsert(
  p_code := 'OLIVO-001',
  p_name := 'Olivo',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de tartar de pulpo al olivo e hilos de wantan.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS olivo_001_id;

-- Parrillero
SELECT public.product_upsert(
  p_code := 'PARRILLERO-001',
  p_name := 'Parrillero',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de láminas de carne gratinadas al estilo tataki, bañado en chimichurri.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['carne', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS parrillero_001_id;

-- Karamaru
SELECT public.product_upsert(
  p_code := 'KARAMARU-001',
  p_name := 'Karamaru',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de tori furai, queso crema y negi. Cubierto en harusame, salsa tare y togarashi.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pollo', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS karamaru_001_id;

-- Oranji
SELECT public.product_upsert(
  p_code := 'ORANJI-001',
  p_name := 'Oranji',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso crema, crocante ebi furai y harusame. Cubierto de trucha, láminas finas de limón y salsa tare.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS oranji_001_id;

-- Futari
SELECT public.product_upsert(
  p_code := 'FUTARI-001',
  p_name := 'Futari',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso crema, pepino y crocante ebi furai. Cubierto de miel de maracuyá.',
  p_image := NULL,
  p_preparation_time := 12,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS futari_001_id;

-- Supai
SELECT public.product_upsert(
  p_code := 'SUPAI-001',
  p_name := 'Supai',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de trucha, salsa supai gratinada con toques de salsa tare y especias japonesas.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS supai_001_id;

-- Furai
SELECT public.product_upsert(
  p_code := 'FURAI-001',
  p_name := 'Furai',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll crocante a base de panko relleno de queso crema, palta y trucha fresca.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS furai_001_id;

-- Shiro
SELECT public.product_upsert(
  p_code := 'SHIRO-001',
  p_name := 'Shiro',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS CLÁSICOS'),
  p_price := 0,
  p_type := 'COMIDA',
  p_description := 'Roll crocante relleno de palta y crocante ebi furai. Cubierto de tartar de pulpo acevichado.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS shiro_001_id;

-- =====================================================
-- MAKIS KUREIZI
-- =====================================================
-- Kuma
SELECT public.product_upsert(
  p_code := 'KUMA-001',
  p_name := 'Kuma',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Hosomaki tempura relleno de palta y crocante ebi furai. Cubierto de tartar de pescado acevichado, toques de tare y especias japonesas.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS kuma_001_id;

-- Chicha
SELECT public.product_upsert(
  p_code := 'CHICHA-001',
  p_name := 'Chicha',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll crocante relleno de tori furai, queso crema y mango. Cubierto de salsa de chicha morada nikkei y láminas de limón.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pollo', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS chicha_001_id;

-- Loncco
SELECT public.product_upsert(
  p_code := 'LONCCO-001',
  p_name := 'Loncco',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso frito al estilo arequipeño y crocante ebi furai. Cubierto de salsa loncca, gratinado con mantequilla y queso parmesano.',
  p_image := NULL,
  p_preparation_time := 20,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS loncco_001_id;

-- Cancha
SELECT public.product_upsert(
  p_code := 'CANCHA-001',
  p_name := 'Cancha',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de queso crema gratinado con chimichurri y salsa tare.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS cancha_001_id;

-- Lomito
SELECT public.product_upsert(
  p_code := 'LOMITO-001',
  p_name := 'Lomito',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso crema y crocante ebi furai. Cubierto de láminas de carne gratinadas al estilo tataki, coronado con tartar de lomo saltado.',
  p_image := NULL,
  p_preparation_time := 20,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['carne', 'mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS lomito_001_id;

-- Anticuchero
SELECT public.product_upsert(
  p_code := 'ANTICUCHERO-001',
  p_name := 'Anticuchero',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de queso crema y crocante ebi furai. Cubierto de pulpo en salsa anticuchera gratinada.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS anticuchero_001_id;

-- Conchitas a la parmesana
SELECT public.product_upsert(
  p_code := 'CONCHITAS-001',
  p_name := 'Conchitas a la parmesana',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de conchas de abanico y salsa parmesana gratinada en limón.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS conchitas_001_id;

-- Mishky
SELECT public.product_upsert(
  p_code := 'MISHKY-001',
  p_name := 'Mishky',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll crocante relleno de queso crema y mango. Cubierto de miel de maracuyá.',
  p_image := NULL,
  p_preparation_time := 15,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS mishky_001_id;

-- Ukuku
SELECT public.product_upsert(
  p_code := 'UKUKU-001',
  p_name := 'Ukuku',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Hosomaki tempura relleno de palta y crocante ebi furai. Cubierto de salsa de trucha ahumada, coronado con tare y kawá.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS ukuku_001_id;

-- Kaji
SELECT public.product_upsert(
  p_code := 'KAJI-001',
  p_name := 'Kaji',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto de tartar de pulpo picante especial parrillero.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS kaji_001_id;

-- Magma
SELECT public.product_upsert(
  p_code := 'MAGMA-001',
  p_name := 'Magma',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de palta y crocante ebi furai. Cubierto en cremosa salsa picante de cangrejo, gratinado con mantequilla, queso parmesano y toques de limón y salsa tare.',
  p_image := NULL,
  p_preparation_time := 20,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS magma_001_id;

-- Criollo
SELECT public.product_upsert(
  p_code := 'CRIOLLO-001',
  p_name := 'Criollo',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'MAKIS KUREIZI'),
  p_price := 27.9,
  p_type := 'COMIDA',
  p_description := 'Roll relleno de trucha y ebi furai. Cubierto de queso crema, salsa criolla y orégano.',
  p_image := NULL,
  p_preparation_time := 18,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado', 'mariscos', 'lácteos', 'gluten', 'soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS criollo_001_id;

-- =====================================================
-- ADICIONALES
-- =====================================================
-- Salsa adicional
SELECT public.product_upsert(
  p_code := 'SALSA-ADIC-001',
  p_name := 'Salsa adicional',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ADICIONALES'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Salsa adicional para acompañar tu pedido',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := NULL,
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_adic-001_id;

-- Palito de sushi adicional
SELECT public.product_upsert(
  p_code := 'PALITO-ADIC-001',
  p_name := 'Palito de sushi adicional',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'ADICIONALES'),
  p_price := 2,
  p_type := 'ADICIONAL',
  p_description := 'Par de palillos adicionales',
  p_image := NULL,
  p_preparation_time := 1,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := NULL,
  p_nutritional_info := NULL,
  p_id := NULL
) AS palito_adic-001_id;

-- =====================================================
-- SALSAS
-- =====================================================
-- Acevichada
SELECT public.product_upsert(
  p_code := 'SALSA-ACEVICHADA-001',
  p_name := 'Acevichada',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'SALSAS'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Salsa acevichada (salada)',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['pescado'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_acevichada-001_id;

-- Tare
SELECT public.product_upsert(
  p_code := 'SALSA-TARE-001',
  p_name := 'Tare',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'SALSAS'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Salsa tare (dulce)',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_tare-001_id;

-- Seju
SELECT public.product_upsert(
  p_code := 'SALSA-SEJU-001',
  p_name := 'Seju',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'SALSAS'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Salsa seju (salada)',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := ARRAY['soja'],
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_seju-001_id;

-- Miel de maracuyá
SELECT public.product_upsert(
  p_code := 'SALSA-MARACUYA-001',
  p_name := 'Miel de maracuyá',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'SALSAS'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Miel de maracuyá (dulce)',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := NULL,
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_maracuya-001_id;

-- Loncca
SELECT public.product_upsert(
  p_code := 'SALSA-LONCCA-001',
  p_name := 'Loncca',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'SALSAS'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Salsa loncca (picante y dulce)',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := NULL,
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_loncca-001_id;

-- Supai
SELECT public.product_upsert(
  p_code := 'SALSA-SUPAI-001',
  p_name := 'Supai',
  p_category_id := (SELECT id FROM "Category" WHERE name = 'SALSAS'),
  p_price := 3,
  p_type := 'ADICIONAL',
  p_description := 'Salsa supai (picante)',
  p_image := NULL,
  p_preparation_time := 2,
  p_is_enabled := true,
  p_is_available := true,
  p_allergens := NULL,
  p_nutritional_info := NULL,
  p_id := NULL
) AS salsa_supai-001_id;

-- =====================================================
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

