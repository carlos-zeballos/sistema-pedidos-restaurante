-- =====================================================
-- CORRECCIÓN MASIVA DE ESTADO DE PAGOS
-- Problema: 75 pedidos tienen pagos pero no están marcados como isPaid = true
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DIAGNÓSTICO PREVIO
-- =====================================================

-- Mostrar pedidos con pagos pero no marcados como pagados
SELECT 
    'PEDIDOS CON PAGOS NO MARCADOS COMO PAGADOS' as problema,
    COUNT(*) as cantidad,
    SUM(o."totalAmount") as monto_total
FROM "Order" o
WHERE EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = o.id
)
AND o."isPaid" = false;

-- =====================================================
-- 2. CORRECCIÓN MASIVA
-- =====================================================

-- Marcar como pagados TODOS los pedidos que tienen pagos en OrderPayment
UPDATE "Order" 
SET 
    "isPaid" = true,
    "updatedAt" = NOW()
WHERE EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = "Order".id
)
AND "isPaid" = false;

-- =====================================================
-- 3. VERIFICACIÓN POST-CORRECCIÓN
-- =====================================================

-- Verificar el resultado
SELECT 
    'DESPUÉS DE CORRECCIÓN' as estado,
    COUNT(*) as total_pedidos,
    COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
    SUM("totalAmount") as monto_total_pedidos,
    SUM("totalAmount") FILTER (WHERE "isPaid" = true) as monto_pedidos_pagados
FROM "Order";

-- =====================================================
-- 4. ANÁLISIS DE PEDIDOS SIN PAGOS
-- =====================================================

-- Mostrar pedidos que NO tienen pagos (estos son los que realmente no están pagados)
SELECT 
    'PEDIDOS REALMENTE SIN PAGOS' as categoria,
    o."orderNumber",
    o."customerName",
    o."totalAmount",
    o.status,
    o."createdAt"
FROM "Order" o
WHERE NOT EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = o.id
)
ORDER BY o."createdAt" DESC;

-- =====================================================
-- 5. RESUMEN FINAL
-- =====================================================

-- Resumen final
WITH resumen AS (
    SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
        COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
        COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_sin_pagos
    FROM "Order"
)
SELECT 
    'RESUMEN FINAL' as categoria,
    r.total_pedidos,
    r.pedidos_marcados_pagados,
    r.pedidos_con_pagos,
    r.pedidos_sin_pagos,
    -- Diagnóstico
    CASE 
        WHEN r.pedidos_marcados_pagados = r.pedidos_con_pagos THEN '✅ CORRECTO: Todos los pedidos con pagos están marcados como pagados'
        ELSE '❌ PROBLEMA: Aún hay inconsistencias'
    END as diagnostico_final
FROM resumen r;

COMMIT;

-- =====================================================
-- 6. INSTRUCCIONES POST-EJECUCIÓN
-- =====================================================

-- Después de ejecutar este script:
-- 1. Los reportes de métodos de pago deberían mostrar TODOS los pedidos con pagos
-- 2. Los pedidos sin pagos aparecerán como "no pagados" correctamente
-- 3. La cantidad en "Métodos de Pago" debería coincidir con los pedidos que tienen pagos
