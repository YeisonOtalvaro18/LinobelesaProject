import React, { useState, useEffect } from 'react';
import '../styles/users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  // Simulación de datos de usuarios
  useEffect(() => {
    // Aquí normalmente harías una llamada a la API
    const mockUsers = [
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'admin', createdAt: '2024-01-15' },
      { id: 2, name: 'María García', email: 'maria@example.com', role: 'user', createdAt: '2024-01-20' },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'user', createdAt: '2024-02-01' }
    ];
    setUsers(mockUsers);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    setFormData({ name: '', email: '', role: 'user' });
  };

  const handleDelete = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  return (
    <div className="users-container">
      <h2>Gestión de Usuarios</h2>
      
      {/* Formulario para agregar usuario */}
      <form onSubmit={handleSubmit} className="user-form">
        <h3>Agregar Nuevo Usuario</h3>
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit">Agregar Usuario</button>
      </form>

      {/* Lista de usuarios */}
      <div className="users-list">
        <h3>Lista de Usuarios</h3>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Fecha de registro</span>
              <span>Acciones</span>
            </div>
            {users.map(user => (
              <div key={user.id} className="table-row">
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span className={`role ${user.role}`}>{user.role}</span>
                <span>{user.createdAt}</span>
                <span className="actions">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="delete-btn"
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
