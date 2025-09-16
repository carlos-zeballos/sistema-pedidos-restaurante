-- =====================================================
-- SCRIPT PARA CORREGIR COLUMNAS DE ORDERITEM EN PRODUCCIÓN
-- Ejecuta este SQL en el SQL Editor de Supabase (producción)
-- =====================================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE ORDERITEM
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'OrderItem' 
ORDER BY ordinal_position;

-- 2. CORREGIR COLUMNAS DE ORDERITEM (snake_case -> camelCase)
DO $$
BEGIN
    -- orderid -> orderId
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='OrderItem' AND column_name='orderid') THEN
        EXECUTE 'ALTER TABLE "OrderItem" RENAME COLUMN orderid TO "orderId"';
    END IF;

    -- productid -> productId
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='OrderItem' AND column_name='productid') THEN
        EXECUTE 'ALTER TABLE "OrderItem" RENAME COLUMN productid TO "productId"';
    END IF;

    -- comboid -> comboId
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='OrderItem' AND column_name='comboid') THEN
        EXECUTE 'ALTER TABLE "OrderItem" RENAME COLUMN comboid TO "comboId"';
    END IF;

    -- unitprice -> unitPrice
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='OrderItem' AND column_name='unitprice') THEN
        EXECUTE 'ALTER TABLE "OrderItem" RENAME COLUMN unitprice TO "unitPrice"';
    END IF;

    -- totalprice -> totalPrice
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='OrderItem' AND column_name='totalprice') THEN
        EXECUTE 'ALTER TABLE "OrderItem" RENAME COLUMN totalprice TO "totalPrice"';
    END IF;

    -- createdat -> createdAt
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='OrderItem' AND column_name='createdat') THEN
        EXECUTE 'ALTER TABLE "OrderItem" RENAME COLUMN createdat TO "createdAt"';
    END IF;
END$$;

-- 3. VERIFICAR ESTRUCTURA CORREGIDA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'OrderItem' 
ORDER BY ordinal_position;

-- 4. VERIFICAR QUE LAS FOREIGN KEYS SIGUEN FUNCIONANDO
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'OrderItem';

-- =====================================================
-- ¡COLUMNAS DE ORDERITEM CORREGIDAS!
-- =====================================================






