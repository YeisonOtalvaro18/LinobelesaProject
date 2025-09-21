const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const conectarDB = require('../db');
const Usuario = require('../models/Usuario');

const router = express.Router();

// Middleware de autenticación
const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para validar errores
const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errores.array()
    });
  }
  next();
};

// Validaciones para registro
const validacionesRegistro = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>._]).*$/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial')
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error('La contraseña no debe contener espacios');
      }
      return true;
    })
];

// Validaciones para login
const validacionesLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Ruta de registro
router.post('/register', validacionesRegistro, manejarErroresValidacion, async (req, res) => {
  try {
    const { name, lastName, email, password } = req.body;

    // Conectar a la base de datos
    const db = await conectarDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Error de conexión a la base de datos'
      });
    }

    const usuarioModel = new Usuario(db);

    // Crear el usuario
    const nuevoUsuario = await usuarioModel.crearUsuario({
      name,
      lastName,
      email,
      password
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: nuevoUsuario._id,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role
      },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: nuevoUsuario,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.message === 'El usuario ya existe con este email') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta de login
router.post('/login', validacionesLogin, manejarErroresValidacion, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Conectar a la base de datos
    const db = await conectarDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Error de conexión a la base de datos'
      });
    }

    const usuarioModel = new Usuario(db);

    // Buscar usuario por email
    const usuario = await usuarioModel.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuarioModel.verificarPassword(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: usuario._id,
        email: usuario.email,
        role: usuario.role
      },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '24h' }
    );

    // Remover contraseña del objeto usuario
    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: usuarioSinPassword,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ruta para verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
    
    // Conectar a la base de datos
    const db = await conectarDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Error de conexión a la base de datos'
      });
    }

    const usuarioModel = new Usuario(db);
    const usuario = await usuarioModel.buscarPorId(decoded.userId);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    res.json({
      success: true,
      data: {
        user: usuario
      }
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Ruta para obtener perfil del usuario
router.get('/profile', verificarToken, async (req, res) => {
  try {
    const db = await conectarDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Error de conexión a la base de datos'
      });
    }

    const { ObjectId } = require('mongodb');
    const usersCollection = db.collection('users');
    
    // Buscar usuario por ID en la colección users
    const usuario = await usersCollection.findOne({ 
      _id: new ObjectId(req.usuario.userId) 
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Remover información sensible
    const { password, ...usuarioSinPassword } = usuario;

    res.json({
      success: true,
      data: {
        user: usuarioSinPassword
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para actualizar perfil del usuario
router.put('/profile', verificarToken, [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('lastName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Número de teléfono inválido'),
  body('profile.firstName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('profile.lastName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida'),
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Género inválido')
], manejarErroresValidacion, async (req, res) => {
  try {
    const db = await conectarDB();
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Error de conexión a la base de datos'
      });
    }

    const { ObjectId } = require('mongodb');
    const usersCollection = db.collection('users');
    
    // Verificar si el usuario existe
    const usuarioExistente = await usersCollection.findOne({ 
      _id: new ObjectId(req.usuario.userId) 
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (req.body.email && req.body.email !== usuarioExistente.email) {
      const emailExistente = await usersCollection.findOne({ 
        email: req.body.email,
        _id: { $ne: new ObjectId(req.usuario.userId) }
      });

      if (emailExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        });
      }
    }

    // Preparar datos de actualización
    const datosActualizacion = {
      updatedAt: new Date()
    };

    // Actualizar campos principales si se proporcionan
    if (req.body.name) datosActualizacion.name = req.body.name;
    if (req.body.lastName) datosActualizacion.lastName = req.body.lastName;
    if (req.body.email) datosActualizacion.email = req.body.email;
    if (req.body.phone) datosActualizacion.phone = req.body.phone;

    // Actualizar perfil si se proporciona
    if (req.body.profile) {
      datosActualizacion.profile = {
        ...usuarioExistente.profile,
        ...req.body.profile
      };
    }

    // Actualizar en la base de datos
    const resultado = await usersCollection.updateOne(
      { _id: new ObjectId(req.usuario.userId) },
      { $set: datosActualizacion }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener el usuario actualizado
    const usuarioActualizado = await usersCollection.findOne({ 
      _id: new ObjectId(req.usuario.userId) 
    });

    // Remover información sensible
    const { password, ...usuarioSinPassword } = usuarioActualizado;

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: usuarioSinPassword
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
