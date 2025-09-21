import React from "react";

const ModalSuccess = ({ onClose }) => {
  return (
    <div className="modal-success-bg">
      <div className="modal-success-card">
        <div className="modal-success-icon">
          ✅
        </div>
        <h3>¡Operación exitosa!</h3>
        <p>Tu acción se completó correctamente.</p>
        <button className="auth-button modal-success-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalSuccess;
