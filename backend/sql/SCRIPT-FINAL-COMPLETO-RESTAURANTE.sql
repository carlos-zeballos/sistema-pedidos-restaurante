-- =====================================================
-- SCRIPT FINAL COMPLETO - SISTEMA RESTAURANTE
-- =====================================================
-- Este script unifica todo el esquema de la base de datos
-- con todas las correcciones y simplificaciones realizadas
-- =====================================================

-- 1. LIMPIAR OBJETOS EXISTENTES
-- =====================================================

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS get_orders_report_by_date(timestamp, date, integer, integer);
DROP FUNCTION IF EXISTS create_order_with_items(jsonb, jsonb[]);
DROP FUNCTION IF EXISTS process_payment(uuid, jsonb);
DROP FUNCTION IF EXISTS get_payment_methods_report_by_date(timestamp, date, integer, integer);
DROP FUNCTION IF EXISTS get_delivery_payments_report_by_date(timestamp, date, integer, integer);
DROP FUNCTION IF EXISTS get_active_orders_for_waiters();
DROP FUNCTION IF EXISTS create_simple_order(jsonb, jsonb[]);
DROP FUNCTION IF EXISTS get_waiters_dashboard_stats();
DROP FUNCTION IF EXISTS is_space_available(uuid);
DROP FUNCTION IF EXISTS auth_login(text, text);
DROP FUNCTION IF EXISTS category_upsert(jsonb);
DROP FUNCTION IF EXISTS product_upsert(jsonb);
DROP FUNCTION IF EXISTS space_upsert(jsonb);
DROP FUNCTION IF EXISTS combo_create_or_update_basic(jsonb);

-- Eliminar vistas existentes
DROP VIEW IF EXISTS "KitchenView";
DROP VIEW IF EXISTS "SpaceStatusView";
DROP VIEW IF EXISTS "OrdersReportView";
DROP VIEW IF EXISTS "TodayReservations";
DROP VIEW IF EXISTS "PrepTimeStats";

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS update_order_updated_at ON "Order";
DROP TRIGGER IF EXISTS update_orderitem_updated_at ON "OrderItem";
DROP TRIGGER IF EXISTS update_product_updated_at ON "Product";
DROP TRIGGER IF EXISTS update_category_updated_at ON "Category";
DROP TRIGGER IF EXISTS update_space_updated_at ON "Space";
DROP TRIGGER IF EXISTS update_combo_updated_at ON "Combo";
DROP TRIGGER IF EXISTS update_orderpayment_updated_at ON "OrderPayment";
DROP TRIGGER IF EXISTS update_orderstatushistory_updated_at ON "OrderStatusHistory";

-- Eliminar tablas existentes (en orden correcto por dependencias)
DROP TABLE IF EXISTS "OrderStatusHistory" CASCADE;
DROP TABLE IF EXISTS "OrderPayment" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Combo" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Space" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Eliminar tipos existentes
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS space_type CASCADE;

-- 2. CREAR EXTENSIONES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. CREAR TIPOS ENUM
-- =====================================================

-- Tipo de estado de pedido (SIMPLIFICADO - sin ENTREGADO)
CREATE TYPE order_status AS ENUM (
    'PENDIENTE',
    'EN_PREPARACION', 
    'LISTO',
    'PAGADO',
    'CANCELADO'
);

-- Tipo de método de pago
CREATE TYPE payment_method AS ENUM (
    'EFECTIVO',
    'TARJETA',
    'TRANSFERENCIA',
    'QR',
    'CREDITO'
);

-- Tipo de espacio
CREATE TYPE space_type AS ENUM (
    'MESA',
    'BARRA',
    'TERRAZA',
    'PRIVADO'
);

-- 4. CREAR TABLAS
-- =====================================================

-- Tabla de usuarios
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'WAITER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de espacios
CREATE TABLE "Space" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type space_type NOT NULL DEFAULT 'MESA',
    capacity INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE "Category" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE "Product" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    "categoryId" UUID REFERENCES "Category"(id),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "prepTimeMinutes" INTEGER DEFAULT 15,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de combos
