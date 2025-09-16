-- Script para probar la creación de pedidos con IDs válidos
-- Reemplaza los UUIDs con los IDs válidos que obtuviste de los scripts anteriores

-- IDs válidos obtenidos de la base de datos:
-- Space ID: 216489b8-a77e-4ecc-9c8a-89cb25e4dfe8 (BARRA1)
-- User ID: 1a8a16ea-b645-457c-a3d1-86ca00159b7b (Roberto Rodríguez - CAJA)

-- Crear pedido de prueba con IDs válidos:
SELECT create_test_order(
    '216489b8-a77e-4ecc-9c8a-89cb25e4dfe8'::uuid,  -- Space ID válido (BARRA1)
    'Cliente Test',
    '123456789',
    '1a8a16ea-b645-457c-a3d1-86ca00159b7b'::uuid,   -- User ID válido (Roberto - CAJA)
    'Prueba de corrección de triggers'
);

-- 1. Verificar que los IDs existen antes de usarlos
SELECT 
    'Verificando Space ID:' as tipo,
    id,
    code,
    name,
    "isActive"
FROM "Space" 
WHERE id = '216489b8-a77e-4ecc-9c8a-89cb25e4dfe8'::uuid;

SELECT 
    'Verificando User ID:' as tipo,
    id,
    username,
    firstname,
    lastname,
    isactive
FROM "User" 
WHERE id = '1a8a16ea-b645-457c-a3d1-86ca00159b7b'::uuid;

-- 3. Verificar el pedido creado
SELECT 
    id,
    "orderNumber",
    "customerName",
    status,
    "createdAt"
FROM "Order" 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- 4. Verificar el historial de estados
SELECT 
    osh.id,
    osh."orderId",
    osh.status,
    osh."changedBy",
    osh.notes,
    osh."createdAt"
FROM "OrderStatusHistory" osh
ORDER BY osh."createdAt" DESC 
LIMIT 5;
