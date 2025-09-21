# Linobelesa 3.0 React - E-commerce Platform

Sistema completo de e-commerce para productos de belleza y cuidado capilar desarrollado con React y Node.js.

## 🌟 Características

- **Frontend**: React con Vite, CSS modular, componentes reutilizables
- **Backend**: Node.js con Express, APIs RESTful
- **Base de datos**: MongoDB Atlas con colecciones organizadas
- **Autenticación**: JWT tokens, registro y login seguros
- **UI/UX**: Diseño responsivo, modales de éxito, navegación fluida

## 📋 Funcionalidades

### Autenticación
- ✅ Registro de usuarios con validación
- ✅ Login seguro con JWT
- ✅ Gestión de perfiles de usuario
- ✅ Modales de confirmación y bienvenida

### Sistema de usuarios
- ✅ Tres colecciones integradas: `registers`, `login`, `users`
- ✅ Perfiles completos con información personal
- ✅ Edición de datos de usuario
- ✅ Roles y permisos

### Interfaz de usuario
- ✅ Página de bienvenida personalizada
- ✅ Galería de productos
- ✅ Página de contacto
- ✅ Componentes modulares y reutilizables

## 🛠️ Tecnologías

### Frontend
- React 18
- Vite
- CSS3 con módulos
- Componentes funcionales con Hooks

### Backend
- Node.js
- Express.js
- MongoDB con MongoDB Driver
- JWT para autenticación
- bcryptjs para encriptación
- CORS para comunicación cross-origin

### Base de datos
- MongoDB Atlas
- Colecciones: `registers`, `login`, `users`, `cart`
- Validación de datos y relaciones

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Cuenta de MongoDB Atlas

### Configuración del Backend

1. Navegar al directorio backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` con las siguientes variables:
```env
PORT=8000
MONGODB_URI=tu_uri_de_mongodb_atlas
JWT_SECRET=tu_clave_secreta_jwt
NODE_ENV=development
```

4. Iniciar el servidor:
```bash
npm start
# o para desarrollo
node index.js
```

### Configuración del Frontend

1. Navegar al directorio frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## 🚀 Uso

1. **Backend**: http://localhost:8000
2. **Frontend**: http://localhost:5173

### Endpoints API

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Obtener perfil (requiere token)
- `PUT /api/auth/profile` - Actualizar perfil (requiere token)
- `GET /api/auth/test` - Verificar estado del servidor

#### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario específico

## 📁 Estructura del Proyecto

```
Linobelesa/
├── backend/
│   ├── index.js              # Servidor principal
│   ├── db.js                 # Configuración de MongoDB
│   ├── package.json          # Dependencias backend
│   ├── .env                  # Variables de entorno
│   ├── routes/
│   │   ├── auth-clean.js     # Rutas de autenticación
│   │   ├── users.js          # Rutas de usuarios
│   │   └── products.js       # Rutas de productos
│   ├── models/
│   │   ├── Usuario.js        # Modelo de usuario
│   │   ├── Categoria.js      # Modelo de categoría
│   │   └── productModel.js   # Modelo de producto
│   └── middLeware/
│       ├── autenticacion.js  # Middleware de auth
│       ├── validaciones.js   # Validaciones
│       └── manejoErrores.js  # Manejo de errores
└── frontend/
    ├── index.html            # HTML principal
    ├── package.json          # Dependencias frontend
    ├── vite.config.js        # Configuración Vite
    └── src/
        ├── main.jsx          # Punto de entrada
        ├── App.jsx           # Componente principal
        ├── components/       # Componentes reutilizables
        ├── pages/            # Páginas de la aplicación
        ├── styles/           # Estilos CSS
        └── IMG/              # Recursos gráficos
```

## 🔧 Configuración de Base de Datos

### Colecciones MongoDB

1. **registers**: Información básica de registro
   - name, lastName, email, fechaRegistro

2. **login**: Credenciales de acceso
   - email, password (encriptado), registerId, fechaCreacion

3. **users**: Perfiles completos de usuario
   - Información personal completa
   - Referencias a registers y login
   - Campos de perfil extendido

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Desarrollador Principal** - Desarrollo completo del sistema

## 🙏 Agradecimientos

- React.js community
- MongoDB Atlas
- Express.js framework
- Vite build tool