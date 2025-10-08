import React, { useState, useEffect } from 'react';
import '../../styles/users.css';

const Users = ({ onNavigate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingError, setDeletingError] = useState('');
  const [statusLoading, setStatusLoading] = useState(null);

  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('admin-dashboard');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token);
      const response = await fetch('http://localhost:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
        setError('');
      } else {
        setError(data.message || 'Error al cargar usuarios');
        console.error('Error al cargar usuarios:', data);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setIsDeleting(true);
      setDeletingError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
        } else {
          setDeletingError(data.message || 'Error al eliminar usuario');
          setTimeout(() => setDeletingError(''), 5000); // Clear error after 5s
        }
      } catch (err) {
        setDeletingError('Error de conexión al servidor');
        setTimeout(() => setDeletingError(''), 5000); // Clear error after 5s
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo: !currentStatus })
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, activo: !currentStatus } : user
        ));
      } else {
        alert('Error al cambiar estado del usuario');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const getFilteredUsers = () => {
    return users
      .filter(user => {
        if (filter === 'active') return user.activo;
        if (filter === 'inactive') return !user.activo;
        return true;
      })
      .filter(user => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          user.nombre.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.rol.toLowerCase().includes(searchLower)
        );
      });
  };

  if (loading) return <div className="loading">Cargando usuarios...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredUsers = getFilteredUsers();

  return (
    <div className="users-management">
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        ← Volver al Dashboard
      </button>
      
      <div className="users-container">
        <div className="users-header">
          <h2>Gestión de Usuarios</h2>
          <div className="users-stats">
            <div className="stat">
              <span className="number">{users.length}</span>
              <span className="label">Total Usuarios</span>
            </div>
            <div className="stat">
              <span className="number">{users.filter(u => u.activo).length}</span>
              <span className="label">Usuarios Activos</span>
            </div>
            <div className="stat">
              <span className="number">{users.filter(u => !u.activo).length}</span>
              <span className="label">Usuarios Inactivos</span>
            </div>
          </div>
        </div>

        <div className="users-tools">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Todos ({users.length})
            </button>
            <button
              className={filter === 'active' ? 'active' : ''}
              onClick={() => setFilter('active')}
            >
              Activos ({users.filter(u => u.activo).length})
            </button>
            <button
              className={filter === 'inactive' ? 'active' : ''}
              onClick={() => setFilter('inactive')}
            >
              Inactivos ({users.filter(u => !u.activo).length})
            </button>
          </div>
        </div>
      
      {deletingError && (
        <div className="error-message">{deletingError}</div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.rol.toLowerCase()}`}>
                    {user.rol}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.activo ? 'active' : 'inactive'}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{new Date(user.fechaRegistro).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.activo)}
                      className={`btn-${user.activo ? 'deactivate' : 'activate'}`}
                      disabled={statusLoading === user.id || isDeleting}
                    >
                      {statusLoading === user.id ? 'Procesando...' : (user.activo ? 'Desactivar' : 'Activar')}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn-delete"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No se encontraron usuarios que coincidan con los criterios de búsqueda</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Users;