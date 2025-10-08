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

        // Primero intentamos encontrar al usuario en la colección 'usuarios' (admins)
        let adminActual = await db.collection('usuarios').findOne({ 
            _id: new ObjectId(req.usuario.userId) 
        });

        // Si no está en 'usuarios', buscamos en la colección 'login'
        if (!adminActual) {
            adminActual = await db.collection('login').findOne({
                _id: new ObjectId(req.usuario.userId)
            });
        }
        
        if (!adminActual) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si es admin
        if (!adminActual.isAdmin && adminActual.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Se requieren permisos de administrador'
            });
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
