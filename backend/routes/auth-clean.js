const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const conectarDB = require('../db');

const router = express.Router();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No hay token, acceso denegado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// Ruta de test
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Rutas de autenticación funcionando correctamente' });
});

// Registro de usuario - guarda en las tres colecciones
router.post('/register', async (req, res) => {
    try {
        const { name, lastName, email, password } = req.body;

        // Validar campos requeridos
        if (!name || !lastName || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son obligatorios' 
            });
        }

        // Conectar a la base de datos
        const db = await conectarDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }
        
        // Verificar si el correo ya existe
        const usuarioExistente = await db.collection('registers').findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ 
                success: false, 
                message: 'El correo ya está registrado' 
            });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const contrasenaHash = await bcrypt.hash(password, saltRounds);

        // 1. Guardar en colección 'registers' (nombre, apellido, correo)
        const nuevoRegistro = {
            name,
            lastName,
            email,
            fechaRegistro: new Date()
        };

        const resultadoRegistro = await db.collection('registers').insertOne(nuevoRegistro);
        console.log('✅ Guardado en registers:', resultadoRegistro.insertedId);

        // 2. Guardar en colección 'login' (correo y contraseña)
        const datosLogin = {
            email,
            password: contrasenaHash,
            registerId: resultadoRegistro.insertedId,
            fechaCreacion: new Date()
        };

        const resultadoLogin = await db.collection('login').insertOne(datosLogin);
        console.log('✅ Guardado en login:', resultadoLogin.insertedId);

        // 3. Crear perfil completo en colección 'users'
        const datosUsuario = {
            _id: resultadoRegistro.insertedId, // Usar el mismo ID que registers
            name,
            lastName,
            email,
            phone: '',
            profile: {
                address: '',
                city: '',
                country: ''
            },
            role: 'customer',
            registerId: resultadoRegistro.insertedId,
            loginId: resultadoLogin.insertedId,
            fechaRegistro: new Date(),
            updatedAt: new Date()
        };

        const resultadoUser = await db.collection('users').insertOne(datosUsuario);
        console.log('✅ Guardado en users:', resultadoUser.insertedId);

        // Generar token
        const token = jwt.sign(
            { 
                userId: resultadoRegistro.insertedId,
                email: email,
                name: name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: { 
                    id: resultadoRegistro.insertedId, 
                    name, 
                    lastName, 
                    email 
                },
                token
            }
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor durante el registro' 
        });
    }
});

// Login de usuario - busca en colección 'login' y obtiene datos de 'users'
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña son obligatorios' 
            });
        }

        // Conectar a la base de datos
        const db = await conectarDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }
        
        // Buscar en colección 'login' (correo y contraseña)
        const usuarioLogin = await db.collection('login').findOne({ email });
        if (!usuarioLogin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        // Verificar contraseña
        const contrasenaValida = await bcrypt.compare(password, usuarioLogin.password);
        if (!contrasenaValida) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        // Obtener datos completos del usuario desde la colección 'users'
        const datosUsuario = await db.collection('users').findOne({ email });
        
        if (!datosUsuario) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado en el sistema' 
            });
        }
        
        // Generar token con el ID de users
        const token = jwt.sign(
            { 
                userId: datosUsuario._id,
                email: datosUsuario.email,
                name: datosUsuario.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: datosUsuario._id,
                    name: datosUsuario.name,
                    lastName: datosUsuario.lastName,
                    email: datosUsuario.email
                },
                token
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor durante el login' 
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
        console.error('❌ Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para actualizar perfil del usuario
router.put('/profile', verificarToken, async (req, res) => {
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
        console.error('❌ Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;