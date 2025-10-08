const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    module: {
      type: String,
      required: true,
      enum: ['users', 'products', 'orders', 'reviews', 'dashboard', 'analytics', 'settings', 'roles', 'all']
    },
    actions: [{
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'manage', 'all']
    }]
  }],
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true
});

// Índices para mejor rendimiento
roleSchema.index({ name: 1 });
roleSchema.index({ level: -1 });
roleSchema.index({ isActive: 1 });

// Método para verificar permisos
roleSchema.methods.hasPermission = function(module, action) {
  return this.permissions.some(permission => 
    (permission.module === module || permission.module === 'all') &&
    (permission.actions.includes(action) || permission.actions.includes('all'))
  );
};

// Middleware pre-save para validaciones
roleSchema.pre('save', function(next) {
  if (this.isSystem && this.isModified('permissions')) {
    return next(new Error('No se pueden modificar los permisos de roles del sistema'));
  }
  next();
});

module.exports = mongoose.model('Role', roleSchema);