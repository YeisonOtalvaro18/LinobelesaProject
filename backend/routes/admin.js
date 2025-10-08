const express = require('express');
const router = express.Router();
const cryptoRandomString = require('crypto-random-string');
const { sendVerificationEmail } = require('../config/email');
const Usuario = require('../models/Usuario');
const AdminVerification = require('../models/AdminVerification');
const { verificarToken } = require('../middleware/autenticacion');

// Ruta para registrar un nuevo administrador
router.post('/register-admin', verificarToken, async (req, res) => {
  try {
    // Verificar si el usuario actual es superadmin
    if (!req.usuario.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    const { email, name, lastName } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Generar token de verificación
    const token = cryptoRandomString({ length: 64, type: 'url-safe' });
    
    // Crear registro de verificación
    const verification = new AdminVerification({
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });
    await verification.save();

    // Enviar email de verificación
    const emailSent = await sendVerificationEmail(email, token);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el email de verificación'
      });
    }

    res.json({
      success: true,
      message: 'Se ha enviado un email de verificación al administrador'
    });

  } catch (error) {
    console.error('Error registrando admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para verificar token de administrador
router.post('/verify-admin', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Buscar y validar el token
    const verification = await AdminVerification.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Crear el usuario administrador
    const usuario = new Usuario({
      email: verification.email,
      password,
      role: 'admin',
      isAdmin: true,
      roleDisplayName: 'Administrador',
      permissions: ['all']
    });

    await usuario.save();

    // Marcar el token como usado
    verification.used = true;
    await verification.save();

    res.json({
      success: true,
      message: 'Cuenta de administrador verificada exitosamente'
    });

  } catch (error) {
    console.error('Error verificando admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para reenviar email de verificación
router.post('/resend-verification', verificarToken, async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario actual es superadmin
    if (!req.usuario.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    // Generar nuevo token
    const token = cryptoRandomString({ length: 64, type: 'url-safe' });
    
    // Crear nuevo registro de verificación
    const verification = new AdminVerification({
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await verification.save();

    // Enviar nuevo email
    const emailSent = await sendVerificationEmail(email, token);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el email de verificación'
      });
    }

    res.json({
      success: true,
      message: 'Se ha reenviado el email de verificación'
    });

  } catch (error) {
    console.error('Error reenviando verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;