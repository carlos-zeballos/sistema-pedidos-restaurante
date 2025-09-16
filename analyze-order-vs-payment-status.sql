-- =====================================================
-- ANÁLISIS DE ESTADO DE PEDIDOS VS ESTADO DE PAGOS
-- Clarificar la diferencia entre "ENTREGADOS" y "PAGADOS"
-- =====================================================

-- =====================================================
-- 1. ANÁLISIS DE ESTADOS DE PEDIDOS
-- =====================================================

-- Pedidos por estado (ENTREGADOS, PENDIENTES, etc.)
SELECT 
    'ESTADOS DE PEDIDOS' as categoria,
    status,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY status
ORDER BY cantidad DESC;

-- =====================================================
-- 2. ANÁLISIS DE ESTADO DE PAGOS
-- =====================================================

-- Pedidos por estado de pago (isPaid)
SELECT 
    'ESTADO DE PAGOS' as categoria,
    "isPaid",
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY "isPaid"
ORDER BY cantidad DESC;

-- =====================================================
-- 3. CRUCE DE ESTADOS: PEDIDOS VS PAGOS
-- =====================================================

-- Matriz de estados: Pedido vs Pago
SELECT 
    'CRUCE DE ESTADOS' as categoria,
    status as estado_pedido,
    "isPaid" as estado_pago,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY status, "isPaid"
ORDER BY status, "isPaid";

-- =====================================================
-- 4. ANÁLISIS ESPECÍFICO DE PEDIDOS ENTREGADOS
-- =====================================================

-- Pedidos ENTREGADOS con/sin pagos
SELECT 
    'PEDIDOS ENTREGADOS' as categoria,
    CASE 
        WHEN "isPaid" = true THEN 'PAGADOS'
        WHEN "isPaid" = false THEN 'NO PAGADOS'
        ELSE 'SIN ESTADO'
    END as estado_pago,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
WHERE status = 'ENTREGADO'
GROUP BY "isPaid"
ORDER BY "isPaid";

-- =====================================================
-- 5. ANÁLISIS DE PEDIDOS CON PAGOS EN OrderPayment
-- =====================================================

-- Pedidos con pagos en OrderPayment por estado
SELECT 
    'PEDIDOS CON PAGOS EN OrderPayment' as categoria,
    o.status as estado_pedido,
    o."isPaid" as estado_pago,
    COUNT(*) as cantidad,
    SUM(o."totalAmount") as monto_total
FROM "Order" o
WHERE EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = o.id
)
GROUP BY o.status, o."isPaid"
ORDER BY o.status, o."isPaid";

-- =====================================================
-- 6. DIAGNÓSTICO DEL PROBLEMA REAL
-- =====================================================

-- ¿Qué reportes están fallando exactamente?
WITH diagnostico AS (
    SELECT 
        -- Total de pedidos
        COUNT(*) as total_pedidos,
        
        -- Pedidos entregados
        COUNT(*) FILTER (WHERE status = 'ENTREGADO') as pedidos_entregados,
        
        -- Pedidos marcados como pagados
        COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
        
        -- Pedidos con pagos en OrderPayment
        COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
        
        -- Pedidos entregados Y pagados
        COUNT(*) FILTER (WHERE status = 'ENTREGADO' AND "isPaid" = true) as entregados_y_pagados,
        
        -- Pedidos entregados CON pagos en OrderPayment
        COUNT(*) FILTER (WHERE status = 'ENTREGADO' AND EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as entregados_con_pagos
    FROM "Order"
)
SELECT 
    'DIAGNÓSTICO COMPLETO' as categoria,
    d.total_pedidos,
    d.pedidos_entregados,
    d.pedidos_marcados_pagados,
    d.pedidos_con_pagos,
    d.entregados_y_pagados,
    d.entregados_con_pagos,
    -- Diagnósticos
    CASE 
        WHEN d.pedidos_entregados = d.entregados_y_pagados THEN '✅ Todos los entregados están marcados como pagados'
        ELSE '❌ Hay entregados no marcados como pagados'
    END as diagnostico_entregados,
    CASE 
        WHEN d.pedidos_con_pagos = d.pedidos_marcados_pagados THEN '✅ Todos los con pagos están marcados como pagados'
        ELSE '❌ Hay pedidos con pagos no marcados como pagados'
    END as diagnostico_pagos
FROM diagnostico d;

-- =====================================================
-- 7. PREGUNTA CLAVE: ¿QUÉ REPORTE ESTÁ FALLANDO?
-- =====================================================

-- ¿El reporte de "Métodos de Pago" debería mostrar:
-- A) Todos los pedidos con pagos en OrderPayment?
-- B) Solo los pedidos marcados como isPaid = true?
-- C) Solo los pedidos entregados?
-- D) Solo los pedidos entregados Y pagados?

-- Mostrar ejemplos de cada caso
SELECT 
    'EJEMPLOS POR CASO' as categoria,
    o."orderNumber",
    o.status as estado_pedido,
    o."isPaid" as estado_pago,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = o.id) THEN 'SÍ'
        ELSE 'NO'
    END as tiene_pagos_orderpayment,
    o."totalAmount"
FROM "Order" o
ORDER BY o."createdAt" DESC
LIMIT 10;
