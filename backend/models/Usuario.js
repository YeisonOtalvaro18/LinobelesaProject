const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'customer'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    roleDisplayName: {
        type: String,
        default: 'Cliente'
    },
    permissions: {
        type: [String],
        default: []
    },
    phone: {
        type: String,
        default: ""
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
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        },
        dateOfBirth: {
            type: String,
            default: ""
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: 'other'
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
usuarioSchema.pre('save', function(next) {
    if (!this.registerId) {
        this.registerId = new mongoose.Types.ObjectId().toString();
    }
    if (!this.loginId) {
        this.loginId = new mongoose.Types.ObjectId().toString();
    }
    next();
});

// Clase para manejo de usuarios
class Usuario {
    constructor(db) {
        this.db = db;
        this.model = mongoose.model('Usuario', usuarioSchema);
    }

    async crearUsuario({ name, lastName, email, password }) {
        try {
            // Verificar si el usuario ya existe
            const usuarioExistente = await this.model.findOne({ email });
            if (usuarioExistente) {
                throw new Error('El usuario ya existe con este email');
            }

            // Hashear la contraseña
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Crear el usuario
            const nuevoUsuario = new this.model({
                name,
                lastName,
                email,
                password: hashedPassword,
                profile: {
                    firstName: name,
                    lastName: lastName
                }
            });

            await nuevoUsuario.save();

            // Devolver usuario sin la contraseña
            const { password: _, ...userSinPassword } = nuevoUsuario.toObject();
            return userSinPassword;

        } catch (error) {
            throw error;
        }
    }

    async buscarPorEmail(email) {
        try {
            return await this.model.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    async verificarPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw error;
        }
    }

    async buscarPorId(id) {
        try {
            return await this.model.findById(id).select('-password');
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Usuario;