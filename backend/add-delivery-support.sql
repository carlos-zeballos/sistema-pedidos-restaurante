-- =====================================================
-- AGREGAR SOPORTE COMPLETO PARA DELIVERY
-- =====================================================
-- Este script agrega los campos y tablas necesarias para
-- manejar delivery cost y pagos de delivery automáticamente
-- =====================================================

BEGIN;

-- =====================================================
-- 1. AGREGAR CAMPOS DE DELIVERY A LA TABLA ORDER
-- =====================================================

-- Agregar campos de delivery si no existen
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "deliveryCost" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isDelivery" BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 2. CREAR TABLA DE MÉTODOS DE PAGO
-- =====================================================

CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(20) DEFAULT '💳',
    color VARCHAR(7) DEFAULT '#3B82F6',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insertar métodos de pago básicos
INSERT INTO "PaymentMethod" (name, description, icon, color) VALUES
('Efectivo', 'Pago en efectivo', '💵', '#10B981'),
('Tarjeta', 'Pago con tarjeta', '💳', '#3B82F6'),
('Yape', 'Pago con Yape', '📱', '#8B5CF6'),
('Plin', 'Pago con Plin', '📱', '#F59E0B'),
('Transferencia', 'Transferencia bancaria', '🏦', '#6B7280')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    "updatedAt" = NOW();

-- =====================================================
-- 3. CREAR TABLA DE PAGOS DE ÓRDENES
-- =====================================================

CREATE TABLE IF NOT EXISTS "OrderPayment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL,
    "paymentMethodId" UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    "baseAmount" DECIMAL(10,2) DEFAULT 0, -- Monto base del pedido
    "surchargeAmount" DECIMAL(10,2) DEFAULT 0, -- Monto adicional (delivery)
    "isDeliveryService" BOOLEAN DEFAULT FALSE, -- Si es pago de delivery
    "paymentDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE,
    FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_order_delivery ON "Order"("isDelivery", "deliveryCost");
CREATE INDEX IF NOT EXISTS idx_order_payment_order ON "OrderPayment"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_payment_method ON "OrderPayment"("paymentMethodId");
CREATE INDEX IF NOT EXISTS idx_order_payment_delivery ON "OrderPayment"("isDeliveryService");

-- =====================================================
-- 5. ACTUALIZAR FUNCIÓN DE CREACIÓN DE ÓRDENES
-- =====================================================

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS public.create_order_with_items(
    UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC
);

