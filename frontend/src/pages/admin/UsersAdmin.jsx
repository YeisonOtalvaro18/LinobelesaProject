import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaUserCheck, FaUserTimes, FaUserShield, 
  FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, 
  FaSave, FaTimes, FaArrowLeft, FaFilter, FaSort,
  FaPlus, FaEye, FaUserPlus, FaCalendarAlt, FaEnvelope,
  FaSpinner, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import '@/styles/usersAdmin.css';
import { authenticatedFetch, auth } from '../../utils/auth.js';

const UsersAdmin = ({ onNavigate }) => {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de filtrado y búsqueda
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('fechaRegistro');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Estados de edición
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  
  // Estados de operaciones
  const [operationLoading, setOperationLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  
  // Estados para nuevo usuario
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    activo: true
  });
  const [newUserErrors, setNewUserErrors] = useState({});

  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('admin-dashboard');
    }
  };

  // Estadísticas calculadas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.activo).length;
  const inactiveUsers = users.filter(u => !u.activo).length;
  const adminUsers = users.filter(u => u.rol === 'admin').length;

  // Funciones de utilidad
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const clearError = () => {
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUserForm = (userData, isNew = false) => {
    const errors = {};
    if (!userData.nombre?.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (userData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!userData.apellido?.trim()) {
      errors.apellido = 'El apellido es requerido';
    } else if (userData.apellido.trim().length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }
    if (!userData.email?.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(userData.email)) {
      errors.email = 'Email inválido';
    }
    return errors;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Verificar autenticación antes de hacer la petición
      if (!auth.hasToken()) {
        setError('No estás autenticado. Redirigiendo al login...');
        setTimeout(() => {
          auth.clearAuth();
          onNavigate('login');
        }, 2000);
        return;
      }

      const response = await authenticatedFetch('http://localhost:8000/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
        setError('');
      } else {
        setError(data.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      
      if (err.message.includes('Token expirado') || err.message.includes('Sesión expirada')) {
        setError('Sesión expirada. Redirigiendo al login...');
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else if (err.message.includes('No hay token')) {
        setError('No estás autenticado. Redirigiendo al login...');
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        setError('Error de conexión al servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateUser = async () => {
    const errors = validateUserForm(newUser, true);
    setNewUserErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    try {
      setOperationLoading('create');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          email: newUser.email,
          activo: newUser.activo,
          password: 'temp123' // Contraseña temporal
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUsers([...users, data]);
  setNewUser({ nombre: '', apellido: '', email: '', activo: true });
        setNewUserErrors({});
        setShowAddUser(false);
        showSuccess('Usuario creado exitosamente');
      } else {
        setError(data.message || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      activo: user.activo
    });
    setEditErrors({});
  };

  const handleSaveEdit = async (userId) => {
    const errors = validateUserForm(editForm);
    setEditErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    try {
      setOperationLoading(`edit-${userId}`);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refrescar la lista de usuarios después de editar
        await fetchUsers();
        setEditingUser(null);
        setEditForm({});
        setEditErrors({});
        showSuccess('Usuario actualizado exitosamente');
      } else {
        setError(data.message || 'Error al actualizar usuario');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
    setEditErrors({});
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setOperationLoading(`delete-${userId}`);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refrescar la lista de usuarios después de eliminar
        await fetchUsers();
        showSuccess('Usuario eliminado exitosamente');
      } else {
        const data = await response.json();
        setError(data.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setOperationLoading(`status-${userId}`);
      const token = localStorage.getItem('token');
      // Log para depuración: mostrar el id que se envía
      console.log(`[FRONT] Desactivar usuario, id enviado:`, userId);
      const response = await fetch(`http://localhost:8000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo: !currentStatus })
      });
      
      if (response.ok) {
        // Refrescar la lista de usuarios después de cambiar el estado
        await fetchUsers();
        showSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al cambiar estado del usuario');
        // Log para depuración: mostrar el error recibido
        console.error(`[FRONT] Error al cambiar estado:`, data.message);
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error(`[FRONT] Error de conexión al servidor:`, err);
    } finally {
      setOperationLoading(null);
    }
  };

  // Funciones de filtrado y ordenamiento
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users.filter(user => {
      // Filtro por estado
      if (filter === 'active') return user.activo;
      if (filter === 'inactive') return !user.activo;
      if (filter === 'admin') return user.rol === 'admin';
      return true;
    });

    // Filtro por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.rol || '').toLowerCase().includes(searchLower)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'fechaRegistro') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="users-loading">
        <FaSpinner className="spinner" />
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  const filteredUsers = getFilteredAndSortedUsers();

  return (
    <div className="users-admin">
      {/* Header */}
      <div className="admin-header">
        <div className="header-top" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <button className="back-btn" onClick={handleBackToDashboard} style={{position: 'absolute', left: 0}}>
            <FaArrowLeft />
            <span>Volver al Dashboard</span>
          </button>
          <h1 style={{margin: '0 auto', textAlign: 'center'}}><FaUsers className="header-icon" />Gestión de Usuarios</h1>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-info">
              <span className="stat-number">{totalUsers}</span>
              <span className="stat-label">Total Usuarios</span>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon">
              <FaUserCheck />
            </div>
            <div className="stat-info">
              <span className="stat-number">{activeUsers}</span>
              <span className="stat-label">Activos</span>
            </div>
          </div>
          <div className="stat-card inactive">
            <div className="stat-icon">
              <FaUserTimes />
            </div>
            <div className="stat-info">
              <span className="stat-number">{inactiveUsers}</span>
              <span className="stat-label">Inactivos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="success-message">
          <FaCheck />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={clearError}><FaTimes /></button>
        </div>
      )}

      {/* Controles */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="sort-controls">
            <FaSort className="sort-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="fechaRegistro">Fecha de Registro</option>
              <option value="nombre">Nombre</option>
              <option value="email">Email</option>
              <option value="rol">Rol</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <FaUsers />
            <span>Todos ({totalUsers})</span>
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            <FaUserCheck />
            <span>Activos ({activeUsers})</span>
          </button>
          <button
            className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            <FaUserTimes />
            <span>Inactivos ({inactiveUsers})</span>
          </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
  <div className="users-table-container responsive-table">
        <div className="users-table">
          <div className="table-header">
            <div className="th th-nombre" onClick={() => handleSort('nombre')}>
              <span>Nombre</span>
              {sortBy === 'nombre' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-apellido" onClick={() => handleSort('apellido')}>
              <span>Apellido</span>
              {sortBy === 'apellido' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-email" onClick={() => handleSort('email')}>
              <span>Email</span>
              {sortBy === 'email' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-estado">Estado</div>
            <div className="th th-fecha" onClick={() => handleSort('fechaRegistro')}>
              <span>Fecha Registro</span>
              {sortBy === 'fechaRegistro' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-acciones">Acciones</div>
          </div>

          <div className="table-body">
            {filteredUsers.map(user => (
              <div key={user.id} className="table-row">
                <div className="td td-nombre">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <input
                        type="text"
                        value={editForm.nombre || ""}
                        onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                        className={editErrors.nombre ? 'error' : ''}
                      />
                      {editErrors.nombre && <span className="field-error">{editErrors.nombre}</span>}
                    </div>
                  ) : (
                    <div className="user-info">
                      <span className="user-name">{user.nombre}</span>
                    </div>
                  )}
                </div>
                <div className="td td-apellido">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <input
                        type="text"
                        value={editForm.apellido || ""}
                        onChange={(e) => setEditForm({...editForm, apellido: e.target.value})}
                        className={editErrors.apellido ? 'error' : ''}
                      />
                      {editErrors.apellido && <span className="field-error">{editErrors.apellido}</span>}
                    </div>
                  ) : (
                    <div className="user-info">
                      <span className="user-apellido">{user.apellido}</span>
                    </div>
                  )}
                </div>

                <div className="td td-email">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <input
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className={editErrors.email ? 'error' : ''}
                      />
                      {editErrors.email && <span className="field-error">{editErrors.email}</span>}
                    </div>
                  ) : (
                    <div className="email-info">
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>



                <div className="td td-estado">
                  <span className={`status-badge ${user.activo ? 'active' : 'inactive'}`}>
                    {user.activo ? <FaUserCheck /> : <FaUserTimes />}
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="td td-fecha">
                  <div className="date-info">
                    <span>{new Date(user.fechaRegistro).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                <div className="td td-acciones">
                  {editingUser === user.id ? (
                    <div className="edit-actions">
                      <button
                        className="save-btn"
                        onClick={() => handleSaveEdit(user.id)}
                        disabled={operationLoading === `edit-${user.id}`}
                      >
                        {operationLoading === `edit-${user.id}` ? <FaSpinner className="spinner" /> : <FaSave />}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuario"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`toggle-btn ${user.activo ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(user.id, user.activo)}
                        disabled={operationLoading === `status-${user.id}`}
                        title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {operationLoading === `status-${user.id}` ? 
                          <FaSpinner className="spinner" /> : 
                          (user.activo ? <FaToggleOn /> : <FaToggleOff />)
                        }
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={operationLoading === `delete-${user.id}`}
                        title="Eliminar usuario"
                      >
                        {operationLoading === `delete-${user.id}` ? 
                          <FaSpinner className="spinner" /> : 
                          <FaTrash />
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <FaUsers className="no-results-icon" />
            <p>No se encontraron usuarios que coincidan con los criterios de búsqueda</p>
            {search && (
              <button onClick={() => setSearch('')} className="clear-search-btn">
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal para agregar nuevo usuario */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><FaUserPlus />Agregar Nuevo Usuario</h3>
              <button onClick={() => setShowAddUser(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                  className={newUserErrors.nombre ? 'error' : ''}
                  placeholder="Nombre completo"
                />
                {newUserErrors.nombre && <span className="field-error">{newUserErrors.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className={newUserErrors.email ? 'error' : ''}
                  placeholder="correo@ejemplo.com"
                />
                {newUserErrors.email && <span className="field-error">{newUserErrors.email}</span>}
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({...newUser, rol: e.target.value})}
                  className={newUserErrors.rol ? 'error' : ''}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
                {newUserErrors.rol && <span className="field-error">{newUserErrors.rol}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newUser.activo}
                    onChange={(e) => setNewUser({...newUser, activo: e.target.checked})}
                  />
                  <span>Usuario activo</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowAddUser(false)}
              >
                Cancelar
              </button>
              <button
                className="submit-btn"
                onClick={handleCreateUser}
                disabled={operationLoading === 'create'}
              >
                {operationLoading === 'create' ? (
                  <>
                    <FaSpinner className="spinner" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;