CREATE TABLE "Combo" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE "Order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
    "customerName" VARCHAR(100) NOT NULL,
    "spaceId" UUID REFERENCES "Space"(id),
    status order_status NOT NULL DEFAULT 'PENDIENTE',
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de items de pedido
CREATE TABLE "OrderItem" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID REFERENCES "Order"(id) ON DELETE CASCADE,
    "productId" UUID REFERENCES "Product"(id),
    "comboId" UUID REFERENCES "Combo"(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status order_status NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE "OrderPayment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID REFERENCES "Order"(id) ON DELETE CASCADE,
    method payment_method NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    "processedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de historial de estados
CREATE TABLE "OrderStatusHistory" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID REFERENCES "Order"(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    "changedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. CREAR ÍNDICES
-- =====================================================

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order" (status);
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order" ("createdAt");
CREATE INDEX IF NOT EXISTS idx_orderitem_order_id ON "OrderItem" ("orderId");
CREATE INDEX IF NOT EXISTS idx_orderitem_product_id ON "OrderItem" ("productId");
CREATE INDEX IF NOT EXISTS idx_orderpayment_order_id ON "OrderPayment" ("orderId");
CREATE INDEX IF NOT EXISTS idx_orderpayment_method ON "OrderPayment" (method);
CREATE INDEX IF NOT EXISTS idx_product_category_id ON "Product" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_available ON "Product" ("isAvailable") WHERE "isAvailable" = true;
CREATE INDEX IF NOT EXISTS idx_space_active ON "Space" ("isActive") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_category_active ON "Category" ("isActive") WHERE "isActive" = true;

-- 6. CREAR TRIGGERS
-- =====================================================

-- Función para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updatedAt
CREATE TRIGGER update_order_updated_at
    BEFORE UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orderitem_updated_at
    BEFORE UPDATE ON "OrderItem"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at
    BEFORE UPDATE ON "Product"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at
    BEFORE UPDATE ON "Category"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_space_updated_at
    BEFORE UPDATE ON "Space"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combo_updated_at
    BEFORE UPDATE ON "Combo"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orderpayment_updated_at
    BEFORE UPDATE ON "OrderPayment"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orderstatushistory_updated_at
    BEFORE UPDATE ON "OrderStatusHistory"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. CREAR VISTAS
-- =====================================================

-- Vista de cocina
CREATE VIEW "KitchenView" AS
SELECT 
    o.id as order_id,
    o."orderNumber",
    o."customerName",
    oi.id as item_id,
    p.name as product_name,
    oi.quantity,
    oi.notes,
    oi.status,
    oi."createdAt" as item_created_at
FROM "Order" o
JOIN "OrderItem" oi ON o.id = oi."orderId"
JOIN "Product" p ON oi."productId" = p.id
WHERE o.status IN ('PENDIENTE', 'EN_PREPARACION')
ORDER BY oi."createdAt" ASC;

-- Vista de estado de espacios
CREATE VIEW "SpaceStatusView" AS
SELECT 
    s.id,
    s.name,
    s.type,
    s.capacity,
    s."isActive",
    CASE 
        WHEN o.id IS NOT NULL AND o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO') 
        THEN 'OCUPADO'
        ELSE 'DISPONIBLE'
    END as status,
    o."customerName" as current_customer,
    o."orderNumber" as current_order
FROM "Space" s
LEFT JOIN "Order" o ON s.id = o."spaceId" 
    AND o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
WHERE s."isActive" = true;

-- Vista de reportes de pedidos
CREATE VIEW "OrdersReportView" AS
SELECT 
    o.id,
    o."orderNumber",
    o."customerName",
    s.name as space_name,
    o.status,
    o."totalAmount",
    COUNT(oi.id) as item_count,
    o."createdAt",
    o."updatedAt"
FROM "Order" o
LEFT JOIN "Space" s ON o."spaceId" = s.id
LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
GROUP BY o.id, o."orderNumber", o."customerName", s.name, o.status, o."totalAmount", o."createdAt", o."updatedAt";

-- Vista de reservas de hoy
CREATE VIEW "TodayReservations" AS
SELECT 
    o.id,
    o."orderNumber",
    o."customerName",
    s.name as space_name,
    s.capacity,
    o.status,
    o."createdAt"
FROM "Order" o
JOIN "Space" s ON o."spaceId" = s.id
WHERE DATE(o."createdAt") = CURRENT_DATE
ORDER BY o."createdAt" DESC;

-- Vista de estadísticas de tiempo de preparación
CREATE VIEW "PrepTimeStats" AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    AVG(EXTRACT(EPOCH FROM (o."updatedAt" - o."createdAt"))/60) as avg_prep_time_minutes,
    COUNT(*) as order_count
FROM "Product" p
JOIN "OrderItem" oi ON p.id = oi."productId"
JOIN "Order" o ON oi."orderId" = o.id
WHERE o.status = 'PAGADO'
GROUP BY p.id, p.name;

-- 8. INSERTAR DATOS INICIALES
-- =====================================================

-- Usuario administrador
INSERT INTO "User" (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@resto.com', crypt('admin123', gen_salt('bf')), 'Administrador', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Usuario mozo
INSERT INTO "User" (username, email, password_hash, full_name, role) 
VALUES ('mozo', 'mozo@resto.com', crypt('mozo123', gen_salt('bf')), 'Mozo Principal', 'WAITER')
ON CONFLICT (username) DO NOTHING;

-- Espacios
INSERT INTO "Space" (name, type, capacity) VALUES
('Mesa 1', 'MESA', 2),
('Mesa 2', 'MESA', 4),
('Mesa 3', 'MESA', 6),
('Barra 1', 'BARRA', 1),
('Barra 2', 'BARRA', 1),
('Terraza 1', 'TERRAZA', 4),
('Terraza 2', 'TERRAZA', 6)
ON CONFLICT DO NOTHING;

-- Categorías
INSERT INTO "Category" (name, description) VALUES
('Entradas', 'Aperitivos y entradas'),
('Platos Principales', 'Platos principales del menú'),
('Postres', 'Postres y dulces'),
('Bebidas', 'Bebidas y refrescos'),
('Sushi', 'Especialidades de sushi')
ON CONFLICT DO NOTHING;

-- Productos
INSERT INTO "Product" (name, description, price, "categoryId", "prepTimeMinutes") VALUES
('Ceviche de Pescado', 'Ceviche fresco con pescado del día', 25.00, (SELECT id FROM "Category" WHERE name = 'Entradas'), 10),
('Anticuchos', 'Anticuchos de corazón de res', 18.00, (SELECT id FROM "Category" WHERE name = 'Entradas'), 15),
('Lomo Saltado', 'Lomo saltado con papas fritas', 35.00, (SELECT id FROM "Category" WHERE name = 'Platos Principales'), 20),
('Arroz con Pollo', 'Arroz con pollo estilo criollo', 28.00, (SELECT id FROM "Category" WHERE name = 'Platos Principales'), 25),
('Tiramisu', 'Tiramisu casero', 12.00, (SELECT id FROM "Category" WHERE name = 'Postres'), 5),
('Helado de Lucuma', 'Helado de lúcuma artesanal', 8.00, (SELECT id FROM "Category" WHERE name = 'Postres'), 3),
('Chicha Morada', 'Chicha morada tradicional', 6.00, (SELECT id FROM "Category" WHERE name = 'Bebidas'), 2),
('Inca Kola', 'Inca Kola 500ml', 4.00, (SELECT id FROM "Category" WHERE name = 'Bebidas'), 1),
('Roll California', 'Roll California con cangrejo', 22.00, (SELECT id FROM "Category" WHERE name = 'Sushi'), 15),
('Roll Philadelphia', 'Roll Philadelphia con salmón', 24.00, (SELECT id FROM "Category" WHERE name = 'Sushi'), 15)
ON CONFLICT DO NOTHING;

-- Combos
INSERT INTO "Combo" (name, description, price) VALUES
('Combo Familiar', 'Lomo saltado + Arroz con pollo + 2 bebidas', 65.00),
('Combo Sushi', 'Roll California + Roll Philadelphia + 1 bebida', 45.00),
('Combo Postre', 'Tiramisu + Helado de lúcuma + 1 bebida', 25.00)
ON CONFLICT DO NOTHING;

-- 9. CREAR FUNCIONES RPC
-- =====================================================

-- Función para obtener pedidos activos para mozos
CREATE OR REPLACE FUNCTION get_active_orders_for_waiters()
RETURNS TABLE (
    id UUID,
    order_number VARCHAR(50),
    customer_name VARCHAR(255),
    space_name VARCHAR(100),
    status VARCHAR(20),
    total_amount DECIMAL(10,2),
    items JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o."orderNumber"::VARCHAR(50) as order_number,
        o."customerName"::VARCHAR(255) as customer_name,
        COALESCE(s.name, 'Sin mesa')::VARCHAR(100) as space_name,
        o.status::VARCHAR(20),
        o."totalAmount" as total_amount,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', p.name,
                    'quantity', oi.quantity,
                    'notes', oi.notes
                ) ORDER BY oi."createdAt"
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::jsonb
        ) as items,
        o."createdAt"::TIMESTAMP WITH TIME ZONE as created_at
    FROM "Order" o
    LEFT JOIN "Space" s ON o."spaceId" = s.id
    LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
    LEFT JOIN "Product" p ON oi."productId" = p.id
    WHERE o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
    GROUP BY o.id, o."orderNumber", o."customerName", s.name, o.status, o."totalAmount", o."createdAt"
    ORDER BY o."createdAt" DESC;
END;
$$;

-- Función para crear pedido simple
CREATE OR REPLACE FUNCTION create_simple_order(
    order_data JSONB,
    items_data JSONB[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id UUID;
    item_data JSONB;
    total_amount DECIMAL(10,2) := 0;
BEGIN
    -- Crear el pedido
    INSERT INTO "Order" (
        "orderNumber",
        "customerName",
        "spaceId",
        status,
        notes
    ) VALUES (
        order_data->>'orderNumber',
        order_data->>'customerName',
        (order_data->>'spaceId')::UUID,
        'PENDIENTE',
        order_data->>'notes'
    ) RETURNING id INTO new_order_id;
    
    -- Crear los items y calcular total
    FOREACH item_data IN ARRAY items_data
    LOOP
        INSERT INTO "OrderItem" (
            "orderId",
            "productId",
            quantity,
            price,
            notes
        ) VALUES (
            new_order_id,
            (item_data->>'productId')::UUID,
            (item_data->>'quantity')::INTEGER,
            (item_data->>'price')::DECIMAL(10,2),
            item_data->>'notes'
        );
        
        total_amount := total_amount + ((item_data->>'quantity')::INTEGER * (item_data->>'price')::DECIMAL(10,2));
    END LOOP;
    
    -- Actualizar el total del pedido
    UPDATE "Order" 
    SET "totalAmount" = total_amount
    WHERE id = new_order_id;
    
    -- Registrar en historial
    INSERT INTO "OrderStatusHistory" ("orderId", status)
    VALUES (new_order_id, 'PENDIENTE');
    
    RETURN new_order_id;
END;
$$;

-- Función para obtener estadísticas del dashboard de mozos
CREATE OR REPLACE FUNCTION get_waiters_dashboard_stats()
RETURNS TABLE (
    total_orders INTEGER,
    pending_orders INTEGER,
    in_preparation_orders INTEGER,
    ready_orders INTEGER,
    total_revenue DECIMAL(10,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_orders,
        COUNT(*) FILTER (WHERE status = 'PENDIENTE')::INTEGER as pending_orders,
        COUNT(*) FILTER (WHERE status = 'EN_PREPARACION')::INTEGER as in_preparation_orders,
        COUNT(*) FILTER (WHERE status = 'LISTO')::INTEGER as ready_orders,
        COALESCE(SUM("totalAmount") FILTER (WHERE status = 'PAGADO'), 0) as total_revenue
    FROM "Order"
    WHERE DATE("createdAt") = CURRENT_DATE;
END;
$$;

-- Función para verificar si un espacio está disponible
CREATE OR REPLACE FUNCTION is_space_available(space_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM "Order" 
        WHERE "spaceId" = space_id 
        AND status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
    );
END;
$$;

-- Función para autenticación
CREATE OR REPLACE FUNCTION auth_login(
    username_param TEXT,
    password_param TEXT
)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20),
    is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.role,
        u.is_active
    FROM "User" u
    WHERE u.username = username_param 
    AND u.password_hash = crypt(password_param, u.password_hash)
    AND u.is_active = true;
END;
$$;

-- Función para upsert de categorías
CREATE OR REPLACE FUNCTION category_upsert(category_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    category_id UUID;
BEGIN
    INSERT INTO "Category" (name, description, "isActive")
    VALUES (
        category_data->>'name',
        category_data->>'description',
        COALESCE((category_data->>'isActive')::BOOLEAN, true)
    )
    ON CONFLICT (name) 
    DO UPDATE SET
        description = EXCLUDED.description,
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = NOW()
    RETURNING id INTO category_id;
    
    RETURN category_id;
END;
$$;

-- Función para upsert de productos
CREATE OR REPLACE FUNCTION product_upsert(product_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_id UUID;
BEGIN
    INSERT INTO "Product" (name, description, price, "categoryId", "isAvailable", "prepTimeMinutes")
    VALUES (
        product_data->>'name',
        product_data->>'description',
        (product_data->>'price')::DECIMAL(10,2),
        (product_data->>'categoryId')::UUID,
        COALESCE((product_data->>'isAvailable')::BOOLEAN, true),
        COALESCE((product_data->>'prepTimeMinutes')::INTEGER, 15)
    )
    ON CONFLICT (name) 
    DO UPDATE SET
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        "categoryId" = EXCLUDED."categoryId",
        "isAvailable" = EXCLUDED."isAvailable",
        "prepTimeMinutes" = EXCLUDED."prepTimeMinutes",
        "updatedAt" = NOW()
    RETURNING id INTO product_id;
    
    RETURN product_id;
END;
$$;

-- Función para upsert de espacios
CREATE OR REPLACE FUNCTION space_upsert(space_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    space_id UUID;
BEGIN
    INSERT INTO "Space" (name, type, capacity, "isActive")
    VALUES (
        space_data->>'name',
        (space_data->>'type')::space_type,
        (space_data->>'capacity')::INTEGER,
        COALESCE((space_data->>'isActive')::BOOLEAN, true)
    )
    ON CONFLICT (name) 
    DO UPDATE SET
        type = EXCLUDED.type,
        capacity = EXCLUDED.capacity,
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = NOW()
    RETURNING id INTO space_id;
    
    RETURN space_id;
END;
$$;

-- Función para crear o actualizar combos básicos
CREATE OR REPLACE FUNCTION combo_create_or_update_basic(combo_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    combo_id UUID;
BEGIN
    INSERT INTO "Combo" (name, description, price, "isActive")
    VALUES (
        combo_data->>'name',
        combo_data->>'description',
        (combo_data->>'price')::DECIMAL(10,2),
        COALESCE((combo_data->>'isActive')::BOOLEAN, true)
    )
    ON CONFLICT (name) 
    DO UPDATE SET
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = NOW()
    RETURNING id INTO combo_id;
    
    RETURN combo_id;
END;
$$;

-- Función para obtener reporte de pedidos por fecha
CREATE OR REPLACE FUNCTION get_orders_report_by_date(
    start_date TIMESTAMP,
    end_date DATE,
    page_size INTEGER DEFAULT 10,
    page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    order_number VARCHAR(50),
    customer_name VARCHAR(255),
    space_name VARCHAR(100),
    status VARCHAR(20),
    total_amount DECIMAL(10,2),
    item_count BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
BEGIN
    offset_value := (page_number - 1) * page_size;
    
    RETURN QUERY
    SELECT
        o.id,
        o."orderNumber"::VARCHAR(50) as order_number,
        o."customerName"::VARCHAR(255) as customer_name,
        COALESCE(s.name, 'Sin mesa')::VARCHAR(100) as space_name,
        o.status::VARCHAR(20),
        o."totalAmount" as total_amount,
        COUNT(oi.id) as item_count,
        o."createdAt"::TIMESTAMP WITH TIME ZONE as created_at,
        o."updatedAt"::TIMESTAMP WITH TIME ZONE as updated_at
    FROM "Order" o
    LEFT JOIN "Space" s ON o."spaceId" = s.id
    LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
    WHERE o."createdAt" >= start_date 
    AND DATE(o."createdAt") <= end_date
    GROUP BY o.id, o."orderNumber", o."customerName", s.name, o.status, o."totalAmount", o."createdAt", o."updatedAt"
    ORDER BY o."createdAt" DESC
    LIMIT page_size
    OFFSET offset_value;
END;
$$;

-- Función para crear pedido con items
CREATE OR REPLACE FUNCTION create_order_with_items(
    order_data JSONB,
    items_data JSONB[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id UUID;
    item_data JSONB;
    total_amount DECIMAL(10,2) := 0;
BEGIN
    -- Crear el pedido
    INSERT INTO "Order" (
        "orderNumber",
        "customerName",
        "spaceId",
        status,
        notes
    ) VALUES (
        order_data->>'orderNumber',
        order_data->>'customerName',
        (order_data->>'spaceId')::UUID,
        'PENDIENTE',
        order_data->>'notes'
    ) RETURNING id INTO new_order_id;
    
    -- Crear los items y calcular total
    FOREACH item_data IN ARRAY items_data
    LOOP
        INSERT INTO "OrderItem" (
            "orderId",
            "productId",
            quantity,
            price,
            notes
        ) VALUES (
            new_order_id,
            (item_data->>'productId')::UUID,
            (item_data->>'quantity')::INTEGER,
            (item_data->>'price')::DECIMAL(10,2),
            item_data->>'notes'
        );
        
        total_amount := total_amount + ((item_data->>'quantity')::INTEGER * (item_data->>'price')::DECIMAL(10,2));
    END LOOP;
    
    -- Actualizar el total del pedido
    UPDATE "Order" 
    SET "totalAmount" = total_amount
    WHERE id = new_order_id;
    
    -- Registrar en historial
    INSERT INTO "OrderStatusHistory" ("orderId", status)
    VALUES (new_order_id, 'PENDIENTE');
    
    RETURN new_order_id;
END;
$$;

-- Función para procesar pago
CREATE OR REPLACE FUNCTION process_payment(
    order_id UUID,
    payment_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_id UUID;
    payment_amount DECIMAL(10,2);
    order_total DECIMAL(10,2);
BEGIN
    -- Obtener el total del pedido
    SELECT "totalAmount" INTO order_total
    FROM "Order"
    WHERE id = order_id;
    
    -- Obtener el monto del pago
    payment_amount := (payment_data->>'amount')::DECIMAL(10,2);
    
    -- Crear el pago
    INSERT INTO "OrderPayment" (
        "orderId",
        method,
        amount
    ) VALUES (
        order_id,
        (payment_data->>'method')::payment_method,
        payment_amount
    ) RETURNING id INTO payment_id;
    
    -- Si el pago es completo, cambiar estado a PAGADO
    IF payment_amount >= order_total THEN
        UPDATE "Order" 
        SET status = 'PAGADO'
        WHERE id = order_id;
        
        -- Registrar en historial
        INSERT INTO "OrderStatusHistory" ("orderId", status)
        VALUES (order_id, 'PAGADO');
    END IF;
    
    RETURN payment_id;
END;
$$;

-- Función para obtener reporte de métodos de pago por fecha
CREATE OR REPLACE FUNCTION get_payment_methods_report_by_date(
    start_date TIMESTAMP,
    end_date DATE,
    page_size INTEGER DEFAULT 10,
    page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
    method VARCHAR(20),
    total_amount DECIMAL(10,2),
    payment_count BIGINT,
    avg_amount DECIMAL(10,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
BEGIN
    offset_value := (page_number - 1) * page_size;
    
    RETURN QUERY
    SELECT
        op.method::VARCHAR(20),
        SUM(op.amount) as total_amount,
        COUNT(*) as payment_count,
        AVG(op.amount) as avg_amount
    FROM "OrderPayment" op
    JOIN "Order" o ON op."orderId" = o.id
    WHERE o."createdAt" >= start_date 
    AND DATE(o."createdAt") <= end_date
    GROUP BY op.method
    ORDER BY total_amount DESC
    LIMIT page_size
    OFFSET offset_value;
END;
$$;

-- Función para obtener reporte de pagos de delivery por fecha
CREATE OR REPLACE FUNCTION get_delivery_payments_report_by_date(
    start_date TIMESTAMP,
    end_date DATE,
    page_size INTEGER DEFAULT 10,
    page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
    method VARCHAR(20),
    total_amount DECIMAL(10,2),
    payment_count BIGINT,
    avg_amount DECIMAL(10,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
BEGIN
    offset_value := (page_number - 1) * page_size;
    
    RETURN QUERY
    SELECT
        op.method::VARCHAR(20),
        SUM(op.amount) as total_amount,
        COUNT(*) as payment_count,
        AVG(op.amount) as avg_amount
    FROM "OrderPayment" op
    JOIN "Order" o ON op."orderId" = o.id
    WHERE o."createdAt" >= start_date 
    AND DATE(o."createdAt") <= end_date
    AND o."spaceId" IS NULL  -- Pedidos sin espacio asignado (delivery)
    GROUP BY op.method
    ORDER BY total_amount DESC
    LIMIT page_size
    OFFSET offset_value;
END;
$$;

-- 10. CONFIGURAR PERMISOS RLS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Space" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Combo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusHistory" ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para desarrollo)
CREATE POLICY "Allow all operations on User" ON "User" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Space" ON "Space" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Category" ON "Category" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Product" ON "Product" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Combo" ON "Combo" FOR ALL USING (true);
CREATE POLICY "Allow all operations on Order" ON "Order" FOR ALL USING (true);
CREATE POLICY "Allow all operations on OrderItem" ON "OrderItem" FOR ALL USING (true);
CREATE POLICY "Allow all operations on OrderPayment" ON "OrderPayment" FOR ALL USING (true);
CREATE POLICY "Allow all operations on OrderStatusHistory" ON "OrderStatusHistory" FOR ALL USING (true);

-- 11. CONFIGURAR PERMISOS PARA FUNCIONES
-- =====================================================

-- Otorgar permisos de ejecución para las funciones RPC
GRANT EXECUTE ON FUNCTION get_active_orders_for_waiters() TO PUBLIC;
GRANT EXECUTE ON FUNCTION create_simple_order(JSONB, JSONB[]) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_waiters_dashboard_stats() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_space_available(UUID) TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth_login(TEXT, TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION category_upsert(JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION product_upsert(JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION space_upsert(JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION combo_create_or_update_basic(JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_orders_report_by_date(TIMESTAMP, DATE, INTEGER, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_with_items(JSONB, JSONB[]) TO PUBLIC;
GRANT EXECUTE ON FUNCTION process_payment(UUID, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_payment_methods_report_by_date(TIMESTAMP, DATE, INTEGER, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_delivery_payments_report_by_date(TIMESTAMP, DATE, INTEGER, INTEGER) TO PUBLIC;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Este script incluye:
-- 1. Limpieza completa de objetos existentes
-- 2. Creación de tipos ENUM simplificados
-- 3. Creación de todas las tablas con tipos correctos
-- 4. Índices optimizados
-- 5. Triggers para updatedAt
-- 6. Vistas para reportes
-- 7. Datos iniciales
-- 8. Funciones RPC completas y corregidas
-- 9. Permisos RLS configurados
-- 10. Permisos de ejecución para funciones
-- =====================================================