-- Crear función actualizada con soporte para delivery
CREATE OR REPLACE FUNCTION public.create_order_with_items(
    p_created_by      UUID,
    p_customer_name   TEXT,
    p_customer_phone  TEXT,
    p_discount        NUMERIC(10,2),
    p_items           JSONB,
    p_notes           TEXT,
    p_space_id        UUID,
    p_subtotal        NUMERIC(10,2),
    p_tax             NUMERIC(10,2),
    p_total_amount    NUMERIC(10,2),
    p_delivery_cost   NUMERIC(10,2) DEFAULT 0,
    p_is_delivery     BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (id UUID, ordernumber TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order_id        UUID;
    v_order_number    TEXT;
    v_item            JSONB;
    v_qty             INTEGER;
    v_product_id      UUID;
    v_combo_id        UUID;
    v_unit_price      NUMERIC(10,2);
    v_name            TEXT;
    v_item_notes      TEXT;
    v_order_item_id   UUID;
    v_comp            JSONB;
    v_comp_id         UUID;
    v_comp_name       TEXT;
    v_comp_type       TEXT;
    v_comp_price      NUMERIC(10,2);
    v_comp_qty        INTEGER;
    v_comp_notes      TEXT;
    v_subtotal_calc   NUMERIC(10,2) := 0;
    v_subtotal_final  NUMERIC(10,2);
    v_tax_final       NUMERIC(10,2);
    v_discount_final  NUMERIC(10,2);
    v_delivery_final  NUMERIC(10,2);
    v_total_final     NUMERIC(10,2);
    v_dummy           INTEGER;
BEGIN
    -- ===== 1) Validaciones previas =====
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'p_items debe ser un arreglo JSONB con al menos un item';
    END IF;

    SELECT 1 INTO v_dummy FROM "Space" s WHERE s.id = p_space_id AND s."isActive" IS TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El espacio % no existe o no está activo', p_space_id;
    END IF;

    SELECT 1 INTO v_dummy FROM "User" u WHERE u.id = p_created_by AND u."isActive" IS TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El usuario creador % no existe o no está activo', p_created_by;
    END IF;

    -- ===== 2) Calcular subtotal a partir de items =====
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := NULL;
        v_combo_id   := NULL;
        v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
        v_item_notes := v_item->>'notes';

        IF (v_item ? 'productId') THEN
            v_product_id := (v_item->>'productId')::uuid;
            PERFORM 1 FROM "Product" p
             WHERE p.id = v_product_id AND p."isEnabled" IS TRUE AND p."isAvailable" IS TRUE;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Producto % no existe, no está habilitado o no está disponible', v_product_id;
            END IF;
        ELSIF (v_item ? 'comboId') THEN
            v_combo_id := (v_item->>'comboId')::uuid;
            PERFORM 1 FROM "Combo" c
             WHERE c.id = v_combo_id AND c."isEnabled" IS TRUE AND c."isAvailable" IS TRUE;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Combo % no existe, no está habilitado o no está disponible', v_combo_id;
            END IF;
        ELSE
            RAISE EXCEPTION 'Cada item debe tener productId o comboId. Item: %', v_item;
        END IF;

        -- precio unitario (param o catálogo)
        IF (v_item ? 'unitPrice') THEN
            v_unit_price := (v_item->>'unitPrice')::numeric;
        ELSE
            IF v_product_id IS NOT NULL THEN
                SELECT p.price::numeric INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
            ELSE
                SELECT c."basePrice"::numeric INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
            END IF;
        END IF;

        IF v_unit_price IS NULL THEN
            RAISE EXCEPTION 'No se pudo determinar el precio unitario del item: %', v_item;
        END IF;

        v_subtotal_calc := v_subtotal_calc + (v_unit_price * v_qty);
    END LOOP;

    -- ===== 3) Totales con delivery =====
    v_discount_final := COALESCE(p_discount, 0);
    v_tax_final      := COALESCE(p_tax, 0);
    v_delivery_final := COALESCE(p_delivery_cost, 0);
    v_subtotal_final := COALESCE(p_subtotal, v_subtotal_calc);
    v_total_final    := COALESCE(p_total_amount, v_subtotal_final + v_tax_final + v_delivery_final - v_discount_final);

    -- ===== 4) Insertar cabecera con delivery =====
    INSERT INTO "Order" AS o (
        "spaceId", "customerName", "customerPhone",
        status, "totalAmount", subtotal, tax, discount,
        "deliveryCost", "isDelivery",
        notes, "createdBy", "createdAt", "updatedAt"
    ) VALUES (
        p_space_id, p_customer_name, p_customer_phone,
        'PENDIENTE', v_total_final, v_subtotal_final, v_tax_final, v_discount_final,
        v_delivery_final, p_is_delivery,
        p_notes, p_created_by, NOW(), NOW()
    )
    RETURNING o.id, o."orderNumber" INTO v_order_id, v_order_number;

    -- si el trigger no generó número, forzar uno
    IF v_order_number IS NULL OR v_order_number = '' THEN
        UPDATE "Order" AS o
           SET "orderNumber" = 'ORD' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM()*100)::TEXT, 2, '0')
         WHERE o.id = v_order_id
        RETURNING o."orderNumber" INTO v_order_number;
    END IF;

    -- ===== 5) Insertar ítems (igual que antes) =====
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := NULL;
        v_combo_id   := NULL;
        v_qty        := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));
        v_item_notes := v_item->>'notes';

        IF (v_item ? 'productId') THEN
            v_product_id := (v_item->>'productId')::uuid;
        ELSIF (v_item ? 'comboId') THEN
            v_combo_id := (v_item->>'comboId')::uuid;
        END IF;

        IF (v_item ? 'unitPrice') THEN
            v_unit_price := (v_item->>'unitPrice')::numeric;
        ELSE
            IF v_product_id IS NOT NULL THEN
                SELECT p.price::numeric INTO v_unit_price FROM "Product" p WHERE p.id = v_product_id;
            ELSE
                SELECT c."basePrice"::numeric INTO v_unit_price FROM "Combo" c WHERE c.id = v_combo_id;
            END IF;
        END IF;

        v_name := NULLIF(v_item->>'name','');
        IF v_name IS NULL THEN
            IF v_product_id IS NOT NULL THEN
                SELECT p.name INTO v_name FROM "Product" p WHERE p.id = v_product_id;
            ELSE
                SELECT c.name INTO v_name FROM "Combo" c WHERE c.id = v_combo_id;
            END IF;
        END IF;

        INSERT INTO "OrderItem"(
            "orderId", "productId", "comboId", name,
            quantity, "unitPrice", "totalPrice", notes, status, "createdAt"
        ) VALUES (
            v_order_id, v_product_id, v_combo_id, v_name,
            v_qty, v_unit_price, (v_unit_price * v_qty), v_item_notes, 'PENDIENTE', NOW()
        )
        RETURNING id INTO v_order_item_id;

        -- componentes opcionales (si el item trae "components": [])
        IF (v_item ? 'components') AND jsonb_typeof(v_item->'components') = 'array' THEN
            FOR v_comp IN SELECT * FROM jsonb_array_elements(v_item->'components')
            LOOP
                v_comp_id   := NULLIF(v_comp->>'comboComponentId','')::uuid;
                v_comp_qty  := GREATEST(1, COALESCE((v_comp->>'quantity')::int, 1));
                v_comp_notes:= v_comp->>'notes';

                -- completar nombre/tipo/precio desde catálogo si no vienen
                IF v_comp_id IS NOT NULL THEN
                    IF (v_comp ? 'name') THEN
                        v_comp_name := v_comp->>'name';
                    ELSE
                        SELECT cc.name INTO v_comp_name FROM "ComboComponent" cc WHERE cc.id = v_comp_id;
                    END IF;

                    IF (v_comp ? 'type') THEN
                        v_comp_type := v_comp->>'type';
                    ELSE
                        SELECT cc.type INTO v_comp_type FROM "ComboComponent" cc WHERE cc.id = v_comp_id;
                    END IF;

                    IF (v_comp ? 'price') THEN
                        v_comp_price := (v_comp->>'price')::numeric;
                    ELSE
                        SELECT COALESCE(cc.price,0)::numeric INTO v_comp_price FROM "ComboComponent" cc WHERE cc.id = v_comp_id;
                    END IF;
                ELSE
                    -- si no hay id, requiere al menos name y type
                    v_comp_name  := NULLIF(v_comp->>'name','');
                    v_comp_type  := NULLIF(v_comp->>'type','');
                    v_comp_price := COALESCE((v_comp->>'price')::numeric, 0);
                    IF v_comp_name IS NULL OR v_comp_type IS NULL THEN
                        RAISE EXCEPTION 'Componente de item inválido (falta comboComponentId o name/type): %', v_comp;
                    END IF;
                END IF;

                INSERT INTO "OrderItemComponent"(
                    "orderItemId","comboComponentId",name,type,price,quantity,notes,"createdAt"
                ) VALUES (
                    v_order_item_id, v_comp_id, v_comp_name, v_comp_type, v_comp_price, v_comp_qty, v_comp_notes, NOW()
                );
            END LOOP;
        END IF;
    END LOOP;

    -- ===== 6) Recalcular totales cabecera =====
    WITH s AS (
        SELECT COALESCE(SUM("totalPrice"),0)::numeric(10,2) AS sum_items
        FROM "OrderItem"
        WHERE "orderId" = v_order_id
    )
    UPDATE "Order" o
       SET subtotal      = s.sum_items,
           "totalAmount" = (s.sum_items + v_tax_final + v_delivery_final - v_discount_final),
           "updatedAt"   = NOW()
      FROM s
     WHERE o.id = v_order_id;

    -- ===== 7) Estado del espacio =====
    UPDATE "Space" s
       SET status = 'OCUPADA',
           "updatedAt" = NOW()
     WHERE s.id = p_space_id;

    -- ===== 8) Historial inicial =====
    INSERT INTO "OrderStatusHistory"("orderId","status","changedBy","notes","createdAt")
    VALUES (v_order_id, 'PENDIENTE', p_created_by, 'Creación de pedido', NOW());

    -- ===== 9) Salida =====
    id := v_order_id;
    ordernumber := v_order_number;
    RETURN NEXT;
    RETURN;
