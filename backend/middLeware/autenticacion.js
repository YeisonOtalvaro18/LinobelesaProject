const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectDB = require('../db');

// Middleware de verificación de token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No hay token, acceso denegado' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "linobelesa_secret");
        req.usuario = decoded;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido' 
        });
    }
};

// Middleware para verificar rol de administrador
const verificarAdmin = async (req, res, next) => {
    try {
        const db = await connectDB();
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }

        const userId = req.usuario?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }

        const idQuery = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

        // 1) Buscar admin clásico en 'usuarios'
        let adminActual = await db.collection('usuarios').findOne({ _id: idQuery });

        // 2) Buscar en 'login' (soporte legado)
        if (!adminActual) {
            adminActual = await db.collection('login').findOne({ _id: idQuery });
        }

        // 3) Como alternativa, permitir admins desde 'users' si el rol es admin
        let adminDesdeUsers = null;
        if (!adminActual) {
            adminDesdeUsers = await db.collection('users').findOne({ _id: idQuery });
            if (adminDesdeUsers) {
                let esAdmin = false;
                // Caso 3a: campo isAdmin booleano
                if (adminDesdeUsers.isAdmin === true) esAdmin = true;

                // Caso 3b: campo role string directamente
                if (adminDesdeUsers.role === 'admin') esAdmin = true;

                // Caso 3c: roleId apuntando a roles.name === 'admin'
                if (!esAdmin && adminDesdeUsers.roleId) {
                    try {
                        const roleQuery = typeof adminDesdeUsers.roleId === 'string'
                            ? (ObjectId.isValid(adminDesdeUsers.roleId) ? new ObjectId(adminDesdeUsers.roleId) : adminDesdeUsers.roleId)
                            : adminDesdeUsers.roleId;
                        const rol = await db.collection('roles').findOne({ _id: roleQuery });
                        if (rol && rol.name === 'admin') {
                            esAdmin = true;
                        }
                    } catch {}
                }

                if (esAdmin) {
                    adminActual = adminDesdeUsers;
                }
            }
        }

        if (!adminActual) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar rol admin definitivo (para los casos 1 y 2)
        if (adminActual === adminDesdeUsers) {
            // ya validado como admin arriba
        } else {
            if (!adminActual.isAdmin && adminActual.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de administrador'
                });
            }
        }

        req.usuarioAdmin = adminActual;
        next();
    } catch (error) {
        console.error('Error en verificación de admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    verificarToken,
    verificarAdmin
};
