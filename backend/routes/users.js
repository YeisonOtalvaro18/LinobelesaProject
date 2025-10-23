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

// Ruta para obtener usuario por ID para el propio usuario (sin requerir admin)
// Si el id solicitado coincide con el del token, permite el acceso; en otro caso pasa al siguiente handler (admin)
router.get('/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const tokenUserId = req.usuario?.userId?.toString();

        if (tokenUserId !== id) {
            return next(); // No es el propio usuario, continuar al handler que requiere admin
        }

        const db = await connectDB();
        if (!db) {
            return res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
        }

        const orQueries = [];
        if (ObjectId.isValid(id)) {
            orQueries.push({ _id: new ObjectId(id) });
        }
        orQueries.push({ _id: id });
        orQueries.push({ registerId: id });
        orQueries.push({ loginId: id });

        const usuario = await db.collection('users').findOne({ $or: orQueries });
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Obtener rol si existe
        let rol = null;
        if (usuario.roleId) {
            try {
                const roleQuery = typeof usuario.roleId === 'string' ? new ObjectId(usuario.roleId) : usuario.roleId;
                rol = await db.collection('roles').findOne({ _id: roleQuery });
            } catch {}
        }

        const respuesta = {
            id: usuario._id.toString(),
            nombre: usuario.firstName || usuario.name?.split(' ')[0] || '',
            apellidos: usuario.lastName || usuario.name?.split(' ').slice(1).join(' ') || '',
            email: usuario.email,
            telefono: usuario.phone || '',
            municipio: usuario.profile?.municipio || usuario.municipio || '',
            departamento: usuario.profile?.departamento || usuario.departamento || '',
            rol: rol ? rol.displayName : 'Cliente',
            activo: usuario.status !== 'inactive',
            fechaRegistro: usuario.createdAt || usuario.createdDate || new Date()
        };

        res.json(respuesta);
    } catch (error) {
        console.error('Error obteniendo propio usuario por ID:', error);
        next(error);
    }
});

