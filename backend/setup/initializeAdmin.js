const Role = require('../models/RoleModel');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

const initializeDefaultRoles = async () => {
  try {
    console.log('🔧 Inicializando roles por defecto...');

    // Verificar si ya existen roles
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      console.log('✅ Los roles ya están inicializados');
      return;
    }

    // Crear roles por defecto
    const defaultRoles = [
      {
        name: 'super-admin',
        displayName: 'Super Administrador',
        description: 'Acceso completo al sistema con permisos para gestionar otros administradores',
        permissions: [
          { module: 'all', actions: ['all'] }
        ],
        level: 10,
        isSystem: true
      },
      {
        name: 'admin',
        displayName: 'Administrador',
        description: 'Administrador general con acceso a la mayoría de funciones',
        permissions: [
          { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'orders', actions: ['read', 'update', 'delete'] },
          { module: 'reviews', actions: ['read', 'update', 'delete'] },
          { module: 'dashboard', actions: ['read'] },
          { module: 'analytics', actions: ['read'] }
        ],
        level: 8,
        isSystem: true
      },
      {
        name: 'manager',
        displayName: 'Gerente',
        description: 'Acceso a gestión de productos e inventario',
        permissions: [
          { module: 'products', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'orders', actions: ['read', 'update'] },
          { module: 'dashboard', actions: ['read'] },
          { module: 'analytics', actions: ['read'] }
        ],
        level: 6,
        isSystem: true
      },
      {
        name: 'moderator',
        displayName: 'Moderador',
        description: 'Moderación de contenido y atención al cliente',
        permissions: [
          { module: 'reviews', actions: ['read', 'update', 'delete'] },
          { module: 'users', actions: ['read', 'update'] },
          { module: 'orders', actions: ['read'] },
          { module: 'dashboard', actions: ['read'] }
        ],
        level: 4,
        isSystem: true
      },
      {
        name: 'support',
        displayName: 'Soporte',
        description: 'Atención al cliente y soporte técnico básico',
        permissions: [
          { module: 'users', actions: ['read'] },
          { module: 'orders', actions: ['read'] },
          { module: 'dashboard', actions: ['read'] }
        ],
        level: 2,
        isSystem: true
      },
      {
        name: 'customer',
        displayName: 'Cliente',
        description: 'Usuario regular del sistema',
        permissions: [
          { module: 'products', actions: ['read'] },
          { module: 'reviews', actions: ['create', 'read', 'update'] }
        ],
        level: 1,
        isSystem: true
      }
    ];

    // Crear los roles
    for (const roleData of defaultRoles) {
      const role = new Role(roleData);
      await role.save();
      console.log(`✅ Rol creado: ${role.displayName}`);
    }

    console.log('🎉 Roles por defecto creados exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error inicializando roles:', error);
    return false;
  }
};

const createSuperAdmin = async () => {
  try {
    console.log('👑 Verificando super administrador...');

    // Verificar si ya existe un super admin
    const existingSuperAdmin = await Usuario.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      console.log('✅ Ya existe un super administrador');
      return;
    }

    // Buscar el rol de super admin
    const superAdminRole = await Role.findOne({ name: 'super-admin' });
    if (!superAdminRole) {
      console.log('❌ Rol de super admin no encontrado');
      return false;
    }

    // Crear super admin por defecto
    const defaultPassword = 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    const superAdmin = new Usuario({
      name: 'Super',
      lastName: 'Administrador',
      email: 'admin@linobelesa.com',
      password: hashedPassword,
      role: superAdminRole._id,
      isAdmin: true,
      isSuperAdmin: true,
      emailVerified: true,
      isActive: true
    });

    await superAdmin.save();

    console.log('👑 Super Administrador creado:');
    console.log(`   Email: admin@linobelesa.com`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE');

    return true;

  } catch (error) {
    console.error('❌ Error creando super administrador:', error);
    return false;
  }
};

const initializeAdminSystem = async () => {
  try {
    console.log('🚀 Inicializando sistema de administración...');

    const rolesCreated = await initializeDefaultRoles();
    if (rolesCreated) {
      await createSuperAdmin();
    }

    console.log('✨ Sistema de administración inicializado');

  } catch (error) {
    console.error('❌ Error inicializando sistema de administración:', error);
  }
};

module.exports = {
  initializeDefaultRoles,
  createSuperAdmin,
  initializeAdminSystem
};