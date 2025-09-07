-- Script para arreglar combos sin componentes
-- Este script agrega componentes básicos a los combos que no los tienen

-- 1. Ver combos sin componentes
SELECT 
    c.id,
    c.code,
    c.name,
    c."basePrice",
    COUNT(cc.id) as component_count
FROM "Combo" c
LEFT JOIN "ComboComponent" cc ON c.id = cc."comboId"
WHERE c."isEnabled" = true
GROUP BY c.id, c.code, c.name, c."basePrice"
HAVING COUNT(cc.id) = 0
ORDER BY c.name;

-- 2. Agregar componentes básicos a combos sin componentes
-- Para cada combo sin componentes, agregar opciones básicas de sabor

-- Combo: Bento 3
INSERT INTO "ComboComponent" (
    "comboId", name, description, type, price, "isRequired", "isAvailable", 
    "maxSelections", ord, "createdAt", "updatedAt"
) VALUES 
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO3' LIMIT 1),
    'Acevichado', 'Roll de salmón con salsa acevichada', 'SABOR', 25.90,
    true, true, 1, 1, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO3' LIMIT 1),
    'California', 'Roll de cangrejo con aguacate', 'SABOR', 25.90,
    false, true, 1, 2, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO3' LIMIT 1),
    'Furai', 'Roll de camarón empanizado', 'SABOR', 25.90,
    false, true, 1, 3, NOW(), NOW()
);

-- Combo: Barco nikkei
INSERT INTO "ComboComponent" (
    "comboId", name, description, type, price, "isRequired", "isAvailable", 
    "maxSelections", ord, "createdAt", "updatedAt"
) VALUES 
(
    (SELECT id FROM "Combo" WHERE code = 'BARCO_NIKKEI' LIMIT 1),
    'Acevichado', 'Roll de salmón con salsa acevichada', 'SABOR', 25.90,
    true, true, 2, 1, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BARCO_NIKKEI' LIMIT 1),
    'California', 'Roll de cangrejo con aguacate', 'SABOR', 25.90,
    false, true, 2, 2, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BARCO_NIKKEI' LIMIT 1),
    'Furai', 'Roll de camarón empanizado', 'SABOR', 25.90,
    false, true, 2, 3, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BARCO_NIKKEI' LIMIT 1),
    'Olivo', 'Roll de salmón con aceitunas', 'SABOR', 25.90,
    false, true, 2, 4, NOW(), NOW()
);

-- Combo: 30 ROLLS PROMO
INSERT INTO "ComboComponent" (
    "comboId", name, description, type, price, "isRequired", "isAvailable", 
    "maxSelections", ord, "createdAt", "updatedAt"
) VALUES 
(
    (SELECT id FROM "Combo" WHERE code = '30_ROLLS_PROMO' LIMIT 1),
    'Acevichado', 'Roll de salmón con salsa acevichada', 'SABOR', 25.90,
    true, true, 3, 1, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = '30_ROLLS_PROMO' LIMIT 1),
    'California', 'Roll de cangrejo con aguacate', 'SABOR', 25.90,
    false, true, 3, 2, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = '30_ROLLS_PROMO' LIMIT 1),
    'Furai', 'Roll de camarón empanizado', 'SABOR', 25.90,
    false, true, 3, 3, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = '30_ROLLS_PROMO' LIMIT 1),
    'Olivo', 'Roll de salmón con aceitunas', 'SABOR', 25.90,
    false, true, 3, 4, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = '30_ROLLS_PROMO' LIMIT 1),
    'Shiro', 'Roll de salmón blanco', 'SABOR', 25.90,
    false, true, 3, 5, NOW(), NOW()
);

-- Combo: BENTO 1 ( +5.9)
INSERT INTO "ComboComponent" (
    "comboId", name, description, type, price, "isRequired", "isAvailable", 
    "maxSelections", ord, "createdAt", "updatedAt"
) VALUES 
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO1_PLUS' LIMIT 1),
    'Acevichado', 'Roll de salmón con salsa acevichada', 'SABOR', 25.90,
    true, true, 1, 1, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO1_PLUS' LIMIT 1),
    'California', 'Roll de cangrejo con aguacate', 'SABOR', 25.90,
    false, true, 1, 2, NOW(), NOW()
);

-- Combo: Puente Nikkei
INSERT INTO "ComboComponent" (
    "comboId", name, description, type, price, "isRequired", "isAvailable", 
    "maxSelections", ord, "createdAt", "updatedAt"
) VALUES 
(
    (SELECT id FROM "Combo" WHERE code = 'PUENTE_NIKKEI' LIMIT 1),
    'Acevichado', 'Roll de salmón con salsa acevichada', 'SABOR', 25.90,
    true, true, 4, 1, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'PUENTE_NIKKEI' LIMIT 1),
    'California', 'Roll de cangrejo con aguacate', 'SABOR', 25.90,
    false, true, 4, 2, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'PUENTE_NIKKEI' LIMIT 1),
    'Furai', 'Roll de camarón empanizado', 'SABOR', 25.90,
    false, true, 4, 3, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'PUENTE_NIKKEI' LIMIT 1),
    'Olivo', 'Roll de salmón con aceitunas', 'SABOR', 25.90,
    false, true, 4, 4, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'PUENTE_NIKKEI' LIMIT 1),
    'Shiro', 'Roll de salmón blanco', 'SABOR', 25.90,
    false, true, 4, 5, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'PUENTE_NIKKEI' LIMIT 1),
    'Tataki', 'Roll de atún sellado', 'SABOR', 25.90,
    false, true, 4, 6, NOW(), NOW()
);

-- Combo: BENTO 3 ( +5.9)
INSERT INTO "ComboComponent" (
    "comboId", name, description, type, price, "isRequired", "isAvailable", 
    "maxSelections", ord, "createdAt", "updatedAt"
) VALUES 
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO3_PLUS' LIMIT 1),
    'Acevichado', 'Roll de salmón con salsa acevichada', 'SABOR', 25.90,
    true, true, 1, 1, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO3_PLUS' LIMIT 1),
    'California', 'Roll de cangrejo con aguacate', 'SABOR', 25.90,
    false, true, 1, 2, NOW(), NOW()
),
(
    (SELECT id FROM "Combo" WHERE code = 'BENTO3_PLUS' LIMIT 1),
    'Furai', 'Roll de camarón empanizado', 'SABOR', 25.90,
    false, true, 1, 3, NOW(), NOW()
);

-- 3. Verificar que todos los combos ahora tienen componentes
SELECT 
    c.id,
    c.code,
    c.name,
    c."basePrice",
    COUNT(cc.id) as component_count
FROM "Combo" c
LEFT JOIN "ComboComponent" cc ON c.id = cc."comboId"
WHERE c."isEnabled" = true
GROUP BY c.id, c.code, c.name, c."basePrice"
ORDER BY c.name;
