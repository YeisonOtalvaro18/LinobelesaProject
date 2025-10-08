import React from 'react';
import '../../styles/AdminDashboard.css';
import {
  FaUsers,
  FaShoppingBag,
  FaStar,
  FaUserShield,
  FaWarehouse,
  FaTicketAlt,
  FaBell,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';

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
        <FaSignOutAlt className="logout-icon" />
        Cerrar Sesión
      </button>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-background">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
            <div className="header-content">
              <h1>PANEL DE ADMINISTRACIÓN</h1>
              <div className="welcome-admin">
                <FaUserCircle className="admin-icon" />
                <span>Bienvenido, Admin</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card usuarios" onClick={() => handleNavigation('usuarios')}>
            <div className="card-background">
              <div className="card-icon">
                <FaUsers />
              </div>
              <div className="card-content">
                <h3>Usuarios</h3>
                <p>Gestionar usuarios del sistema</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
          
          <div className="dashboard-card pedidos" onClick={() => handleNavigation('ordenes')}>
            <div className="card-background">
              <div className="card-icon">
                <FaShoppingBag />
              </div>
              <div className="card-content">
                <h3>Pedidos</h3>
                <p>Administrar pedidos y ventas</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
          
          <div className="dashboard-card reseñas" onClick={() => handleNavigation('reseñas')}>
            <div className="card-background">
              <div className="card-icon">
                <FaStar />
              </div>
              <div className="card-content">
                <h3>Reseñas</h3>
                <p>Moderar reseñas de productos</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
          
          <div className="dashboard-card roles" onClick={() => handleNavigation('roles')}>
            <div className="card-background">
              <div className="card-icon">
                <FaUserShield />
              </div>
              <div className="card-content">
                <h3>Roles</h3>
                <p>Gestionar roles y permisos</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
          
          <div className="dashboard-card inventario" onClick={() => handleNavigation('inventario')}>
            <div className="card-background">
              <div className="card-icon">
                <FaWarehouse />
              </div>
              <div className="card-content">
                <h3>Inventario</h3>
                <p>Control de stock y productos</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
          
          <div className="dashboard-card cupones" onClick={() => handleNavigation('cupones')}>
            <div className="card-background">
              <div className="card-icon">
                <FaTicketAlt />
              </div>
              <div className="card-content">
                <h3>Cupones</h3>
                <p>Gestionar descuentos y promociones</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
          
          <div className="dashboard-card notificaciones" onClick={() => handleNavigation('notificaciones')}>
            <div className="card-background">
              <div className="card-icon">
                <FaBell />
              </div>
              <div className="card-content">
                <h3>Notificaciones</h3>
                <p>Enviar alertas a usuarios</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
        
          <div className="dashboard-card direcciones" onClick={() => handleNavigation('direcciones')}>
            <div className="card-background">
              <div className="card-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="card-content">
                <h3>Direcciones</h3>
                <p>Gestionar direcciones de envío</p>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;