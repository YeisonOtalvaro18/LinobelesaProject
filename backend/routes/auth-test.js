const express = require('express');
const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Las rutas de autenticación funcionan'
  });
});

module.exports = router;