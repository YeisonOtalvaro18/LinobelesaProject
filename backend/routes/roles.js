const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

// Datos simulados de roles hasta implementar la base de datos completa
const mockRoles = [
  {
    id: '1',
    name: 'super-admin',
    displayName: 'Super Administrador',
    description: 'Acceso completo al sistema',
    level: 10,
    permissions: ['all']
  },
  {
    id: '2', 
    name: 'admin',
    displayName: 'Administrador',
    description: 'Administrador general',
    level: 8,
    permissions: ['users', 'products', 'orders', 'dashboard']
  },
  {
    id: '3',
    name: 'manager',
    displayName: 'Gerente',
    description: 'Gestión de productos e inventario',
    level: 6,
    permissions: ['products', 'orders', 'dashboard']
  },
  {
    id: '4',
    name: 'moderator',
    displayName: 'Moderador',
    description: 'Moderación de contenido',
    level: 4,
    permissions: ['reviews', 'users:read', 'dashboard']
  }
];

// Obtener todos los roles
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockRoles
    });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear nuevo rol
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, permissions = [], level = 1 } = req.body;

    if (!nombre || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y descripción son obligatorios'
      });
    }

    // Verificar si ya existe
    const existingRole = mockRoles.find(role => 
      role.name === nombre.toLowerCase().replace(/\s+/g, '-')
    );

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      });
    }

    const newRole = {
      id: (mockRoles.length + 1).toString(),
      name: nombre.toLowerCase().replace(/\s+/g, '-'),
      displayName: nombre,
      description: descripcion,
      level,
      permissions
    };

    mockRoles.push(newRole);

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: newRole
    });

  } catch (error) {
    console.error('Error creando rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar rol
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, descripcion, permissions, level } = req.body;

    const roleIndex = mockRoles.findIndex(role => role.id === id);
    
    if (roleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    const role = mockRoles[roleIndex];

    // No permitir editar roles del sistema
    if (role.name === 'super-admin' || role.name === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se pueden modificar roles del sistema'
      });
    }

    // Actualizar campos
    if (displayName) role.displayName = displayName;
    if (descripcion) role.description = descripcion;
    if (permissions) role.permissions = permissions;
    if (level) role.level = level;

    mockRoles[roleIndex] = role;

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: role
    });

  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Eliminar rol
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const roleIndex = mockRoles.findIndex(role => role.id === id);
    
    if (roleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    const role = mockRoles[roleIndex];

    // No permitir eliminar roles del sistema
    if (role.name === 'super-admin' || role.name === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No se pueden eliminar roles del sistema'
      });
    }

    mockRoles.splice(roleIndex, 1);

    res.json({
      success: true,
      message: 'Rol eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;