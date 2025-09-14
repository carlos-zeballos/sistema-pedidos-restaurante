-- =====================================================
-- SISTEMA COMPLETO DE GESTIÓN DE RESTAURANTE (ESTILO KFC)
-- =====================================================
-- Sistema para: Mozos, Cocineros, Caja, Gestión de Pedidos
-- Incluye: 3 Mesas, 2 Puestos de Barra, 5 Espacios Delivery, Reservas
-- =====================================================

-- =====================================================
-- 1. ENUMS DEL SISTEMA
-- =====================================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA');

-- Estados de pedido
CREATE TYPE order_status AS ENUM ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- Estados de mesa
CREATE TYPE table_status AS ENUM ('LIBRE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO');

-- Tipos de producto
CREATE TYPE product_type AS ENUM ('COMIDA', 'BEBIDA', 'POSTRE', 'COMBO', 'ADICIONAL');

-- Tipos de espacio
CREATE TYPE space_type AS ENUM ('MESA', 'BARRA', 'DELIVERY', 'RESERVA');

-- Estados de reserva
CREATE TYPE reservation_status AS ENUM ('CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'COMPLETADA');

-- =====================================================
-- 2. TABLAS PRINCIPALES
-- =====================================================

-- Usuarios del sistema
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role user_role NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT true,
    lastLogin TIMESTAMP,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categorías de productos
CREATE TABLE "Category" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    isActive BOOLEAN NOT NULL DEFAULT true,
    ord INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Productos
CREATE TABLE "Product" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    type product_type NOT NULL DEFAULT 'COMIDA',
    categoryId UUID NOT NULL,
    preparationTime INTEGER DEFAULT 15, -- minutos
    isAvailable BOOLEAN NOT NULL DEFAULT true,
    isEnabled BOOLEAN NOT NULL DEFAULT true,
    allergens TEXT[],
    nutritionalInfo JSONB,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (categoryId) REFERENCES "Category"(id) ON DELETE CASCADE
);

-- Combos
CREATE TABLE "Combo" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    basePrice DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    isEnabled BOOLEAN NOT NULL DEFAULT true,
    isAvailable BOOLEAN NOT NULL DEFAULT true,
    preparationTime INTEGER DEFAULT 20,
    categoryId UUID NOT NULL,
    maxSelections INTEGER DEFAULT 1,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (categoryId) REFERENCES "Category"(id) ON DELETE CASCADE
);

-- Componentes de combo
CREATE TABLE "ComboComponent" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comboId UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- SABOR, COMPLEMENTO, BEBIDA, POSTRE, SALSA
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    isRequired BOOLEAN NOT NULL DEFAULT false,
    isAvailable BOOLEAN NOT NULL DEFAULT true,
    maxSelections INTEGER DEFAULT 1,
    ord INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (comboId) REFERENCES "Combo"(id) ON DELETE CASCADE
);

-- Espacios del restaurante (Mesas, Barra, Delivery)
CREATE TABLE "Space" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- M1, M2, M3, B1, B2, D1, D2, D3, D4, D5
    name VARCHAR(50) NOT NULL,
    type space_type NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status table_status NOT NULL DEFAULT 'LIBRE',
    isActive BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reservas
CREATE TABLE "Reservation" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customerName VARCHAR(100) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerEmail VARCHAR(100),
    spaceId UUID NOT NULL,
    reservationDate DATE NOT NULL,
    reservationTime TIME NOT NULL,
    partySize INTEGER NOT NULL,
    status reservation_status NOT NULL DEFAULT 'PENDIENTE',
    notes TEXT,
    confirmedBy UUID,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (spaceId) REFERENCES "Space"(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmedBy) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Pedidos
CREATE TABLE "Order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderNumber VARCHAR(20) UNIQUE NOT NULL,
    spaceId UUID NOT NULL,
    customerName VARCHAR(100),
    customerPhone VARCHAR(20),
    status order_status NOT NULL DEFAULT 'PENDIENTE',
    totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    estimatedReadyTime TIMESTAMP,
    actualReadyTime TIMESTAMP,
    createdBy UUID NOT NULL,
    assignedTo UUID,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (spaceId) REFERENCES "Space"(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES "User"(id) ON DELETE SET NULL
);

-- Items del pedido
CREATE TABLE "OrderItem" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId UUID NOT NULL,
    productId UUID,
    comboId UUID,
    name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status order_status NOT NULL DEFAULT 'PENDIENTE',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES "Product"(id) ON DELETE CASCADE,
    FOREIGN KEY (comboId) REFERENCES "Combo"(id) ON DELETE CASCADE
);

-- Componentes de items de combo
CREATE TABLE "OrderItemComponent" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderItemId UUID NOT NULL,
    comboComponentId UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (orderItemId) REFERENCES "OrderItem"(id) ON DELETE CASCADE,
    FOREIGN KEY (comboComponentId) REFERENCES "ComboComponent"(id) ON DELETE CASCADE
);

