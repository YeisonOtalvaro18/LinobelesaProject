const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// const Rol = mongoose.model('Rol', rolSchema);

module.exports = rolSchema;