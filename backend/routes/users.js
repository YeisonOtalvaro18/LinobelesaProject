const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const User = require('../models/User'); // Importar el modelo de usuario
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

console.log('Cargando módulo de rutas de usuarios...'); // Debug log

// Rutas de prueba
router.get('/test', (req, res) => {
    console.log('Accediendo a ruta de prueba /test');
    res.json({ message: 'La ruta de usuarios está funcionando' });
});

// Ruta de prueba con auth
router.get('/test-auth', verificarToken, (req, res) => {
    console.log('Accediendo a ruta de prueba con auth /test-auth');
    res.json({ message: 'Autenticación funcionando', user: req.usuario });
});

// Ruta de prueba para verificar que el router funciona
router.get('/test', (req, res) => {
  res.json({ message: 'Ruta de usuarios funcionando' });
});

// Ruta para obtener todos los usuarios (solo admin)
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Obtener todos los usuarios regulares (de la colección users)
        const usuarios = await db.collection('users').find({}).toArray();
        
        const usuariosConRoles = await Promise.all(usuarios.map(async (usuario) => {
            let rol = null;
            if (usuario.roleId) {
                try {
                    rol = await db.collection('roles').findOne({ 
                        _id: new ObjectId(usuario.roleId) 
                    });
                } catch (error) {
                    console.log("Error obteniendo rol para usuario:", usuario.email);
                }
            }

            // Separar nombre y apellidos correctamente
            const nombreCompleto = usuario.name || '';
            const firstName = usuario.firstName || nombreCompleto.split(' ')[0] || '';
            const lastName = usuario.lastName || nombreCompleto.split(' ').slice(1).join(' ') || '';

            return {
                id: usuario._id.toString(),
                nombre: firstName,
                apellidos: lastName,
                email: usuario.email,
                telefono: usuario.phone || '',
                rol: rol ? rol.displayName : 'Cliente',
                activo: usuario.status !== 'inactive',
                fechaRegistro: usuario.createdAt || usuario.createdDate || new Date()
            };
        }));

        res.json(usuariosConRoles);

    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para crear nuevo usuario (admin)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { nombre, apellidos, email, telefono, rol, activo, password } = req.body;
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Validar campos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son campos obligatorios'
            });
        }

        // Verificar si el email ya existe
        const emailExistente = await db.collection('users').findOne({ email });
        if (emailExistente) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Preparar datos del usuario
        const nuevoUsuario = {
            firstName: nombre,
            lastName: apellidos || '',
            name: `${nombre} ${apellidos || ''}`.trim(),
            email,
            phone: telefono || '',
            password: hashedPassword,
            status: activo !== false ? 'active' : 'inactive',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Si se especifica un rol, obtener roleId
        if (rol && rol !== 'Cliente') {
            const rolDoc = await db.collection('roles').findOne({ displayName: rol });
            if (rolDoc) {
                nuevoUsuario.roleId = rolDoc._id.toString();
            }
        }

        // Insertar usuario
        const resultado = await db.collection('users').insertOne(nuevoUsuario);

        // Obtener rol para la respuesta
        let rolRespuesta = null;
        if (nuevoUsuario.roleId) {
            rolRespuesta = await db.collection('roles').findOne({ 
                _id: new ObjectId(nuevoUsuario.roleId) 
            });
        }

        const respuesta = {
            id: resultado.insertedId.toString(),
            nombre: nuevoUsuario.firstName,
            apellidos: nuevoUsuario.lastName,
            email: nuevoUsuario.email,
            telefono: nuevoUsuario.phone,
            rol: rolRespuesta ? rolRespuesta.displayName : 'Cliente',
            activo: nuevoUsuario.status !== 'inactive',
            fechaRegistro: nuevoUsuario.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            usuario: respuesta
        });

    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

router.post('/register', async (req, res) => {
  const db = await connectDB();
  const users = db.collection('users');
  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: "Campos obligatorios" });

  const exists = await users.findOne({ email });
  if (exists) return res.status(409).json({ error: "Correo ya registrado" });

  const hashed = await bcrypt.hash(password, 10);
  await users.insertOne({ name, email, password: hashed, createdAt: new Date() });

  res.json({ success: true });
});


router.post('/login', async (req, res) => {
  const db = await connectDB();
  const users = db.collection('users');
  const { email, password } = req.body;

  const user = await users.findOne({ email });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign({ userId: user._id, name: user.name }, "linobelesa_secret", { expiresIn: "2h" });
  res.json({ success: true, token });
});

