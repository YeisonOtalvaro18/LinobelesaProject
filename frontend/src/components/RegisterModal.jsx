import React from "react";

const RegisterModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-bg">
      <div className="modal-card">
        <h2>Registro</h2>
        <p>Por favor, completa el formulario para registrarte.</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default RegisterModal;