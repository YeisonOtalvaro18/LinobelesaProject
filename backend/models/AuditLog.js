const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_RESET', 'ROLE_CHANGE']
  },
  resource: {
    type: String,
    required: true // users, products, orders, etc.
  },
  resourceId: {
    type: String // ID del recurso afectado
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Detalles específicos de la acción
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed // Valores anteriores en caso de UPDATE
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed // Nuevos valores en caso de UPDATE/CREATE
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para consultas optimizadas
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });

// TTL index para eliminar logs antiguos después de 2 años
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 años

module.exports = mongoose.model('AuditLog', auditLogSchema);