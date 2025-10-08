import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/login-required-modal.css';

const LoginRequiredModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="login-required-overlay" onClick={onClose}>
      <div className="login-required-modal" onClick={e => e.stopPropagation()}>
        <div className="login-required-content">
          <h2>Iniciar Sesión Requerido</h2>
          <p>Para acceder a esta sección necesitas iniciar sesión</p>
          <div className="login-required-actions">
            <Link to="/login" className="login-button">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="register-button">
              Registrarse
            </Link>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;