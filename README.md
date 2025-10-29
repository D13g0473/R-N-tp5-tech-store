# 🛒 Tech Store App - React Native + Strapi

Una aplicación móvil completa de e-commerce para productos tecnológicos, construida con React Native (Expo) y Strapi como backend headless CMS.

## 📋 Características Principales

- ✅ **Autenticación completa** con roles (Admin/Customer)
- ✅ **Catálogo de productos** con filtros y búsqueda
- ✅ **Carrito de compras** con gestión de cantidades
- ✅ **Sistema de favoritos** para usuarios autenticados
- ✅ **Vista detallada de productos** con galería de imágenes
- ✅ **Gestión de pedidos** con checkout simulado
- ✅ **Panel de administración** en Strapi
- ✅ **Responsive design** optimizado para móviles

## 🏗️ Arquitectura

### Backend (Strapi v5)
- **Content Types**: Product, Category, Brand, Order, User
- **Relaciones**: Product ↔ Category, Product ↔ Brand, Order ↔ User
- **Permisos**: Role-based access control (Admin/Customer)
- **API**: REST/GraphQL con paginación y filtros

### Frontend (React Native + Expo)
- **Navegación**: Stack + Tab Navigator
- **Estado**: Context API para Auth, Cart, Favorites
- **UI**: Componentes nativos con estilos personalizados
- **API Client**: Axios con interceptores de autenticación

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+
- **Yarn/NPM**
- **Expo CLI**
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/D13g0473/RN-tech_store.git
cd RN-tech_store
```

### 2. Configurar el Backend (Strapi)

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

**⚠️ IMPORTANTE: Editar `backend/.env`**

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS="tu_clave_1,tu_clave_2"
API_TOKEN_SALT=tu_api_token_salt_seguro
ADMIN_JWT_SECRET=tu_admin_jwt_secret_seguro
TRANSFER_TOKEN_SALT=tu_transfer_token_salt_seguro
JWT_SECRET=tu_jwt_secret_seguro
ENCRYPTION_KEY=tu_encryption_key_seguro
```

**Generar claves seguras:**
```bash
# Para APP_KEYS (generar 2 claves aleatorias)
openssl rand -base64 32
openssl rand -base64 32

# Para los JWT secrets (generar claves largas)
openssl rand -base64 64
```

```bash
# Construir la aplicación
npm run build

# Iniciar Strapi
npm run develop
```

**Acceder al panel de administración:**
- URL: `http://localhost:1337/admin`
- Crear usuario administrador en el primer inicio

### 3. Configurar la App Móvil (React Native)

```bash
cd ../mobile

# Instalar dependencias
npm install
```

**⚠️ IMPORTANTE: Configurar la IP del backend en `mobile/.env`**

```env
# Reemplazar con la IP de tu máquina/backend
API_BASE_URL=http://TU_IP_AQUI:1337/api
API_BASE_URL_NO_API=http://TU_IP_AQUI:1337/
```

**Cómo encontrar tu IP:**
```bash
# En Linux/Mac
ifconfig | grep inet

# En Windows
ipconfig
```

**Ejemplo:**
```env
API_BASE_URL=http://192.168.1.100:1337/api
API_BASE_URL_NO_API=http://192.168.1.100:1337/
```

### 4. Ejecutar la aplicación

```bash
# Desde la carpeta mobile
npx expo start
```

Escanea el QR con:
- 📱 **Expo Go** (recomendado)
- 📱 **Cámara del dispositivo** (iOS)

## 🔧 Configuración de Roles y Permisos

### En Strapi Admin Panel:

1. **Ir a Settings → Users & Permissions → Roles**
2. **Editar rol "Authenticated" (Customer):**
   - ✅ Products: `find`, `findOne`
   - ✅ Categories: `find`, `findOne`
   - ✅ Brands: `find`, `findOne`
   - ✅ Orders: `create`, `find`, `update` (own), `delete` (own)
   - ✅ Users: `find`, `update` (own profile)

3. **Rol "Admin" tiene acceso completo a todo**

## 📱 Funcionalidades de la App

### Para Usuarios No Autenticados:
- 🔍 Explorar productos
- 📋 Ver detalles de productos
- 🔍 Buscar productos
- 🏷️ Filtrar por categoría/marca

### Para Usuarios Autenticados:
- ❤️ Agregar/quitar favoritos
- 🛒 Gestionar carrito
- 📦 Crear pedidos
- 👤 Ver perfil y editar información

### Para Administradores:
- 📊 Panel completo de administración en Strapi
- 📝 CRUD completo de productos, categorías, marcas
- 📋 Gestión de pedidos
- 👥 Gestión de usuarios

## 🗂️ Estructura del Proyecto

```
RN-tech_store/
├── backend/                 # Strapi CMS
│   ├── src/api/            # Content Types (Product, Category, etc.)
│   ├── config/             # Configuración de Strapi
│   └── public/uploads/     # Archivos subidos
├── mobile/                  # React Native App
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Context API (Auth, Cart, Favorites)
│   │   ├── screens/        # Pantallas de la app
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript interfaces
│   └── .env                # Variables de entorno
└── README.md
```

## 🔐 Autenticación

- **Registro**: Email + contraseña
- **Login**: Email + contraseña
- **JWT Tokens**: Almacenados de forma segura
- **Auto-login**: Persistencia de sesión
- **Role-based**: Admin vs Customer permissions

## 🛍️ Modelo de Datos

### Product
- `name`: string
- `description`: text
- `price`: decimal
- `discount`: integer (0-100)
- `stock`: integer
- `image`: media (multiple)
- `category`: relation
- `brand`: relation

### Order
- `items`: JSON (product_id, quantity, price)
- `total`: decimal
- `user`: relation
- `status`: enum

### Category & Brand
- `name`: string
- `description`: text

## 🚨 Solución de Problemas

### Error de conexión con el backend:
1. Verificar que Strapi esté corriendo en el puerto 1337
2. Confirmar que la IP en `mobile/.env` sea correcta
3. Asegurarse de que el firewall permita conexiones

### Problemas con Expo:
```bash
# Limpiar cache
npx expo start --clear

# Reiniciar Metro bundler
npx expo r -c
```

### Error de permisos en Strapi:
1. Ir al Admin Panel
2. Settings → Users & Permissions → Roles
3. Configurar permisos según la sección anterior

## 📚 Tecnologías Utilizadas

### Backend:
- **Strapi v5** - Headless CMS
- **SQLite** - Base de datos (desarrollo)
- **JWT** - Autenticación

### Frontend:
- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local

### Librerías Adicionales:
- **@react-navigation/native** - Navegación
- **react-native-gesture-handler** - Gestos avanzados
- **react-native-reanimated** - Animaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es parte del Trabajo Práctico 5 de la Licenciatura en Sistemas de Información - Arquitectura de Programación Móvil.

---

**Desarrollado por:** Diego García
**Curso:** Arquitectura de Programación Móvil - 2025
