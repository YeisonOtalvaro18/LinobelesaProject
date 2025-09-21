const bcrypt = require('bcryptjs');

class Usuario {
  constructor(db) {
    this.registersCollection = db.collection('registers');
    this.loginCollection = db.collection('login');
    this.usersCollection = db.collection('users');
  }

  async crearUsuario(datosUsuario) {
    try {
      // Verificar si el usuario ya existe en registers
      const usuarioExistente = await this.registersCollection.findOne({ 
        email: datosUsuario.email 
      });

      if (usuarioExistente) {
        throw new Error('El usuario ya existe con este email');
      }

      // 1. REGISTRO: Guardar en 'registers' (nombre, apellido, correo)
      const nuevoRegistro = {
        name: datosUsuario.name,
        lastName: datosUsuario.lastName,
        email: datosUsuario.email,
        createdAt: new Date()
      };

      const resultadoRegistro = await this.registersCollection.insertOne(nuevoRegistro);
      
      // 2. LOGIN: Guardar en 'login' (correo y contraseña encriptada)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(datosUsuario.password, saltRounds);
      
      const datosLogin = {
        email: datosUsuario.email,
        password: hashedPassword,
        registerId: resultadoRegistro.insertedId, // Referencia al registro
        createdAt: new Date()
      };
      
      const resultadoLogin = await this.loginCollection.insertOne(datosLogin);
      
      // 3. USERS: Crear perfil completo en 'users'
      const datosCompletos = {
        name: datosUsuario.name,
        lastName: datosUsuario.lastName,
        email: datosUsuario.email,
        role: datosUsuario.role || 'user',
        registerId: resultadoRegistro.insertedId, // Referencia al registro
        loginId: resultadoLogin.insertedId, // Referencia al login
        profile: {
          firstName: datosUsuario.name,
          lastName: datosUsuario.lastName,
          phone: datosUsuario.phone || '',
          address: datosUsuario.address || '',
          dateOfBirth: datosUsuario.dateOfBirth || null,
          gender: datosUsuario.gender || ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const resultadoUser = await this.usersCollection.insertOne(datosCompletos);
      
      // Retornar el usuario completo sin la contraseña
      const { password, ...usuarioSinPassword } = datosCompletos;
      usuarioSinPassword._id = resultadoUser.insertedId;
      
      return usuarioSinPassword;
    } catch (error) {
      throw error;
    }
  }

  async buscarPorEmail(email) {
    try {
      // Buscar en la colección login para autenticación
      const usuario = await this.loginCollection.findOne({ email });
      return usuario;
    } catch (error) {
      throw error;
    }
  }

  async verificarPassword(passwordPlano, passwordHash) {
    try {
      return await bcrypt.compare(passwordPlano, passwordHash);
    } catch (error) {
      throw error;
    }
  }

  async buscarPorId(id) {
    try {
      const { ObjectId } = require('mongodb');
      // Buscar en la colección users que tiene el perfil completo
      const usuario = await this.usersCollection.findOne({ _id: new ObjectId(id) });
      
      if (usuario) {
        // Remover la contraseña del resultado (si existe)
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }

  async obtenerTodos() {
    try {
      // Obtener todos los usuarios de la colección users
      const usuarios = await this.usersCollection.find({}).toArray();
      
      // Eliminar contraseñas si existen
      const usuariosSinPassword = usuarios.map(usuario => {
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
      });
      
      return usuariosSinPassword;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Usuario;
