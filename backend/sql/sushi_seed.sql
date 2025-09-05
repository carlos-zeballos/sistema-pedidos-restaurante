-- Seed básico para restaurante de Sushi
-- Categorías
INSERT INTO "Category" (name, description, ord, isActive)
VALUES
  ('Sushi', 'Rolls, nigiris y sashimi', 1, true),
  ('Bebidas', 'Bebidas frías y calientes', 2, true),
  ('Postres', 'Dulces japoneses', 3, true),
  ('Adicionales', 'Salsas y acompañamientos', 4, true)
ON CONFLICT DO NOTHING;

-- Productos (Sushi - COMIDA)
INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'SUSHI001', 'California Roll (8p)', 'Palta, kanikama, pepino, sésamo', 8.90, 'COMIDA', c.id, 10, true, true
FROM "Category" c WHERE c.name = 'Sushi'
ON CONFLICT (code) DO NOTHING;

INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'SUSHI002', 'Philadelphia Roll (8p)', 'Queso crema, salmón, palta', 9.90, 'COMIDA', c.id, 12, true, true
FROM "Category" c WHERE c.name = 'Sushi'
ON CONFLICT (code) DO NOTHING;

INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'SUSHI003', 'Spicy Tuna Roll (8p)', 'Atún picante, cebolla, pepino', 10.90, 'COMIDA', c.id, 12, true, true
FROM "Category" c WHERE c.name = 'Sushi'
ON CONFLICT (code) DO NOTHING;

-- Bebidas (BEBIDA)
INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'BEB001', 'Agua Mineral 500ml', 'Agua sin gas', 1.50, 'BEBIDA', c.id, 1, true, true
FROM "Category" c WHERE c.name = 'Bebidas'
ON CONFLICT (code) DO NOTHING;

INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'BEB002', 'Té Verde', 'Té verde japonés caliente', 2.50, 'BEBIDA', c.id, 2, true, true
FROM "Category" c WHERE c.name = 'Bebidas'
ON CONFLICT (code) DO NOTHING;

-- Postres (POSTRE)
INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'POST001', 'Mochi de Té Verde', 'Mochi relleno de matcha', 3.90, 'POSTRE', c.id, 3, true, true
FROM "Category" c WHERE c.name = 'Postres'
ON CONFLICT (code) DO NOTHING;

-- Adicionales (ADICIONAL)
INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'ADI001', 'Salsa de Soja', 'Porción individual', 0.50, 'ADICIONAL', c.id, 0, true, true
FROM "Category" c WHERE c.name = 'Adicionales'
ON CONFLICT (code) DO NOTHING;

INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime, isAvailable, isEnabled)
SELECT 'ADI002', 'Wasabi', 'Pasta de wasabi', 0.50, 'ADICIONAL', c.id, 0, true, true
FROM "Category" c WHERE c.name = 'Adicionales'
ON CONFLICT (code) DO NOTHING;

-- Combo Sushi (COMBO) + Componentes
INSERT INTO "Combo" (code, name, description, basePrice, image, isEnabled, isAvailable, preparationTime, categoryId, maxSelections)
SELECT 'C-SUSHI-01', 'Combo Sushi Clásico', '1 Roll + Bebida + Adicional', 12.90, NULL, true, true, 15, c.id, 1
FROM "Category" c WHERE c.name = 'Sushi'
ON CONFLICT (code) DO NOTHING;

-- Componentes del combo (si el combo existe)
INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'California Roll (8p)', 'SABOR', 0, true, true, 1, 1
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'Philadelphia Roll (8p)', 'SABOR', 0.50, false, true, 1, 2
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'Spicy Tuna Roll (8p)', 'SABOR', 1.00, false, true, 1, 3
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'Agua Mineral 500ml', 'BEBIDA', 0, true, true, 1, 10
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'Té Verde', 'BEBIDA', 0.50, false, true, 1, 11
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'Salsa de Soja', 'COMPLEMENTO', 0, true, true, 1, 20
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, isAvailable, maxSelections, ord)
SELECT co.id, 'Wasabi', 'COMPLEMENTO', 0, true, true, 1, 21
FROM "Combo" co WHERE co.code = 'C-SUSHI-01'
ON CONFLICT DO NOTHING;

