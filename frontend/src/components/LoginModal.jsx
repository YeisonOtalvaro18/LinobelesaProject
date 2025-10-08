import React from "react";

const LoginModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-bg">
      <div className="modal-card">
        <h2>Inicio de Sesión</h2>
        <p>Por favor, inicia sesión para continuar.</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default LoginModal;