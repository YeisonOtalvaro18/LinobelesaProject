const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    profile: {
        address: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        },
        municipio: {
            type: String,
            default: ""
        },
        departamento: {
            type: String,
            default: ""
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        }
    },
    registerId: {
        type: String,
        unique: true
    },
    loginId: {
        type: String,
        unique: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware para generar IDs únicos antes de guardar
userSchema.pre('save', function(next) {
    if (!this.registerId) {
        this.registerId = new mongoose.Types.ObjectId().toString();
    }
    if (!this.loginId) {
        this.loginId = new mongoose.Types.ObjectId().toString();
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;