END;
$$;

-- =====================================================
-- 6. CREAR FUNCIÓN PARA REGISTRAR PAGOS DE DELIVERY
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_delivery_payment(
    p_order_id UUID,
    p_payment_method_id UUID,
    p_delivery_amount NUMERIC(10,2),
    p_base_amount NUMERIC(10,2) DEFAULT 0,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_payment_id UUID;
    v_dummy INTEGER;
BEGIN
    -- Validar que la orden existe
    SELECT 1 INTO v_dummy FROM "Order" WHERE id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La orden % no existe', p_order_id;
    END IF;

    -- Validar que el método de pago existe
    SELECT 1 INTO v_dummy FROM "PaymentMethod" WHERE id = p_payment_method_id AND "isActive" = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El método de pago % no existe o no está activo', p_payment_method_id;
    END IF;

    -- Insertar pago de delivery
    INSERT INTO "OrderPayment"(
        "orderId", "paymentMethodId", amount, "baseAmount", 
        "surchargeAmount", "isDeliveryService", notes, "createdAt"
    ) VALUES (
        p_order_id, p_payment_method_id, p_delivery_amount, p_base_amount,
        p_delivery_amount, TRUE, p_notes, NOW()
    )
    RETURNING id INTO v_payment_id;

    RETURN v_payment_id;
END;
$$;

-- =====================================================
-- 7. CREAR FUNCIÓN PARA REGISTRAR PAGO COMPLETO
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_order_payment(
    p_order_id UUID,
    p_payment_method_id UUID,
    p_total_amount NUMERIC(10,2),
    p_delivery_amount NUMERIC(10,2) DEFAULT 0,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (payment_id UUID, delivery_payment_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_payment_id UUID;
    v_delivery_payment_id UUID;
    v_base_amount NUMERIC(10,2);
    v_dummy INTEGER;
BEGIN
    -- Validar que la orden existe
    SELECT 1 INTO v_dummy FROM "Order" WHERE id = p_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La orden % no existe', p_order_id;
    END IF;

    -- Validar que el método de pago existe
    SELECT 1 INTO v_dummy FROM "PaymentMethod" WHERE id = p_payment_method_id AND "isActive" = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El método de pago % no existe o no está activo', p_payment_method_id;
    END IF;

    -- Calcular monto base (total - delivery)
    v_base_amount := p_total_amount - p_delivery_amount;

    -- Insertar pago principal
    INSERT INTO "OrderPayment"(
        "orderId", "paymentMethodId", amount, "baseAmount", 
        "surchargeAmount", "isDeliveryService", notes, "createdAt"
    ) VALUES (
        p_order_id, p_payment_method_id, v_base_amount, v_base_amount,
        0, FALSE, p_notes, NOW()
    )
    RETURNING id INTO v_payment_id;

    -- Si hay monto de delivery, insertar pago de delivery separado
    IF p_delivery_amount > 0 THEN
        INSERT INTO "OrderPayment"(
            "orderId", "paymentMethodId", amount, "baseAmount", 
            "surchargeAmount", "isDeliveryService", notes, "createdAt"
        ) VALUES (
            p_order_id, p_payment_method_id, p_delivery_amount, 0,
            p_delivery_amount, TRUE, p_notes, NOW()
        )
        RETURNING id INTO v_delivery_payment_id;
    END IF;

    -- Actualizar estado de la orden a PAGADO
    UPDATE "Order" 
    SET status = 'PAGADO', "updatedAt" = NOW()
    WHERE id = p_order_id;

    -- Registrar cambio de estado
    INSERT INTO "OrderStatusHistory"("orderId","status","changedBy","notes","createdAt")
    VALUES (p_order_id, 'PAGADO', (SELECT "createdBy" FROM "Order" WHERE id = p_order_id), 'Pago registrado', NOW());

    -- Salida
    payment_id := v_payment_id;
    delivery_payment_id := v_delivery_payment_id;
    RETURN NEXT;
END;
$$;

-- =====================================================
-- 8. PERMISOS PARA LAS FUNCIONES
-- =====================================================

-- Permisos para create_order_with_items
REVOKE ALL ON FUNCTION public.create_order_with_items(
    UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, BOOLEAN
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
    UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, UUID, NUMERIC, NUMERIC, NUMERIC, NUMERIC, BOOLEAN
) TO anon, authenticated;

-- Permisos para register_delivery_payment
REVOKE ALL ON FUNCTION public.register_delivery_payment(
    UUID, UUID, NUMERIC, NUMERIC, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_delivery_payment(
    UUID, UUID, NUMERIC, NUMERIC, TEXT
) TO anon, authenticated;

-- Permisos para register_order_payment
REVOKE ALL ON FUNCTION public.register_order_payment(
    UUID, UUID, NUMERIC, NUMERIC, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_order_payment(
    UUID, UUID, NUMERIC, NUMERIC, TEXT
) TO anon, authenticated;

-- =====================================================
-- 9. POLÍTICAS RLS PARA NUEVAS TABLAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE "PaymentMethod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderPayment" ENABLE ROW LEVEL SECURITY;

-- Políticas para desarrollo (permitir todo)
CREATE POLICY "Allow all for development" ON "PaymentMethod" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for development" ON "OrderPayment" FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 10. REFRESCAR ESQUEMA DE LA API
-- =====================================================

SELECT pg_notify('pgrst','reload schema');

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'Order' 
  AND column_name IN ('deliveryCost', 'isDelivery')
ORDER BY column_name;

-- Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('PaymentMethod', 'OrderPayment')
ORDER BY table_name;

-- Verificar métodos de pago insertados
SELECT name, icon, color FROM "PaymentMethod" ORDER BY name;
