-- =====================================================
-- ANÁLISIS PROFUNDO DE PEDIDOS Y PAGOS
-- Problema: 19 pedidos registrados, solo 9 en métodos de pago
-- =====================================================

-- =====================================================
-- 1. ANÁLISIS GENERAL DE PEDIDOS
-- =====================================================

-- Total de pedidos registrados
SELECT 
    'TOTAL PEDIDOS' as categoria,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order";

-- Pedidos por estado
SELECT 
    'POR ESTADO' as categoria,
    status,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order"
GROUP BY status
ORDER BY cantidad DESC;

-- Pedidos por tipo de espacio
SELECT 
    'POR TIPO ESPACIO' as categoria,
    s.type as tipo_espacio,
    COUNT(*) as cantidad,
    SUM(o."totalAmount") as monto_total
FROM "Order" o
JOIN "Space" s ON o."spaceId" = s.id
GROUP BY s.type
ORDER BY cantidad DESC;

-- =====================================================
-- 2. ANÁLISIS DE PAGOS
-- =====================================================

-- Total de pagos registrados
SELECT 
    'TOTAL PAGOS' as categoria,
    COUNT(*) as cantidad,
    SUM(amount) as monto_total
FROM "OrderPayment";

-- Pagos por método
SELECT 
    'POR MÉTODO PAGO' as categoria,
    pm.name as metodo_pago,
    COUNT(*) as cantidad,
    SUM(op.amount) as monto_total
FROM "OrderPayment" op
JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
GROUP BY pm.name
ORDER BY cantidad DESC;

-- =====================================================
-- 3. ANÁLISIS DE PEDIDOS CON/SIN PAGOS
-- =====================================================

-- Pedidos CON pagos
SELECT 
    'PEDIDOS CON PAGOS' as categoria,
    COUNT(DISTINCT o.id) as cantidad_pedidos,
    COUNT(op.id) as cantidad_pagos,
    SUM(o."totalAmount") as monto_pedidos,
    SUM(op.amount) as monto_pagos
FROM "Order" o
JOIN "OrderPayment" op ON o.id = op."orderId";

-- Pedidos SIN pagos
SELECT 
    'PEDIDOS SIN PAGOS' as categoria,
    COUNT(*) as cantidad,
    SUM("totalAmount") as monto_total
FROM "Order" o
WHERE NOT EXISTS (
    SELECT 1 FROM "OrderPayment" op 
    WHERE op."orderId" = o.id
);

-- =====================================================
-- 4. ANÁLISIS DETALLADO POR PEDIDO
-- =====================================================

-- Lista completa de pedidos con información de pagos
SELECT 
    o."orderNumber",
    o.status,
    o."customerName",
    o."totalAmount",
    o."isPaid",
    s.type as tipo_espacio,
    o."createdAt",
    -- Información de pagos
    COUNT(op.id) as cantidad_pagos,
    SUM(op.amount) as monto_pagado,
    STRING_AGG(pm.name, ', ') as metodos_pago,
    -- Estado del pago
    CASE 
        WHEN COUNT(op.id) = 0 THEN 'SIN PAGOS'
        WHEN SUM(op.amount) >= o."totalAmount" THEN 'PAGADO COMPLETO'
        WHEN SUM(op.amount) > 0 THEN 'PAGADO PARCIAL'
        ELSE 'SIN PAGOS'
    END as estado_pago
FROM "Order" o
LEFT JOIN "OrderPayment" op ON o.id = op."orderId"
LEFT JOIN "PaymentMethod" pm ON op."paymentMethodId" = pm.id
LEFT JOIN "Space" s ON o."spaceId" = s.id
GROUP BY o.id, o."orderNumber", o.status, o."customerName", o."totalAmount", o."isPaid", s.type, o."createdAt"
ORDER BY o."createdAt" DESC;

-- =====================================================
-- 5. ANÁLISIS DE PROBLEMAS ESPECÍFICOS
-- =====================================================

-- Pedidos marcados como pagados pero sin pagos en OrderPayment
SELECT 
    'PEDIDOS MARCADOS COMO PAGADOS SIN PAGOS' as problema,
    o."orderNumber",
    o."customerName",
    o."totalAmount",
    o."isPaid",
    o.status
FROM "Order" o
WHERE o."isPaid" = true
    AND NOT EXISTS (
        SELECT 1 FROM "OrderPayment" op 
        WHERE op."orderId" = o.id
    );

-- Pedidos con pagos pero no marcados como pagados
SELECT 
    'PEDIDOS CON PAGOS NO MARCADOS COMO PAGADOS' as problema,
    o."orderNumber",
    o."customerName",
    o."totalAmount",
    o."isPaid",
    COUNT(op.id) as cantidad_pagos,
    SUM(op.amount) as monto_pagado
FROM "Order" o
JOIN "OrderPayment" op ON o.id = op."orderId"
WHERE o."isPaid" = false
GROUP BY o.id, o."orderNumber", o."customerName", o."totalAmount", o."isPaid";

-- =====================================================
-- 6. ANÁLISIS DE INCONSISTENCIAS
-- =====================================================

-- Pedidos con monto pagado diferente al total
SELECT 
    'INCONSISTENCIAS MONTO' as problema,
    o."orderNumber",
    o."customerName",
    o."totalAmount" as monto_pedido,
    SUM(op.amount) as monto_pagado,
    (o."totalAmount" - SUM(op.amount)) as diferencia
FROM "Order" o
JOIN "OrderPayment" op ON o.id = op."orderId"
GROUP BY o.id, o."orderNumber", o."customerName", o."totalAmount"
HAVING ABS(o."totalAmount" - SUM(op.amount)) > 0.01
ORDER BY diferencia DESC;

-- =====================================================
-- 7. RESUMEN EJECUTIVO
-- =====================================================

-- Resumen final del problema
WITH resumen AS (
    SELECT 
        COUNT(*) as total_pedidos,
        COUNT(*) FILTER (WHERE "isPaid" = true) as pedidos_marcados_pagados,
        COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "OrderPayment" op WHERE op."orderId" = "Order".id)) as pedidos_con_pagos,
        SUM("totalAmount") as monto_total_pedidos,
        SUM("totalAmount") FILTER (WHERE "isPaid" = true) as monto_pedidos_pagados
    FROM "Order"
),
pagos_resumen AS (
    SELECT 
        COUNT(*) as total_pagos,
        SUM(amount) as monto_total_pagos
    FROM "OrderPayment"
)
SELECT 
    'RESUMEN EJECUTIVO' as categoria,
    r.total_pedidos,
    r.pedidos_marcados_pagados,
    r.pedidos_con_pagos,
    pr.total_pagos,
    r.monto_total_pedidos,
    r.monto_pedidos_pagados,
    pr.monto_total_pagos,
    -- Diagnóstico
    CASE 
        WHEN r.total_pedidos = r.pedidos_marcados_pagados THEN 'OK: Todos los pedidos marcados como pagados'
        WHEN r.pedidos_marcados_pagados < r.total_pedidos THEN 'PROBLEMA: Faltan pedidos marcados como pagados'
        ELSE 'PROBLEMA: Más pedidos marcados como pagados que total'
    END as diagnostico_pagados,
    CASE 
        WHEN r.total_pedidos = r.pedidos_con_pagos THEN 'OK: Todos los pedidos tienen pagos'
        WHEN r.pedidos_con_pagos < r.total_pedidos THEN 'PROBLEMA: Faltan pagos en OrderPayment'
        ELSE 'PROBLEMA: Más pagos que pedidos'
    END as diagnostico_pagos
FROM resumen r, pagos_resumen pr;
