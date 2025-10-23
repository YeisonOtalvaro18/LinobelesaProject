import React, { useState, useEffect } from 'react';
import '../../styles/roles.css';

const Roles = ({ onNavigate }) => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [rolesRes, usersRes] = await Promise.all([
          fetch('http://localhost:8000/api/roles', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/users', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (rolesRes.ok) {
          const r = await rolesRes.json();
          setRoles(r.data || r);
        }
        if (usersRes.ok) {
          const u = await usersRes.json();
          setUsers(u.data || u);
        }
      } catch (e) {
        console.error(e);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="roles-management">
      <div className="roles-header">
        <div className="roles-header-inner">
          <button
            type="button"
            className="btn-back"
            onClick={() => {
              if (onNavigate) return onNavigate('admin-dashboard');
              window.location.href = '/admin/dashboard';
            }}
            aria-label="Volver al Dashboard"
          >
            ← Volver al Dashboard
          </button>
          <h2>Gestión de Roles</h2>
        </div>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div key={role.id || role._id} className="role-card">
            <h3>{role.nombre || role.name || 'Sin nombre'}</h3>
            <p>{role.descripcion || role.description || 'Sin descripción'}</p>
            <div className="role-actions">
              <button className="btn-delete">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="users-section" style={{ marginTop: 24 }}>
        <h3>Usuarios</h3>
        <div className="users-table" style={{ marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Apellido</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id || u._id}>
                  <td style={{ padding: '8px', borderTop: '1px solid #eee' }}>{u.nombre || u.name || ''}</td>
                  <td style={{ padding: '8px', borderTop: '1px solid #eee' }}>{u.apellido || u.lastName || u.lastname || ''}</td>
                  <td style={{ padding: '8px', borderTop: '1px solid #eee' }}>{u.rol || u.role || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Roles;