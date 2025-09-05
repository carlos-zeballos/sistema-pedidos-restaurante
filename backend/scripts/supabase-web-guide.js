#!/usr/bin/env node

console.log('🚀 GUÍA COMPLETA PARA USAR SUPABASE DESDE LA INTERFAZ WEB\n');

console.log('📋 ACCESO AL PROYECTO:');
console.log('   1. Ve a https://supabase.com/dashboard');
console.log('   2. Inicia sesión con tu cuenta');
console.log('   3. Haz clic en tu proyecto "restaurant-system"\n');

console.log('🔧 HERRAMIENTAS PRINCIPALES:\n');

console.log('1️⃣ TABLE EDITOR:');
console.log('   • Ubicación: Menú lateral → Table Editor');
console.log('   • Función: Crear, editar y gestionar tablas');
console.log('   • Ventajas: Interfaz visual, sin SQL necesario\n');

console.log('2️⃣ SQL EDITOR:');
console.log('   • Ubicación: Menú lateral → SQL Editor');
console.log('   • Función: Ejecutar consultas SQL personalizadas');
console.log('   • Ventajas: Sintaxis highlighting, autocompletado\n');

console.log('3️⃣ AUTHENTICATION:');
console.log('   • Ubicación: Menú lateral → Authentication');
console.log('   • Función: Gestionar usuarios y autenticación');
console.log('   • Ventajas: Configuración visual de políticas\n');

console.log('4️⃣ SETTINGS:');
console.log('   • Ubicación: Menú lateral → Settings');
console.log('   • Función: Configurar API keys, conexiones, etc.');
console.log('   • Ventajas: Gestión centralizada de configuración\n');

console.log('📊 CREAR LAS TABLAS DEL SISTEMA:\n');

console.log('🎯 PASO 1: CREAR TABLA "User"');
console.log('   • Ve a Table Editor → New Table');
console.log('   • Nombre: User');
console.log('   • Columnas:');
console.log('     - id: uuid (Primary Key)');
console.log('     - username: text (Unique)');
console.log('     - password: text');
console.log('     - role: text (Default: "WAITER")');
console.log('     - createdAt: timestamp (Default: now())\n');

console.log('🎯 PASO 2: CREAR TABLA "DiningTable"');
console.log('   • Ve a Table Editor → New Table');
console.log('   • Nombre: DiningTable');
console.log('   • Columnas:');
console.log('     - id: uuid (Primary Key)');
console.log('     - code: text (Unique)');
console.log('     - createdAt: timestamp (Default: now())\n');

console.log('🎯 PASO 3: CREAR TABLA "Category"');
console.log('   • Ve a Table Editor → New Table');
console.log('   • Nombre: Category');
console.log('   • Columnas:');
console.log('     - id: uuid (Primary Key)');
console.log('     - code: text (Unique)');
console.log('     - name: text');
console.log('     - ord: integer');
console.log('     - createdAt: timestamp (Default: now())\n');

console.log('🎯 PASO 4: CREAR TABLA "Product"');
console.log('   • Ve a Table Editor → New Table');
console.log('   • Nombre: Product');
console.log('   • Columnas:');
console.log('     - id: uuid (Primary Key)');
console.log('     - code: text (Unique)');
console.log('     - name: text');
console.log('     - description: text (Nullable)');
console.log('     - basePrice: decimal');
console.log('     - type: text');
console.log('     - station: text (Nullable)');
console.log('     - enabled: boolean (Default: true)');
console.log('     - categoryId: uuid (Foreign Key → Category.id)');
console.log('     - createdAt: timestamp (Default: now())\n');

console.log('🎯 PASO 5: CREAR TABLA "Order"');
console.log('   • Ve a Table Editor → New Table');
console.log('   • Nombre: Order');
console.log('   • Columnas:');
console.log('     - id: uuid (Primary Key)');
console.log('     - status: text (Default: "DRAFT")');
console.log('     - tableId: uuid (Foreign Key → DiningTable.id)');
console.log('     - userId: uuid (Foreign Key → User.id)');
console.log('     - notes: text (Nullable)');
console.log('     - sentAt: timestamp (Nullable)');
console.log('     - readyAt: timestamp (Nullable)');
console.log('     - servedAt: timestamp (Nullable)');
console.log('     - closedAt: timestamp (Nullable)');
console.log('     - totalItems: integer (Default: 0)');
console.log('     - readyCount: integer (Default: 0)');
console.log('     - servedCount: integer (Default: 0)');
console.log('     - createdAt: timestamp (Default: now())\n');

console.log('🎯 PASO 6: CREAR TABLA "OrderItem"');
console.log('   • Ve a Table Editor → New Table');
console.log('   • Nombre: OrderItem');
console.log('   • Columnas:');
console.log('     - id: uuid (Primary Key)');
console.log('     - orderId: uuid (Foreign Key → Order.id)');
console.log('     - productId: uuid (Foreign Key → Product.id, Nullable)');
console.log('     - kind: text');
console.log('     - nameSnapshot: text');
console.log('     - priceSnapshot: decimal');
console.log('     - qty: integer');
console.log('     - station: text (Nullable)');
console.log('     - notes: text (Nullable)');
console.log('     - status: text (Default: "SENT")');
console.log('     - createdAt: timestamp (Default: now())\n');

console.log('💡 INSERTAR DATOS DE PRUEBA:\n');

console.log('📝 USUARIOS DE PRUEBA:');
console.log('   INSERT INTO "User" (id, username, password, role) VALUES');
console.log('   (gen_random_uuid(), "admin", "$2b$10$...", "ADMIN"),');
console.log('   (gen_random_uuid(), "waiter1", "$2b$10$...", "WAITER"),');
console.log('   (gen_random_uuid(), "kitchen", "$2b$10$...", "KITCHEN");\n');

console.log('📝 MESAS DE PRUEBA:');
console.log('   INSERT INTO "DiningTable" (id, code) VALUES');
console.log('   (gen_random_uuid(), "TABLE_1"),');
console.log('   (gen_random_uuid(), "TABLE_2"),');
console.log('   (gen_random_uuid(), "TABLE_3");\n');

console.log('📝 CATEGORÍAS DE PRUEBA:');
console.log('   INSERT INTO "Category" (id, code, name, ord) VALUES');
console.log('   (gen_random_uuid(), "SUSHI", "Sushi", 1),');
console.log('   (gen_random_uuid(), "DRINKS", "Bebidas", 2),');
console.log('   (gen_random_uuid(), "DESSERTS", "Postres", 3);\n');

console.log('🔧 CONFIGURAR RELACIONES:\n');

console.log('1️⃣ Product → Category:');
console.log('   • En la tabla Product, configura categoryId como Foreign Key');
console.log('   • Referencia: Category.id');
console.log('   • Acción: CASCADE\n');

console.log('2️⃣ Order → DiningTable:');
console.log('   • En la tabla Order, configura tableId como Foreign Key');
console.log('   • Referencia: DiningTable.id');
console.log('   • Acción: CASCADE\n');

console.log('3️⃣ Order → User:');
console.log('   • En la tabla Order, configura userId como Foreign Key');
console.log('   • Referencia: User.id');
console.log('   • Acción: CASCADE\n');

console.log('4️⃣ OrderItem → Order:');
console.log('   • En la tabla OrderItem, configura orderId como Foreign Key');
console.log('   • Referencia: Order.id');
console.log('   • Acción: CASCADE\n');

console.log('4️⃣ OrderItem → Product:');
console.log('   • En la tabla OrderItem, configura productId como Foreign Key');
console.log('   • Referencia: Product.id');
console.log('   • Acción: SET NULL\n');

console.log('🎯 VENTAJAS DE ESTE ENFOQUE:');
console.log('   • ✅ Sin problemas de conectividad');
console.log('   • ✅ Interfaz visual intuitiva');
console.log('   • ✅ Gestión de datos en tiempo real');
console.log('   • ✅ Herramientas integradas');
console.log('   • ✅ Monitoreo y logs automáticos');
console.log('   • ✅ Backup automático');
console.log('   • ✅ Escalabilidad automática\n');

console.log('🚀 ¡Listo para usar Supabase directamente!');
console.log('   Accede a tu dashboard y comienza a crear las tablas.');