// Ruta para eliminar usuario
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Verificar si el usuario es admin
        const usuarioActual = await db.collection('users').findOne({ 
            _id: new ObjectId(req.usuario.userId) 
        });
        
        if (!usuarioActual) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar rol de admin
        let isAdmin = false;
        if (usuarioActual.roleId) {
            const rol = await db.collection('roles').findOne({ 
                _id: new ObjectId(usuarioActual.roleId) 
            });
            isAdmin = rol && rol.name === 'admin';
        }

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }

        // Eliminar usuario
        const result = await db.collection('users').deleteOne({ 
            _id: new ObjectId(id) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para actualizar usuario completo
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellidos, email, telefono, rol, activo } = req.body;
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Verificar si el usuario existe
        const usuarioExistente = await db.collection('users').findOne({ 
            _id: new ObjectId(id) 
        });

        if (!usuarioExistente) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Preparar campos para actualizar
        const updateFields = {
            updatedAt: new Date()
        };

        if (nombre !== undefined) {
            updateFields.firstName = nombre;
            updateFields.name = `${nombre} ${apellidos || usuarioExistente.lastName || ''}`.trim();
        }
        if (apellidos !== undefined) {
            updateFields.lastName = apellidos;
            updateFields.name = `${nombre || usuarioExistente.firstName || ''} ${apellidos}`.trim();
        }
        if (email !== undefined) updateFields.email = email;
        if (telefono !== undefined) updateFields.phone = telefono;
        if (activo !== undefined) updateFields.status = activo ? 'active' : 'inactive';

        // Si se especifica un rol, actualizar roleId
        if (rol !== undefined && rol !== 'Cliente') {
            const rolDoc = await db.collection('roles').findOne({ displayName: rol });
            if (rolDoc) {
                updateFields.roleId = rolDoc._id.toString();
            }
        } else if (rol === 'Cliente') {
            updateFields.roleId = null;
        }

        // Actualizar usuario
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Obtener usuario actualizado
        const usuarioActualizado = await db.collection('users').findOne({ 
            _id: new ObjectId(id) 
        });

        // Obtener rol actualizado
        let rolActualizado = null;
        if (usuarioActualizado.roleId) {
            rolActualizado = await db.collection('roles').findOne({ 
                _id: new ObjectId(usuarioActualizado.roleId) 
            });
        }

        const respuesta = {
            id: usuarioActualizado._id.toString(),
            nombre: usuarioActualizado.firstName || usuarioActualizado.name?.split(' ')[0] || '',
            apellidos: usuarioActualizado.lastName || usuarioActualizado.name?.split(' ').slice(1).join(' ') || '',
            email: usuarioActualizado.email,
            telefono: usuarioActualizado.phone || '',
            rol: rolActualizado ? rolActualizado.displayName : 'Cliente',
            activo: usuarioActualizado.status !== 'inactive',
            fechaRegistro: usuarioActualizado.createdAt || usuarioActualizado.createdDate || new Date()
        };

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            usuario: respuesta
        });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para cambiar estado del usuario
router.put('/:id/status', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Verificar si el usuario es admin
        const usuarioActual = await db.collection('users').findOne({ 
            _id: new ObjectId(req.usuario.userId) 
        });
        
        if (!usuarioActual) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar rol de admin
        let isAdmin = false;
        if (usuarioActual.roleId) {
            const rol = await db.collection('roles').findOne({ 
                _id: new ObjectId(usuarioActual.roleId) 
            });
            isAdmin = rol && rol.name === 'admin';
        }

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }

        // Actualizar estado del usuario
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: activo ? 'active' : 'inactive' } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estado del usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando estado del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Ruta para actualizar campos específicos del perfil
router.patch('/:id/profile', async (req, res) => {
    try {
        const { id } = req.params;
        const { address, city, country, firstName, lastName, dateOfBirth, gender } = req.body;

        const updateFields = {};
        if (address !== undefined) updateFields['profile.address'] = address;
        if (city !== undefined) updateFields['profile.city'] = city;
        if (country !== undefined) updateFields['profile.country'] = country;
        if (firstName !== undefined) updateFields['profile.firstName'] = firstName;
        if (lastName !== undefined) updateFields['profile.lastName'] = lastName;
        if (dateOfBirth !== undefined) updateFields['profile.dateOfBirth'] = dateOfBirth;
        if (gender !== undefined) updateFields['profile.gender'] = gender;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para actualizar solo datos de dirección
router.patch('/:id/address', async (req, res) => {
    try {
        const { id } = req.params;
        const { address, city, country } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    'profile.address': address,
                    'profile.city': city,
                    'profile.country': country
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
