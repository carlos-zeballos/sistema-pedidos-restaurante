# 🍣 Sistema de Pedidos para Restaurante

Sistema completo de gestión de pedidos para restaurantes, desarrollado con React, NestJS y Supabase.

## 🚀 Características

- ✅ **Gestión de Órdenes**: Crear, actualizar y gestionar pedidos en tiempo real
- ✅ **Vista de Cocina**: Panel de cocina con cronómetros y alertas
- ✅ **Vista de Mozos**: Gestión de órdenes para el personal de servicio
- ✅ **Gestión de Espacios**: Control de mesas y espacios disponibles
- ✅ **Catálogo de Productos**: Gestión completa de productos y combos
- ✅ **Reportes y Estadísticas**: Análisis de ventas y productos más vendidos
- ✅ **Sistema de Autenticación**: Roles de usuario (Admin, Mozo, Cocinero)
- ✅ **Responsive Design**: Optimizado para tablets y móviles

## 🛠️ Tecnologías

### Frontend
- **React 19** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **Axios** - Cliente HTTP
- **React Router** - Navegación

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos y autenticación
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

### Base de Datos
- **Supabase** - PostgreSQL en la nube
- **RPC Functions** - Funciones almacenadas
- **Real-time** - Actualizaciones en tiempo real

## 📁 Estructura del Proyecto

```
sistema-pedidos-restaurante/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios API
│   │   ├── types/          # Tipos TypeScript
│   │   └── config/         # Configuración
│   ├── public/             # Archivos estáticos
│   └── package.json        # Dependencias del frontend
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación
│   │   ├── orders/         # Gestión de órdenes
│   │   ├── tables/         # Gestión de espacios
│   │   ├── catalog/        # Catálogo de productos
│   │   └── common/         # Utilidades comunes
│   └── package.json        # Dependencias del backend
└── README.md               # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta en Supabase

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-pedidos-restaurante.git
cd sistema-pedidos-restaurante
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de Supabase
npm run build
npm run start:dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con la URL de tu backend
npm start
```

## 🔧 Variables de Entorno

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

## 👥 Usuarios por Defecto

- **Admin**: `admin` / `admin123`
- **Mozo**: `mozo1` / `mozo123`
- **Cocinero**: `cocinero1` / `cocinero123`

## 🚀 Deploy a Producción

### Netlify (Frontend)
1. Conecta tu repositorio con Netlify
2. Configura las variables de entorno
3. Deploy automático en cada push

### Vercel (Backend)
1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Supabase (Base de Datos)
1. Crea un proyecto en Supabase
2. Ejecuta el SQL de configuración
3. Configura las credenciales en producción

## 📱 Uso en Empresa

### Para Tablets/Móviles
- Accede desde el navegador web
- Agrega a pantalla de inicio
- Funciona como PWA

### Para Múltiples Dispositivos
- Configura WiFi de la empresa
- Accede desde cualquier dispositivo
- Usa diferentes roles según el personal

## 🔒 Seguridad

- Autenticación JWT
- Roles de usuario
- Validación de datos
- CORS configurado
- Variables de entorno seguras

## 📊 Características Avanzadas

- **Tiempo Real**: Actualizaciones automáticas
- **Cronómetros**: Control de tiempo de preparación
- **Reportes**: Análisis de ventas y productos
- **Gestión de Espacios**: Control de mesas ocupadas/libres
- **Combos Personalizables**: Creación de combos con componentes
- **Filtros Avanzados**: Búsqueda por fecha, estado, etc.

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en la consola
2. Verifica las variables de entorno
3. Asegúrate de que Supabase esté configurado
4. Contacta al desarrollador

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Desarrollador

Desarrollado con ❤️ para optimizar la gestión de restaurantes.

---

**¡Sistema listo para usar en tu restaurante! 🍣🚀**