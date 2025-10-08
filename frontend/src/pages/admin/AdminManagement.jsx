import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaEnvelope, 
  FaCrown, FaUserShield, FaSearch, FaFilter, FaDownload,
  FaTimes, FaCheck, FaArrowLeft, FaCopy
} from 'react-icons/fa';
import '../../styles/AdminManagement.css';

const AdminManagement = ({ onNavigate }) => {
  const [administrators, setAdministrators] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    lastName: '',
    email: '',
    roleId: '',
    sendInvitation: true
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAdministrators(),
        fetchPendingInvitations(),
        fetchRoles()
      ]);
    } catch (error) {
      setError('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdministrators = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/administrators', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdministrators(data.data.administrators || []);
      }
    } catch (error) {
      console.error('Error fetching administrators:', error);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/pending-invitations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingInvitations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

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
        const data = await response.json();
        setRoles(data.filter(role => role.name !== 'customer'));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/register-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdmin)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setShowInviteModal(false);
        setNewAdmin({
          name: '',
          lastName: '',
          email: '',
          roleId: '',
          sendInvitation: true
        });
        fetchData();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Error creando administrador');
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/administrator/${adminId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setSuccess('Estado actualizado correctamente');
        fetchAdministrators();
      } else {
        setError('Error actualizando estado');
      }
    } catch (error) {
      setError('Error actualizando administrador');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta invitación?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/cancel-invitation/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Invitación cancelada');
        fetchPendingInvitations();
      } else {
        setError('Error cancelando invitación');
      }
    } catch (error) {
      setError('Error cancelando invitación');
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationId: invitationId })
      });

      if (response.ok) {
        setSuccess('Invitación reenviada');
        fetchPendingInvitations();
      } else {
        setError('Error reenviando invitación');
      }
    } catch (error) {
      setError('Error reenviando invitación');
    }
  };

  const filteredAdmins = administrators.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && admin.isActive) ||
                         (statusFilter === 'inactive' && !admin.isActive);
    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="admin-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando administradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-management">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => onNavigate('admin-dashboard')}
          >
            <FaArrowLeft />
            Volver al Dashboard
          </button>
          <h1>Gestión de Administradores</h1>
        </div>
        <div className="header-actions">
          <button 
            className="toggle-view-btn"
            onClick={() => setShowInvitations(!showInvitations)}
          >
            {showInvitations ? 'Ver Administradores' : 'Ver Invitaciones'}
          </button>
          <button 
            className="invite-btn"
            onClick={() => setShowInviteModal(true)}
          >
            <FaPlus />
            Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert error">
          <FaTimes />
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert success">
          <FaCheck />
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {!showInvitations ? (
        // Vista de Administradores
        <div className="admins-section">
          <div className="section-header">
            <div className="search-filters">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-box">
                <FaFilter />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
            <div className="stats">
              <span className="stat">
                Total: {administrators.length}
              </span>
              <span className="stat active">
                Activos: {administrators.filter(a => a.isActive).length}
              </span>
            </div>
          </div>

          <div className="admins-grid">
            {filteredAdmins.map(admin => (
              <div key={admin.id} className="admin-card">
                <div className="admin-avatar">
                  {admin.isSuperAdmin ? <FaCrown /> : <FaUserShield />}
                </div>
                <div className="admin-info">
                  <h3>{admin.name}</h3>
                  <p className="email">{admin.email}</p>
                  <div className="role-badge">
                    {admin.role}
                    {admin.isSuperAdmin && <FaCrown className="crown" />}
                  </div>
                  <div className="admin-meta">
                    <span>Último acceso: {admin.lastLogin ? 
                      new Date(admin.lastLogin).toLocaleDateString() : 'Nunca'}</span>
                  </div>
                </div>
                <div className="admin-actions">
                  <button
                    className={`status-btn ${admin.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                    title={admin.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {admin.isActive ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => setSelectedAdmin(admin)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(admin.email)}
                    title="Copiar email"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Vista de Invitaciones Pendientes
        <div className="invitations-section">
          <div className="section-header">
            <h2>Invitaciones Pendientes</h2>
            <span className="count">
              {pendingInvitations.length} pendientes
            </span>
          </div>

          {pendingInvitations.length === 0 ? (
            <div className="empty-state">
              <FaEnvelope />
              <p>No hay invitaciones pendientes</p>
            </div>
          ) : (
            <div className="invitations-list">
              {pendingInvitations.map(invitation => (
                <div key={invitation.id} className="invitation-card">
                  <div className="invitation-info">
                    <h3>{invitation.name}</h3>
                    <p className="email">{invitation.email}</p>
                    <div className="invitation-meta">
                      <span>Rol: {invitation.role}</span>
                      <span>Expira: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                      <span>Creado: {new Date(invitation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="invitation-actions">
                    <button
                      className="resend-btn"
                      onClick={() => handleResendInvitation(invitation.id)}
                      title="Reenviar invitación"
                    >
                      <FaEnvelope />
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      title="Cancelar invitación"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Nuevo Administrador */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Administrador</h2>
              <button onClick={() => setShowInviteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="invite-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={newAdmin.roleId}
                  onChange={(e) => setNewAdmin({...newAdmin, roleId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newAdmin.sendInvitation}
                    onChange={(e) => setNewAdmin({...newAdmin, sendInvitation: e.target.checked})}
                  />
                  Enviar invitación por email
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowInviteModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {newAdmin.sendInvitation ? 'Enviar Invitación' : 'Crear Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;