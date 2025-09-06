-- =========================================================
-- PRUEBA DIRECTA DEL RPC DESDE SQL
-- =========================================================
-- Ejecuta esto después de aplicar clean-triggers-and-rpc.sql
-- =========================================================

-- Prueba mínima (desde SQL)
SELECT * FROM public.create_order_with_items(
  '1a8a16ea-b645-457c-a3d1-86ca00159b7b',      -- p_created_by (USER.id existente)
  'Cliente Test',                               -- p_customer_name
  '999888777',                                  -- p_customer_phone
  0,                                            -- p_discount
  jsonb_build_array(                            -- p_items (ARRAY JSONB)
    jsonb_build_object(
      'productId','c015c69d-2212-46b4-9594-8d97905b3116',
      'name','Gyozas (8 unidades)',
      'unitPrice',15.9,
      'quantity',1,
      'notes','Test'
    )
  ),
  'Notas desde SQL',                            -- p_notes
  'aa09d6a3-f05c-4f14-8f72-92139f5a42cf',      -- p_space_id (Space.id)
  15.9,                                         -- p_subtotal
  0,                                            -- p_tax
  15.9                                          -- p_total_amount
);

-- =========================================================
-- VERIFICACIÓN DE RESULTADOS
-- =========================================================

-- Verificar que se creó la orden
SELECT 
  o.id,
  o."orderNumber",
  o."customerName",
  o."totalAmount",
  o.status,
  o."createdAt"
FROM "Order" o 
ORDER BY o."createdAt" DESC 
LIMIT 1;

-- Verificar que se crearon los items
SELECT 
  oi.id,
  oi.orderid,
  oi.productid,
  oi.name,
  oi.quantity,
  oi.unitprice,
  oi.totalprice,
  oi.status,
  oi.createdat
FROM "OrderItem" oi 
WHERE oi.orderid = (
  SELECT id FROM "Order" ORDER BY "createdAt" DESC LIMIT 1
);

-- =========================================================
-- VERIFICAR TRIGGERS ACTIVOS
-- =========================================================

-- Ver qué triggers quedaron en "Order" (sin errores)
SELECT
  t.tgname  AS trigger_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_class c ON c.oid = t.tgrelid
WHERE NOT t.tgisinternal AND c.relname = 'Order'
ORDER BY 1;




