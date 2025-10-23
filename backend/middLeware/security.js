const jwt = require('jsonwebtoken');

/**
 * Middleware para registrar acciones en el log de auditoría
 */
const auditLogger = () => (req, res, next) => next();

/**
 * Middleware para autenticación mejorada con bloqueo por intentos fallidos
 */
const enhancedAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "linobelesa_secret");
    
    // Verificar si el usuario existe y está activo
    const Usuario = require('../models/Usuario');
    const user = await Usuario.findById(decoded.userId).populate('role');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Verificar si la cuenta está bloqueada
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta temporalmente bloqueada por seguridad'
      });
    }

    req.usuario = {
      userId: user._id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin
    };

    // Actualizar último acceso
    user.lastLogin = new Date();
    await user.save();

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

/**
 * Middleware para verificar permisos específicos
 */
const requirePermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = req.usuario;
      
      // Super admin tiene acceso a todo
      if (user.isSuperAdmin) {
        return next();
      }

      // Verificar si el rol tiene el permiso requerido
      if (user.role && user.role.hasPermission) {
        if (user.role.hasPermission(module, action)) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes para esta acción'
      });

    } catch (error) {
      console.error('Error verificando permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para limitación de intentos de login
 */
const loginRateLimit = async (req, res, next) => {
  try {
    const { email } = req.body;
    const Usuario = require('../models/Usuario');
    
    const user = await Usuario.findOne({ email });
    
    if (user) {
      // Verificar si está bloqueado
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return res.status(423).json({
          success: false,
          message: 'Cuenta bloqueada temporalmente. Intente más tarde.'
        });
      }

      // Si el bloqueo ha expirado, resetear contador
      if (user.lockUntil && user.lockUntil <= Date.now()) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
      }
    }

    next();
  } catch (error) {
    console.error('Error en rate limiting:', error);
    next();
  }
};

// Funciones auxiliares
function getModelByResource(resource) {
  const models = {
    'users': require('../models/Usuario'),
    'products': require('../models/productModel'),
    'orders': require('../models/Pedido'),
    'roles': require('../models/RoleModel')
  };
  return models[resource];
}

function sanitizeBody(body) {
  if (!body) return null;
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.confirmPassword;
  return sanitized;
}

function getErrorMessage(responseBody) {
  if (typeof responseBody === 'string') {
    try {
      const parsed = JSON.parse(responseBody);
      return parsed.message || parsed.error;
    } catch {
      return responseBody;
    }
  }
  return responseBody?.message || responseBody?.error || 'Error desconocido';
}

module.exports = {
  auditLogger,
  enhancedAuth,
  requirePermission,
  loginRateLimit
};