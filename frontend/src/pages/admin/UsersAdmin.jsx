import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaUserCheck, FaUserTimes, FaUserShield, 
  FaSearch, FaArrowLeft, FaFilter, FaSort,
  FaPlus, FaEye, FaUserPlus, FaCalendarAlt, FaEnvelope,
  FaCheck, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import '../../styles/usersAdmin.css';
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
    apellidos: '',
    email: '',
    telefono: '',
    rol: 'Cliente',
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
    
    if (!userData.apellidos?.trim()) {
      errors.apellidos = 'Los apellidos son requeridos';
    } else if (userData.apellidos.trim().length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
    
    if (!userData.email?.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(userData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (userData.telefono?.trim() && userData.telefono.trim().length < 8) {
      errors.telefono = 'El teléfono debe tener al menos 8 dígitos';
    }
    
    if (!userData.rol) {
      errors.rol = 'El rol es requerido';
    }
    
    return errors;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsersList = async () => {
    await fetchUsers();
  };

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
          ...newUser,
          password: 'temp123' // Contraseña temporal
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUsers([...users, data.usuario]);
        setNewUser({ nombre: '', apellidos: '', email: '', telefono: '', rol: 'Cliente', activo: true });
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
      apellidos: user.apellidos || '',
      email: user.email,
      telefono: user.telefono || '',
      rol: user.rol || 'Cliente',
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
        setUsers(users.map(user => 
          user.id === userId ? { ...user, ...data.usuario } : user
        ));
        setEditingUser(null);
        setEditForm({});
        setEditErrors({});
        showSuccess('Usuario actualizado exitosamente');
      } else if (response.status === 404) {
        setError('Usuario no encontrado. Puede haber sido eliminado.');
        // Remover el usuario de la lista si no existe
        setUsers(users.filter(user => user.id !== userId));
        setEditingUser(null);
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
        setUsers(users.filter(user => user.id !== userId));
        showSuccess('Usuario eliminado exitosamente');
      } else if (response.status === 404) {
        // El usuario ya no existe, removerlo de la lista
        setUsers(users.filter(user => user.id !== userId));
        showSuccess('Usuario ya no existe en el servidor');
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
        showSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      } else if (response.status === 404) {
        setError('Usuario no encontrado. Puede haber sido eliminado.');
        // Remover el usuario de la lista si no existe
        setUsers(users.filter(user => user.id !== userId));
      } else {
        const data = await response.json();
        setError(data.message || 'Error al cambiar estado del usuario');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
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
        <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  const filteredUsers = getFilteredAndSortedUsers();

  return (
    <div className="users-admin">
      {/* Header */}
      <div className="admin-header">
        <div className="header-top">
          <button className="back-btn" onClick={handleBackToDashboard}>
            <FaArrowLeft />
            <span>Volver al Dashboard</span>
          </button>
          <h1><FaUsers className="header-icon" />Gestión de Usuarios</h1>
          <div className="header-buttons">
            <button 
              className="refresh-btn"
              onClick={refreshUsersList}
              disabled={loading}
              title="Refrescar lista de usuarios"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12A9 9 0 0 0 12 21A9 9 0 0 0 21 12A9 9 0 0 0 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L3 3V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="add-user-btn"
              onClick={() => setShowAddUser(true)}
            >
              <FaUserPlus />
              <span>Nuevo Usuario</span>
            </button>
          </div>
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
          <div className="stat-card admin">
            <div className="stat-icon">
              <FaUserShield />
            </div>
            <div className="stat-info">
              <span className="stat-number">{adminUsers}</span>
              <span className="stat-label">Administradores</span>
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
          <button
            className={`filter-tab ${filter === 'admin' ? 'active' : ''}`}
            onClick={() => setFilter('admin')}
          >
            <FaUserShield />
            <span>Admins ({adminUsers})</span>
          </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="users-table-container">
        <div className="users-table">
          <div className="table-header">
            <div className="th th-nombre" onClick={() => handleSort('nombre')}>
              <span>Nombre</span>
              {sortBy === 'nombre' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-apellidos" onClick={() => handleSort('apellidos')}>
              <span>Apellidos</span>
              {sortBy === 'apellidos' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-email" onClick={() => handleSort('email')}>
              <span>Email</span>
              {sortBy === 'email' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </div>
            <div className="th th-telefono">Teléfono</div>
            <div className="th th-rol" onClick={() => handleSort('rol')}>
              <span>Rol</span>
              {sortBy === 'rol' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
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
                        value={editForm.nombre}
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
                
                <div className="td td-apellidos">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <input
                        type="text"
                        value={editForm.apellidos}
                        onChange={(e) => setEditForm({...editForm, apellidos: e.target.value})}
                        className={editErrors.apellidos ? 'error' : ''}
                      />
                      {editErrors.apellidos && <span className="field-error">{editErrors.apellidos}</span>}
                    </div>
                  ) : (
                    <span>{user.apellidos}</span>
                  )}
                </div>

                <div className="td td-email">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className={editErrors.email ? 'error' : ''}
                      />
                      {editErrors.email && <span className="field-error">{editErrors.email}</span>}
                    </div>
                  ) : (
                    <div className="email-info">
                      <FaEnvelope className="email-icon" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="td td-telefono">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <input
                        type="tel"
                        value={editForm.telefono}
                        onChange={(e) => setEditForm({...editForm, telefono: e.target.value})}
                        className={editErrors.telefono ? 'error' : ''}
                        placeholder="Teléfono"
                      />
                      {editErrors.telefono && <span className="field-error">{editErrors.telefono}</span>}
                    </div>
                  ) : (
                    <span>{user.telefono || 'No especificado'}</span>
                  )}
                </div>

                <div className="td td-rol">
                  {editingUser === user.id ? (
                    <div className="edit-field">
                      <select
                        value={editForm.rol}
                        onChange={(e) => setEditForm({...editForm, rol: e.target.value})}
                        className={editErrors.rol ? 'error' : ''}
                      >
                        <option value="Cliente">Cliente</option>
                        <option value="Admin">Administrador</option>
                      </select>
                      {editErrors.rol && <span className="field-error">{editErrors.rol}</span>}
                    </div>
                  ) : (
                    <span className={`role-badge ${user.rol || 'user'}`}>
                      {user.rol === 'admin' ? <FaUserShield /> : <FaUsers />}
                      {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
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
                    <FaCalendarAlt className="date-icon" />
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
                        {operationLoading === `edit-${user.id}` ? (
                          <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={handleCancelEdit}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuario"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className={`toggle-btn ${user.activo ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(user.id, user.activo)}
                        disabled={operationLoading === `status-${user.id}`}
                        title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {operationLoading === `status-${user.id}` ? 
                          <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg> : 
                          user.activo ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="1" y="5" width="22" height="14" rx="7" ry="7" fill="currentColor"/>
                              <circle cx="16" cy="12" r="3" fill="white"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="1" y="5" width="22" height="14" rx="7" ry="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="8" cy="12" r="3" fill="currentColor"/>
                            </svg>
                          )
                        }
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={operationLoading === `delete-${user.id}`}
                        title="Eliminar usuario"
                      >
                        {operationLoading === `delete-${user.id}` ? 
                          <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg> : 
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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
                  placeholder="Nombre"
                />
                {newUserErrors.nombre && <span className="field-error">{newUserErrors.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Apellidos</label>
                <input
                  type="text"
                  value={newUser.apellidos}
                  onChange={(e) => setNewUser({...newUser, apellidos: e.target.value})}
                  className={newUserErrors.apellidos ? 'error' : ''}
                  placeholder="Apellidos"
                />
                {newUserErrors.apellidos && <span className="field-error">{newUserErrors.apellidos}</span>}
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
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={newUser.telefono}
                  onChange={(e) => setNewUser({...newUser, telefono: e.target.value})}
                  className={newUserErrors.telefono ? 'error' : ''}
                  placeholder="Número de teléfono"
                />
                {newUserErrors.telefono && <span className="field-error">{newUserErrors.telefono}</span>}
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({...newUser, rol: e.target.value})}
                  className={newUserErrors.rol ? 'error' : ''}
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Admin">Administrador</option>
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
                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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