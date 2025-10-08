import React from 'react';
import '../../styles/AdminDashboard.css';

const AdminDashboard = ({ user, onNavigate }) => {
  const handleNavigation = (page) => {
    onNavigate(page);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('login');
  };

  return (
    <div className="admin-dashboard">
      <button className="admin-logout" onClick={handleLogout}>
        Cerrar Sesión
      </button>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p>Bienvenido, {user?.name || 'Admin'}</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => handleNavigation('usuarios')}>
            <h3>Usuarios</h3>
            <p>Gestionar usuarios del sistema</p>
          </div>
          
          <div className="dashboard-card" onClick={() => handleNavigation('ordenes')}>
            <h3>Pedidos</h3>
            <p>Administrar pedidos y ventas</p>
          </div>
          
          <div className="dashboard-card" onClick={() => handleNavigation('reseñas')}>
            <h3>Reseñas</h3>
            <p>Moderar reseñas de productos</p>
          </div>
          
          <div className="dashboard-card" onClick={() => handleNavigation('roles')}>
            <h3>Roles</h3>
            <p>Gestionar roles y permisos</p>
          </div>
          
          <div className="dashboard-card" onClick={() => handleNavigation('inventario')}>
            <h3>Inventario</h3>
            <p>Control de stock y productos</p>
          </div>
          
          <div className="dashboard-card" onClick={() => handleNavigation('cupones')}>
            <h3>Cupones</h3>
            <p>Gestionar descuentos y promociones</p>
          </div>
          
          <div className="dashboard-card" onClick={() => handleNavigation('notificaciones')}>
            <h3>Notificaciones</h3>
            <p>Enviar alertas a usuarios</p>
          </div>
        
          <div className="dashboard-card" onClick={() => handleNavigation('direcciones')}>
            <h3>Direcciones</h3>
            <p>Gestionar direcciones de envío</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;