// Ruta para obtener usuario por ID (solo admin)
router.get('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' });
        }

        // Construir consultas de búsqueda posibles
        const orQueries = [];
        if (ObjectId.isValid(id)) {
            orQueries.push({ _id: new ObjectId(id) });
        }
        // Fallbacks: _id guardado como string, o IDs alternativos usados en el sistema
        orQueries.push({ _id: id });
        orQueries.push({ registerId: id });
        orQueries.push({ loginId: id });

        const usuario = await db.collection('users').findOne({ $or: orQueries });
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Obtener rol si existe
        let rol = null;
        if (usuario.roleId) {
            try {
                const roleQuery = typeof usuario.roleId === 'string' ? new ObjectId(usuario.roleId) : usuario.roleId;
                rol = await db.collection('roles').findOne({ _id: roleQuery });
            } catch {}
        }

        const respuesta = {
            id: usuario._id.toString(),
            nombre: usuario.firstName || usuario.name?.split(' ')[0] || '',
            apellidos: usuario.lastName || usuario.name?.split(' ').slice(1).join(' ') || '',
            email: usuario.email,
            telefono: usuario.phone || '',
            rol: rol ? rol.displayName : 'Cliente',
            activo: usuario.status !== 'inactive',
            fechaRegistro: usuario.createdAt || usuario.createdDate || new Date()
        };

        res.json(respuesta);
    } catch (error) {
        console.error('Error obteniendo usuario por ID:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
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
        console.log(`🗑️ DELETE request received for user ID: ${id}`);
        console.log(`👤 Request from user: ${req.usuario?.userId} (${req.usuario?.email})`);
        
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        // Ya pasó por verificarAdmin, usamos el admin validado
        const adminActual = req.usuarioAdmin;
        if (!adminActual) {
            console.log('❌ Admin context missing after verificarAdmin');
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
        }

        console.log(`✅ Admin access confirmed for user: ${adminActual.email || adminActual.name || adminActual._id}`);

        // Construir consulta tolerante para encontrar al usuario (ObjectId o string)
        const orQueries = [];
        if (ObjectId.isValid(id)) {
            orQueries.push({ _id: new ObjectId(id) });
        }
        orQueries.push({ _id: id });

        // Obtener información del usuario antes de eliminarlo (para el log)
        const usuarioAEliminar = await db.collection('users').findOne({ $or: orQueries });

        if (!usuarioAEliminar) {
            console.log(`❌ User to delete not found: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log(`🎯 User found for deletion: ${usuarioAEliminar.email} (${usuarioAEliminar._id})`);

        // Eliminar usuario
        // Eliminar por el _id real del documento encontrado para evitar problemas de tipo
        console.log(`🗑️ Attempting to delete user with real _id: ${usuarioAEliminar._id}`);
        const result = await db.collection('users').deleteOne({ _id: usuarioAEliminar._id });

        console.log(`📊 Delete result:`, {
            acknowledged: result.acknowledged,
            deletedCount: result.deletedCount
        });

        if (result.deletedCount === 0) {
            console.log(`❌ No user was deleted. ID might not exist: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log(`✅ User successfully deleted: ${usuarioAEliminar.email}`);

        // Auditoría desactivada

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando usuario:', error);
        
        // Auditoría desactivada

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
        const orQueries = [];
        if (ObjectId.isValid(id)) orQueries.push({ _id: new ObjectId(id) });
        orQueries.push({ _id: id });
        const usuarioExistente = await db.collection('users').findOne({ $or: orQueries });

        if (!usuarioExistente) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Preparar valores anteriores para el log de auditoría
        const oldValues = {
            nombre: usuarioExistente.firstName || usuarioExistente.name?.split(' ')[0] || '',
            apellidos: usuarioExistente.lastName || usuarioExistente.name?.split(' ').slice(1).join(' ') || '',
            email: usuarioExistente.email,
            telefono: usuarioExistente.phone || '',
            activo: usuarioExistente.status !== 'inactive'
        };

        // Obtener rol anterior
        let rolAnterior = 'Cliente';
        if (usuarioExistente.roleId) {
            const rolDoc = await db.collection('roles').findOne({ 
                _id: new ObjectId(usuarioExistente.roleId) 
            });
            if (rolDoc) {
                rolAnterior = rolDoc.displayName;
            }
        }
        oldValues.rol = rolAnterior;

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
            { _id: usuarioExistente._id },
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
            _id: usuarioExistente._id 
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

        // Auditoría desactivada

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            usuario: respuesta
        });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        
        // Auditoría desactivada

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

        // Obtener información del usuario antes del cambio de estado
        const orQueries = [];
        if (ObjectId.isValid(id)) orQueries.push({ _id: new ObjectId(id) });
        orQueries.push({ _id: id });
        const usuarioTarget = await db.collection('users').findOne({ $or: orQueries });

        if (!usuarioTarget) {
            // Búsqueda extendida: por registerId y loginId
            const usuarioPorRegistro = await db.collection('users').findOne({ registerId: id });
            const usuarioPorLogin = await db.collection('users').findOne({ loginId: id });
            if (usuarioPorRegistro) {
                console.log(`[BACKEND] [PUT /api/users/:id/status] Usuario encontrado por registerId. id recibido:`, id, '| id en BD:', usuarioPorRegistro._id, '| email:', usuarioPorRegistro.email);
                usuarioTarget = usuarioPorRegistro;
            } else if (usuarioPorLogin) {
                console.log(`[BACKEND] [PUT /api/users/:id/status] Usuario encontrado por loginId. id recibido:`, id, '| id en BD:', usuarioPorLogin._id, '| email:', usuarioPorLogin.email);
                usuarioTarget = usuarioPorLogin;
            }
        }
        if (!usuarioTarget) {
            console.log(`[BACKEND] [PUT /api/users/:id/status] Usuario no encontrado para id recibido:`, id);
            return res.status(404).json({
                success: false,
                message: `Usuario no encontrado para id: ${id}`
            });
        } else {
            console.log(`[BACKEND] [PUT /api/users/:id/status] Usuario encontrado. id recibido:`, id, '| id en BD:', usuarioTarget._id, '| email:', usuarioTarget.email);
        }

        const estadoAnterior = usuarioTarget.status !== 'inactive';

        // Actualizar estado del usuario
        const result = await db.collection('users').updateOne(
            { _id: usuarioTarget._id },
            { $set: { status: activo ? 'active' : 'inactive' } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Auditoría desactivada

        res.json({
            success: true,
            message: 'Estado del usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando estado del usuario:', error);
        
        // Auditoría desactivada

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

// Ruta para activar cuenta
router.get('/activate', async (req, res) => {
    const db = await connectDB();
    const users = db.collection('users');
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token de activación requerido' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await users.findOne({ email: payload.email });
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        if (user.status === 'active') return res.json({ success: true, message: 'La cuenta ya está activada' });
        await users.updateOne({ email: payload.email }, { $set: { status: 'active' } });
        res.json({ success: true, message: 'Cuenta activada correctamente' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }
});

// Ruta de auditoría eliminada

module.exports = router;
