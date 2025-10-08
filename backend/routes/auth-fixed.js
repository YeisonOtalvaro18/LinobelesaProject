const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
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

// Ruta de login - funciona con la estructura correcta de BD
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
        
        console.log("=== DEBUG LOGIN ===");
        console.log("Email buscado:", email);
        
        // Primero buscar en la colección de usuarios (admins)
        let usuario = await db.collection('usuarios').findOne({ email });
        let isAdmin = true;
        
        // Si no se encuentra, buscar en la colección de users (clientes)
        if (!usuario) {
            usuario = await db.collection('users').findOne({ email });
            isAdmin = false;
        }
        
        console.log("Usuario encontrado:", usuario ? `Sí, en ${isAdmin ? 'usuarios (admin)' : 'users (cliente)'}` : "No");
        
        if (!usuario) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        // Verificar usuario
        if (!usuario) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }
        
        // Si es admin, la estructura es diferente
        if (isAdmin) {
            usuario.status = 'active';  // Los admins siempre están activos
            usuario.roleId = null;      // Los admins no usan roleId
        } else if (!usuario.status || !usuario.roleId) {
            console.log("⚠️  Usuario con estructura incompleta:", usuario.email);
            return res.status(400).json({ 
                success: false, 
                message: 'Usuario con estructura incompleta. Contacte al administrador.' 
            });
        }

        // Verificar contraseña
        console.log("- Password recibido:", password ? "Sí" : "No");
        console.log("- Usuario password hash:", usuario.password ? "Sí" : "No");
        
        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: 'La contraseña es obligatoria' 
            });
        }
        
        if (!usuario.password) {
            console.log("❌ Usuario sin password hasheado");
            return res.status(400).json({ 
                success: false, 
                message: 'Usuario con datos incompletos. Contacte al administrador.' 
            });
        }
        
        const contrasenaValida = await bcrypt.compare(password, usuario.password);
        if (!contrasenaValida) {
            return res.status(400).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }

        // Obtener información del rol
        let roleQuery, rol = null;
        
        try {
            if (usuario.roleId) {
                // Verificar si roleId es string o ya es ObjectId
                if (typeof usuario.roleId === 'string') {
                    roleQuery = new ObjectId(usuario.roleId);
                } else if (usuario.roleId instanceof ObjectId) {
                    roleQuery = usuario.roleId;
                } else {
                    console.log("⚠️  Tipo de roleId no reconocido:", typeof usuario.roleId);
                    roleQuery = usuario.roleId;
                }
                
                rol = await db.collection('roles').findOne({ _id: roleQuery });
            }
        } catch (error) {
            console.log("❌ Error obteniendo rol:", error.message);
            rol = null;
        }
        
        console.log("- Usuario roleId:", usuario.roleId);
        console.log("- Query usado:", roleQuery);
        console.log("- Rol encontrado:", rol ? rol.name : "No encontrado");

        // Preparar datos del usuario para el frontend
        const userData = {
            _id: usuario._id,
            name: usuario.name,
            email: usuario.email,
            role: isAdmin ? 'admin' : (rol ? rol.name : 'customer'),
            roleDisplayName: isAdmin ? 'Administrador' : (rol ? rol.displayName : 'Cliente'),
            isAdmin: isAdmin,
            permissions: isAdmin ? ['all'] : (rol ? rol.permissions : []),
            profile: usuario.profile || {},
            status: usuario.status || 'active'
        };
        
        // Generar token
        const token = jwt.sign(
            { 
                userId: usuario._id,
                email: usuario.email,
                role: userData.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log("✅ Login exitoso para:", email);
        console.log("- Role:", userData.role);
        console.log("- IsAdmin:", userData.isAdmin);
        
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: userData,
                token
            }
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Ruta de registro
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

        // Verificar si el usuario ya existe
        const usuarioExistente = await db.collection('users').findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ 
                success: false, 
                message: 'El usuario ya existe con este email' 
            });
        }

        // Hashear la contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Obtener rol por defecto (customer)
        const rolCustomer = await db.collection('roles').findOne({ name: 'customer' });
        if (!rolCustomer) {
            // Crear rol customer si no existe
            const result = await db.collection('roles').insertOne({
                name: 'customer',
                displayName: 'Cliente',
                permissions: [{
                    resource: 'orders',
                    actions: ['create', 'read']
                }],
                description: 'Cliente del sistema con permisos básicos',
                isActive: true,
                createdAt: new Date()
            });
            rolCustomer = { _id: result.insertedId, name: 'customer', displayName: 'Cliente' };
        }

        // Crear el usuario
        const nuevoUsuario = {
            name: `${name} ${lastName}`,
            email: email,
            password: hashedPassword,
            phone: '',
            roleId: rolCustomer._id,
            status: 'active',
            profile: {
                firstName: name,
                lastName: lastName,
                dateOfBirth: null,
                gender: 'other'
            },
            addresses: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('users').insertOne(nuevoUsuario);
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                userId: result.insertedId,
                email: nuevoUsuario.email,
                role: rolCustomer.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Preparar datos para respuesta
        const userData = {
            _id: result.insertedId,
            name: nuevoUsuario.name,
            email: nuevoUsuario.email,
            role: rolCustomer.name,
            roleDisplayName: rolCustomer.displayName,
            isAdmin: false,
            permissions: rolCustomer.permissions || [],
            profile: nuevoUsuario.profile,
            status: nuevoUsuario.status
        };

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: userData,
                token
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para verificar token
router.get('/verify', verificarToken, async (req, res) => {
    try {
        const db = await conectarDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        console.log('=== DEBUG VERIFY ===');
        console.log('Token decodificado:', req.usuario);

        // Primero buscar en la colección de usuarios (admins)
        let usuario = await db.collection('usuarios').findOne({ 
            _id: new ObjectId(req.usuario.userId) 
        });
        let isAdmin = true;

        // Si no se encuentra, buscar en la colección de users (clientes)
        if (!usuario) {
            usuario = await db.collection('users').findOne({ 
                _id: new ObjectId(req.usuario.userId) 
            });
            isAdmin = false;
        }

        console.log('Usuario encontrado en:', isAdmin ? 'usuarios (admin)' : 'users (cliente)');

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Para admins, no necesitamos buscar rol
        let rol = null;
        if (!isAdmin) {
            try {
                if (usuario.roleId) {
                    const roleQuery = (typeof usuario.roleId === 'string') 
                        ? new ObjectId(usuario.roleId) 
                        : usuario.roleId;
                    rol = await db.collection('roles').findOne({ _id: roleQuery });
                }
            } catch (error) {
                console.log("❌ Error obteniendo rol en verify:", error.message);
            }
        }

        const userData = {
            _id: usuario._id,
            name: usuario.name,
            email: usuario.email,
            role: isAdmin ? 'admin' : (rol ? rol.name : 'customer'),
            roleDisplayName: isAdmin ? 'Administrador' : (rol ? rol.displayName : 'Cliente'),
            isAdmin: isAdmin,
            permissions: isAdmin ? ['all'] : (rol ? rol.permissions : []),
            profile: usuario.profile || {},
            status: usuario.status || 'active'
        };

        res.json({
            success: true,
            data: {
                user: userData
            }
        });

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para obtener perfil de usuario
router.get('/profile', verificarToken, async (req, res) => {
    try {
        const db = await conectarDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        const usuario = await db.collection('users').findOne({ 
            _id: new ObjectId(req.usuario.userId) 
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Obtener rol actualizado
        let rol = null;
        try {
            if (usuario.roleId) {
                const roleQuery = (typeof usuario.roleId === 'string') 
                    ? new ObjectId(usuario.roleId) 
                    : usuario.roleId;
                rol = await db.collection('roles').findOne({ _id: roleQuery });
            }
        } catch (error) {
            console.log("❌ Error obteniendo rol:", error.message);
        }

        const profileData = {
            _id: usuario._id,
            name: usuario.name,
            email: usuario.email,
            phone: usuario.phone || '',
            role: rol ? rol.name : 'customer',
            roleDisplayName: rol ? rol.displayName : 'Cliente',
            profile: usuario.profile || {},
            addresses: usuario.addresses || [],
            status: usuario.status,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt
        };

        console.log('=== DEBUG PROFILE ===');
        console.log('Usuario encontrado:', usuario.email);
        console.log('ProfileData:', JSON.stringify(profileData, null, 2));

        res.json({
            success: true,
            data: {
                user: profileData
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

// Ruta para actualizar perfil de usuario
router.put('/profile', verificarToken, async (req, res) => {
    try {
        const { name, phone, profile, addresses } = req.body;
        
        const db = await conectarDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Preparar campos a actualizar
        const updateFields = {
            updatedAt: new Date()
        };

        if (name) updateFields.name = name;
        if (phone !== undefined) updateFields.phone = phone;
        if (profile) updateFields.profile = profile;
        if (addresses) updateFields.addresses = addresses;

        // Actualizar usuario
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.usuario.userId) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o sin cambios'
            });
        }

        // Obtener usuario actualizado
        const usuarioActualizado = await db.collection('users').findOne({ 
            _id: new ObjectId(req.usuario.userId) 
        });

        // Obtener rol
        let rol = null;
        try {
            if (usuarioActualizado.roleId) {
                const roleQuery = (typeof usuarioActualizado.roleId === 'string') 
                    ? new ObjectId(usuarioActualizado.roleId) 
                    : usuarioActualizado.roleId;
                rol = await db.collection('roles').findOne({ _id: roleQuery });
            }
        } catch (error) {
            console.log("❌ Error obteniendo rol:", error.message);
        }

        const profileData = {
            _id: usuarioActualizado._id,
            name: usuarioActualizado.name,
            email: usuarioActualizado.email,
            phone: usuarioActualizado.phone || '',
            role: rol ? rol.name : 'customer',
            roleDisplayName: rol ? rol.displayName : 'Cliente',
            profile: usuarioActualizado.profile || {},
            addresses: usuarioActualizado.addresses || [],
            status: usuarioActualizado.status,
            createdAt: usuarioActualizado.createdAt,
            updatedAt: usuarioActualizado.updatedAt
        };

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                user: profileData
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