-- Historial de estados de pedidos
CREATE TABLE "OrderStatusHistory" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orderId UUID NOT NULL,
    status order_status NOT NULL,
    changedBy UUID NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
    FOREIGN KEY (changedBy) REFERENCES "User"(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. FUNCIONES Y TRIGGERS
-- =====================================================

-- Habilitar extensión para hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para generar número de pedido automático
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.orderNumber := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(COALESCE((SELECT COUNT(*) FROM "Order" WHERE DATE(createdAt) = CURRENT_DATE), 0) + 1::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de pedido
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON "Category" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combo_updated_at BEFORE UPDATE ON "Combo" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combo_component_updated_at BEFORE UPDATE ON "ComboComponent" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_space_updated_at BEFORE UPDATE ON "Space" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservation_updated_at BEFORE UPDATE ON "Reservation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar cambios de estado
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO "OrderStatusHistory" (orderId, status, changedBy, notes)
        VALUES (NEW.id, NEW.status, NEW.assignedTo, 'Cambio de estado automático');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios de estado
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- Función para verificar contraseña
CREATE OR REPLACE FUNCTION verify_password(input_password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN crypt(input_password, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. VISTAS ÚTILES
-- =====================================================

-- Vista de pedidos activos para cocina
CREATE VIEW "KitchenView" AS
SELECT 
    o.id,
    o.orderNumber,
    o.status,
    s.name as spaceName,
    s.code as spaceCode,
    o.customerName,
    o.estimatedReadyTime,
    o.createdAt,
    COUNT(oi.id) as totalItems,
    SUM(CASE WHEN oi.status = 'PENDIENTE' THEN 1 ELSE 0 END) as pendingItems
FROM "Order" o
JOIN "Space" s ON o.spaceId = s.id
LEFT JOIN "OrderItem" oi ON o.id = oi.orderId
WHERE o.status IN ('PENDIENTE', 'EN_PREPARACION')
GROUP BY o.id, o.orderNumber, o.status, s.name, s.code, o.customerName, o.estimatedReadyTime, o.createdAt
ORDER BY o.createdAt ASC;

-- Vista de espacios y su estado
CREATE VIEW "SpaceStatusView" AS
SELECT 
    s.id,
    s.code,
    s.name,
    s.type,
    s.capacity,
    s.status,
    o.id as currentOrderId,
    o.orderNumber,
    o.customerName,
    o.status as orderStatus,
    o.createdAt as orderCreatedAt
FROM "Space" s
LEFT JOIN "Order" o ON s.id = o.spaceId AND o.status IN ('PENDIENTE', 'EN_PREPARACION', 'LISTO')
WHERE s.isActive = true
ORDER BY s.type, s.code;

-- Vista de reservas del día
CREATE VIEW "TodayReservations" AS
SELECT 
    r.id,
    r.customerName,
    r.customerPhone,
    r.customerEmail,
    r.reservationTime,
    r.partySize,
    r.status,
    s.name as spaceName,
    s.code as spaceCode,
    u.firstName || ' ' || u.lastName as confirmedBy
FROM "Reservation" r
JOIN "Space" s ON r.spaceId = s.id
LEFT JOIN "User" u ON r.confirmedBy = u.id
WHERE r.reservationDate = CURRENT_DATE
ORDER BY r.reservationTime ASC;

-- Vista de estadísticas de preparación
CREATE VIEW "PrepTimeStats" AS
SELECT 
    p.name as productName,
    p.code as productCode,
    AVG(EXTRACT(EPOCH FROM (o.actualReadyTime - o.createdAt))/60) as avgPrepTime,
    COUNT(o.id) as totalOrders,
    AVG(oi.quantity) as avgQuantity
FROM "Product" p
LEFT JOIN "OrderItem" oi ON p.id = oi.productId
LEFT JOIN "Order" o ON oi.orderId = o.id AND o.actualReadyTime IS NOT NULL
WHERE p.isEnabled = true
GROUP BY p.id, p.name, p.code
ORDER BY avgPrepTime DESC;

-- =====================================================
-- 5. DATOS INICIALES
-- =====================================================

-- Insertar usuarios del sistema
INSERT INTO "User" (username, password, firstName, lastName, email, role) VALUES
('admin', crypt('Admin123!', gen_salt('bf', 10)), 'Administrador', 'Sistema', 'admin@restaurant.com', 'ADMIN'),
('mozo1', crypt('Mozo123!', gen_salt('bf', 10)), 'Juan', 'Pérez', 'mozo1@restaurant.com', 'MOZO'),
('mozo2', crypt('Mozo123!', gen_salt('bf', 10)), 'María', 'García', 'mozo2@restaurant.com', 'MOZO'),
('cocinero1', crypt('Cocina123!', gen_salt('bf', 10)), 'Carlos', 'López', 'cocinero1@restaurant.com', 'COCINERO'),
('cocinero2', crypt('Cocina123!', gen_salt('bf', 10)), 'Ana', 'Martínez', 'cocinero2@restaurant.com', 'COCINERO'),
('caja1', crypt('Caja123!', gen_salt('bf', 10)), 'Roberto', 'Rodríguez', 'caja1@restaurant.com', 'CAJA'),
('barra1', crypt('Barra123!', gen_salt('bf', 10)), 'Laura', 'Fernández', 'barra1@restaurant.com', 'BARRA'),
('barra2', crypt('Barra123!', gen_salt('bf', 10)), 'Diego', 'González', 'barra2@restaurant.com', 'BARRA');

-- Insertar categorías
INSERT INTO "Category" (name, description, ord) VALUES
('Hamburguesas', 'Hamburguesas clásicas y especiales', 1),
('Pollo', 'Pollo frito y asado', 2),
('Bebidas', 'Refrescos, jugos y bebidas', 3),
('Postres', 'Postres y dulces', 4),
('Combos', 'Combos especiales', 5),
('Adicionales', 'Complementos y extras', 6);

-- Insertar productos
INSERT INTO "Product" (code, name, description, price, type, categoryId, preparationTime) VALUES
-- Hamburguesas
('H001', 'Hamburguesa Clásica', 'Hamburguesa con carne, lechuga, tomate y queso', 8.99, 'COMIDA', (SELECT id FROM "Category" WHERE name = 'Hamburguesas'), 10),
('H002', 'Hamburguesa Doble', 'Hamburguesa doble con carne, lechuga, tomate y queso', 12.99, 'COMIDA', (SELECT id FROM "Category" WHERE name = 'Hamburguesas'), 12),
('H003', 'Hamburguesa Especial', 'Hamburguesa con bacon, cebolla caramelizada y salsa especial', 14.99, 'COMIDA', (SELECT id FROM "Category" WHERE name = 'Hamburguesas'), 15),

-- Pollo
('P001', 'Pollo Frito (4 piezas)', '4 piezas de pollo frito crujiente', 16.99, 'COMIDA', (SELECT id FROM "Category" WHERE name = 'Pollo'), 20),
('P002', 'Pollo Asado', 'Pollo asado con hierbas', 18.99, 'COMIDA', (SELECT id FROM "Category" WHERE name = 'Pollo'), 25),
('P003', 'Alitas BBQ', '6 alitas con salsa BBQ', 13.99, 'COMIDA', (SELECT id FROM "Category" WHERE name = 'Pollo'), 15),

-- Bebidas
('B001', 'Coca Cola', 'Coca Cola 500ml', 2.99, 'BEBIDA', (SELECT id FROM "Category" WHERE name = 'Bebidas'), 1),
('B002', 'Sprite', 'Sprite 500ml', 2.99, 'BEBIDA', (SELECT id FROM "Category" WHERE name = 'Bebidas'), 1),
('B003', 'Fanta', 'Fanta 500ml', 2.99, 'BEBIDA', (SELECT id FROM "Category" WHERE name = 'Bebidas'), 1),
('B004', 'Agua Mineral', 'Agua mineral 500ml', 1.99, 'BEBIDA', (SELECT id FROM "Category" WHERE name = 'Bebidas'), 1),

-- Postres
('POST001', 'Helado de Vainilla', 'Helado de vainilla con toppings', 4.99, 'POSTRE', (SELECT id FROM "Category" WHERE name = 'Postres'), 3),
('POST002', 'Brownie', 'Brownie con chocolate', 5.99, 'POSTRE', (SELECT id FROM "Category" WHERE name = 'Postres'), 2),
('POST003', 'Cheesecake', 'Cheesecake de frutilla', 6.99, 'POSTRE', (SELECT id FROM "Category" WHERE name = 'Postres'), 2),

-- Adicionales
('AD001', 'Papas Fritas', 'Porción de papas fritas', 3.99, 'ADICIONAL', (SELECT id FROM "Category" WHERE name = 'Adicionales'), 8),
('AD002', 'Onion Rings', 'Aros de cebolla', 4.99, 'ADICIONAL', (SELECT id FROM "Category" WHERE name = 'Adicionales'), 8),
('AD003', 'Nuggets (6 piezas)', '6 nuggets de pollo', 5.99, 'ADICIONAL', (SELECT id FROM "Category" WHERE name = 'Adicionales'), 10);

-- Insertar combos
INSERT INTO "Combo" (code, name, description, basePrice, categoryId, preparationTime) VALUES
('C001', 'Combo Clásico', 'Hamburguesa Clásica + Papas + Bebida', 14.99, (SELECT id FROM "Category" WHERE name = 'Combos'), 15),
('C002', 'Combo Familiar', '2 Hamburguesas + 2 Papas + 2 Bebidas + Postre', 29.99, (SELECT id FROM "Category" WHERE name = 'Combos'), 20),
('C003', 'Combo Pollo', 'Pollo Frito + Papas + Bebida + Postre', 22.99, (SELECT id FROM "Category" WHERE name = 'Combos'), 25);

-- Insertar componentes de combos
INSERT INTO "ComboComponent" (comboId, name, type, price, isRequired, maxSelections) VALUES
-- Combo Clásico
((SELECT id FROM "Combo" WHERE code = 'C001'), 'Hamburguesa Clásica', 'SABOR', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C001'), 'Papas Fritas', 'COMPLEMENTO', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C001'), 'Coca Cola', 'BEBIDA', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C001'), 'Sprite', 'BEBIDA', 0, false, 1),
((SELECT id FROM "Combo" WHERE code = 'C001'), 'Fanta', 'BEBIDA', 0, false, 1),

-- Combo Familiar
((SELECT id FROM "Combo" WHERE code = 'C002'), 'Hamburguesa Clásica', 'SABOR', 0, true, 2),
((SELECT id FROM "Combo" WHERE code = 'C002'), 'Hamburguesa Doble', 'SABOR', 2.00, false, 2),
((SELECT id FROM "Combo" WHERE code = 'C002'), 'Papas Fritas', 'COMPLEMENTO', 0, true, 2),
((SELECT id FROM "Combo" WHERE code = 'C002'), 'Onion Rings', 'COMPLEMENTO', 1.00, false, 2),
((SELECT id FROM "Combo" WHERE code = 'C002'), 'Coca Cola', 'BEBIDA', 0, true, 2),
((SELECT id FROM "Combo" WHERE code = 'C002'), 'Helado de Vainilla', 'POSTRE', 0, true, 1),

-- Combo Pollo
((SELECT id FROM "Combo" WHERE code = 'C003'), 'Pollo Frito (4 piezas)', 'SABOR', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C003'), 'Pollo Asado', 'SABOR', 2.00, false, 1),
((SELECT id FROM "Combo" WHERE code = 'C003'), 'Papas Fritas', 'COMPLEMENTO', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C003'), 'Coca Cola', 'BEBIDA', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C003'), 'Helado de Vainilla', 'POSTRE', 0, true, 1),
((SELECT id FROM "Combo" WHERE code = 'C003'), 'Brownie', 'POSTRE', 1.00, false, 1);

-- Insertar espacios del restaurante
INSERT INTO "Space" (code, name, type, capacity, status) VALUES
-- Mesas
('M1', 'Mesa 1', 'MESA', 4, 'LIBRE'),
('M2', 'Mesa 2', 'MESA', 4, 'LIBRE'),
('M3', 'Mesa 3', 'MESA', 6, 'LIBRE'),

-- Barra
('B1', 'Barra 1', 'BARRA', 2, 'LIBRE'),
('B2', 'Barra 2', 'BARRA', 2, 'LIBRE'),

-- Delivery
('D1', 'Delivery 1', 'DELIVERY', 1, 'LIBRE'),
('D2', 'Delivery 2', 'DELIVERY', 1, 'LIBRE'),
('D3', 'Delivery 3', 'DELIVERY', 1, 'LIBRE'),
('D4', 'Delivery 4', 'DELIVERY', 1, 'LIBRE'),
('D5', 'Delivery 5', 'DELIVERY', 1, 'LIBRE');

-- =====================================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas rápidas
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_order_created_at ON "Order"(createdAt);
CREATE INDEX idx_order_space ON "Order"(spaceId);
CREATE INDEX idx_order_number ON "Order"(orderNumber);

CREATE INDEX idx_order_item_order ON "OrderItem"(orderId);
CREATE INDEX idx_order_item_status ON "OrderItem"(status);

CREATE INDEX idx_space_type ON "Space"(type);
CREATE INDEX idx_space_status ON "Space"(status);

CREATE INDEX idx_reservation_date ON "Reservation"(reservationDate);
CREATE INDEX idx_reservation_status ON "Reservation"(status);

CREATE INDEX idx_product_category ON "Product"(categoryId);
CREATE INDEX idx_product_code ON "Product"(code);

-- =====================================================
-- 7. POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Combo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComboComponent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Space" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItemComponent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusHistory" ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para desarrollo)
CREATE POLICY "Allow all for development" ON "User" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "Category" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "Product" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "Combo" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "ComboComponent" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "Space" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "Reservation" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "Order" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "OrderItem" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "OrderItemComponent" FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON "OrderStatusHistory" FOR ALL USING (true);

-- =====================================================
-- ¡SISTEMA COMPLETO DE GESTIÓN DE RESTAURANTE CREADO!
-- =====================================================















