import React from "react";
import "../styles/auth-modal.css";

const AuthSuccessModal = ({ isOpen, type, userName, onContinue, onClose }) => {
  if (!isOpen) return null;

  const isLogin = type === "login";
  const title = isLogin ? "¡Bienvenido de vuelta!" : "¡Registro exitoso!";
  const message = isLogin 
    ? `Hola ${userName}, nos alegra verte de nuevo en Linobelesa.`
    : `¡Hola ${userName}! Tu cuenta ha sido creada exitosamente. Bienvenido a la familia Linobelesa.`;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            {isLogin ? "👋" : "🎉"}
          </div>
          <h2>{title}</h2>
        </div>
        
        <div className="auth-modal-body">
          <p>{message}</p>
          <div className="auth-modal-features">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Descubre productos increíbles</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <span>Realiza pedidos fácilmente</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💫</span>
              <span>Transforma tu cabello</span>
            </div>
          </div>
        </div>
        
        <div className="auth-modal-footer">
          <button className="auth-modal-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="auth-modal-btn primary" onClick={onContinue}>
            Comenzar a explorar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessModal;