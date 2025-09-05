# 🍣 Restaurant Backend API

Backend optimizado para sistema de restaurante con NestJS, Prisma y PostgreSQL/Supabase.

## 🚀 Características

- **NestJS** - Framework robusto para APIs
- **Prisma** - ORM moderno con migraciones automáticas
- **PostgreSQL/Supabase** - Base de datos relacional
- **JWT Authentication** - Autenticación segura
- **Optimizado** - Índices de base de datos y operaciones eficientes
- **Transacciones** - Consistencia de datos garantizada

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- PostgreSQL o cuenta de Supabase

## 🔧 Instalación

1. **Clonar y instalar dependencias:**
```bash
cd resto-sql/backend
npm install
```

2. **Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus credenciales
```

3. **Configurar Supabase (recomendado):**
```bash
npm run supabase:setup
```

## 🗄️ Configuración de Base de Datos

### Opción 1: Supabase (Recomendado)

1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener connection string desde Settings > Database
3. Actualizar `DATABASE_URL` en `.env`
4. Ejecutar migraciones:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### Opción 2: PostgreSQL Local

1. Instalar PostgreSQL
2. Crear base de datos
3. Actualizar `DATABASE_URL` en `.env`
4. Ejecutar migraciones (mismos comandos que arriba)

## 🚀 Scripts Disponibles

### Desarrollo
```bash
npm run start:dev          # Servidor con hot reload
npm run start:debug        # Servidor con debug
```

### Base de Datos
```bash
npm run db:generate        # Generar cliente Prisma
npm run db:push           # Sincronizar schema con DB
npm run db:migrate        # Crear nueva migración
npm run db:reset          # Resetear base de datos
npm run db:seed           # Poblar con datos de prueba
npm run db:studio         # Abrir Prisma Studio
```

### Utilidades
```bash
npm run build             # Compilar para producción
npm run start:prod        # Iniciar en modo producción
npm run lint              # Linter y formateo
npm run test              # Ejecutar tests
npm run supabase:setup    # Configurar Supabase
```

## 🔑 Credenciales de Prueba

```
Usuario: admin, waiter, cook
Contraseña: 123456
```

## 📊 Estructura de la Base de Datos

### Modelos Principales
- **User** - Usuarios del sistema (Admin, Waiter, Cook)
- **DiningTable** - Mesas del restaurante
- **Category** - Categorías de productos
- **Product** - Productos del menú
- **Order** - Pedidos de clientes
- **OrderItem** - Items individuales de cada pedido

### Índices Optimizados
- Búsquedas por usuario y rol
- Filtros por estado de mesa
- Consultas de productos por categoría
- Pedidos por estado y fecha
- Relaciones entre tablas

## 🔒 Autenticación

El sistema usa JWT para autenticación. Los tokens se envían en el header:
```
Authorization: Bearer <token>
```

## 🛠️ Optimizaciones Implementadas

### Base de Datos
- ✅ Índices compuestos para consultas frecuentes
- ✅ Transacciones para consistencia de datos
- ✅ Operaciones en lote para mejor rendimiento
- ✅ Validación de esquema automática

### Código
- ✅ Manejo de errores robusto
- ✅ Logging configurado por ambiente
- ✅ Validación de entrada con class-validator
- ✅ CORS configurado correctamente

### Seed Data
- ✅ Operaciones paralelas con Promise.all
- ✅ Transacciones para rollback automático
- ✅ Datos de prueba realistas
- ✅ Eliminación de código duplicado

## 🐛 Solución de Problemas

### Error de Conexión a Supabase
1. Verificar que la IP esté en whitelist
2. Usar connection string con SSL
3. Verificar credenciales en `.env`

### Error de Migración
```bash
npm run db:reset    # Resetear completamente
npm run db:push     # Sincronizar schema
npm run db:seed     # Poblar datos
```

### Error de Autenticación
1. Verificar JWT_SECRET en `.env`
2. Limpiar localStorage del frontend
3. Revisar logs del servidor

## 📝 Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
