import React, { useState, useEffect } from 'react';
import '../../styles/roles.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRole, setNewRole] = useState({ nombre: '', descripcion: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setRoles(result.data || result);
      } else {
        setError('Error al cargar roles');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRole)
      });
      
      if (response.ok) {
        const roleCreated = await response.json();
        setRoles([...roles, roleCreated]);
        setNewRole({ nombre: '', descripcion: '' });
        setShowAddForm(false);
      } else {
        alert('Error al crear rol');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setRoles(roles.filter(role => role.id !== roleId));
        } else {
          alert('Error al eliminar rol');
        }
      } catch (err) {
        alert('Error de conexión');
      }
    }
  };

  if (loading) return <div className="loading">Cargando roles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="roles-management">
      <div className="roles-header">
        <h2>Gestión de Roles</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-add-role"
        >
          {showAddForm ? 'Cancelar' : 'Agregar Rol'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-role-form">
          <form onSubmit={handleAddRole}>
            <div className="form-group">
              <label>Nombre del Rol:</label>
              <input
                type="text"
                value={newRole.nombre}
                onChange={(e) => setNewRole({...newRole, nombre: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                value={newRole.descripcion}
                onChange={(e) => setNewRole({...newRole, descripcion: e.target.value})}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">Crear Rol</button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <h3>{role.nombre}</h3>
            <p>{role.descripcion}</p>
            <div className="role-actions">
              <button 
                onClick={() => handleDeleteRole(role.id)}
                className="btn-delete"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {roles.length === 0 && !loading && (
        <div className="no-roles">
          <p>No hay roles configurados</p>
        </div>
      )}
    </div>
  );
};

export default Roles;