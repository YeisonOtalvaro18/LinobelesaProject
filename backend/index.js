require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { verificarToken, verificarAdmin } = require('./middleware/autenticacion');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth-fixed');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 8000;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración de headers de seguridad
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:8000");
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ruta de prueba en la raíz
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.use('/api/products', productRoutes);
console.log('Configurando rutas de usuarios...');
app.use('/api/users', userRoutes);
console.log('Rutas de usuarios configuradas');
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Conectar a la base de datos
connectDB();

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo no manejado en:', promise, 'razón:', reason);
  process.exit(1);
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});
