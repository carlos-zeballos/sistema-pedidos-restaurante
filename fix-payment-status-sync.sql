-- =====================================================
-- SINCRONIZACIÓN DE ESTADO DE PAGOS
-- Problema: Pedidos con estado "PAGADO" pero isPaid = false
-- Solución: Sincronizar el campo isPaid con el estado del pedido
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DIAGNÓSTICO DEL PROBLEMA
-- =====================================================

-- Mostrar pedidos con estado "PAGADO" pero isPaid = false
SELECT 
    'PEDIDOS CON ESTADO PAGADO PERO isPaid = false' as problema,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
WHERE status = 'PAGADO' AND "isPaid" = false;

-- =====================================================
-- 2. CORRECCIÓN PRINCIPAL
-- =====================================================

-- Marcar como isPaid = true TODOS los pedidos con estado "PAGADO"
UPDATE "Order" 
SET 
    "isPaid" = true,
    "updatedAt" = NOW()
WHERE status = 'PAGADO' 
    AND "isPaid" = false;

-- =====================================================
-- 3. CORRECCIÓN ADICIONAL
-- =====================================================

-- Marcar como isPaid = true TODOS los pedidos que tienen pagos en OrderPayment
-- (esto cubre casos donde el estado no es "PAGADO" pero sí tienen pagos)
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
-- 4. VERIFICACIÓN POST-CORRECCIÓN
-- =====================================================

-- Verificar el resultado
SELECT 
    'DESPUÉS DE CORRECCIÓN' as estado,
    COUNT(*) as total_pedidos,
    COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
    COUNT(*) FILTER (WHERE status = 'PAGADO') as pedidos_estado_pagado,
    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
    SUM("totalAmount") as monto_total_pedidos,
    SUM("totalAmount") FILTER (WHERE "isPaid" = true) as monto_pedidos_pagados
FROM "Order";

-- =====================================================
-- 5. ANÁLISIS DE ESTADOS FINALES
-- =====================================================

-- Matriz final de estados
SELECT 
    'ESTADOS FINALES' as categoria,
    status as estado_pedido,
    "isPaid" as estado_pago,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- =====================================================
-- 6. DIAGNÓSTICO FINAL
-- =====================================================

-- Resumen final
WITH resumen AS (
    SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
        COUNT(*) FILTER (WHERE status = 'PAGADO') as pedidos_estado_pagado,
        COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
        COUNT(*) FILTER (WHERE status = 'PAGADO' AND "isPaid" = true) as pagados_y_marcados,
        COUNT(*) FILTER (WHERE status = 'PAGADO' AND "isPaid" = false) as pagados_no_marcados
    FROM "Order"
)
SELECT 
    'RESUMEN FINAL' as categoria,
    r.total_pedidos,
    r.pedidos_marcados_pagados,
    r.pedidos_estado_pagado,
    r.pedidos_con_pagos,
    r.pagados_y_marcados,
    r.pagados_no_marcados,
    -- Diagnósticos
    CASE 
        WHEN r.pagados_no_marcados = 0 THEN '✅ CORRECTO: Todos los pedidos "PAGADOS" están marcados como isPaid = true'
        ELSE '❌ PROBLEMA: Aún hay pedidos "PAGADOS" no marcados como isPaid = true'
    END as diagnostico_pagados,
    CASE 
        WHEN r.pedidos_con_pagos = r.pedidos_marcados_pagados THEN '✅ CORRECTO: Todos los pedidos con pagos están marcados como isPaid = true'
        ELSE '❌ PROBLEMA: Aún hay pedidos con pagos no marcados como isPaid = true'
    END as diagnostico_pagos
FROM resumen r;

COMMIT;

-- =====================================================
-- 7. INSTRUCCIONES POST-EJECUCIÓN
-- =====================================================

-- Después de ejecutar este script:
-- 1. Los reportes de métodos de pago deberían mostrar TODOS los pedidos con pagos
-- 2. Los pedidos con estado "PAGADO" estarán correctamente marcados como isPaid = true
-- 3. La cantidad en "Métodos de Pago" debería coincidir con los pedidos que tienen pagos
-- 4. No habrá más inconsistencias entre el estado del pedido y el flag isPaid
