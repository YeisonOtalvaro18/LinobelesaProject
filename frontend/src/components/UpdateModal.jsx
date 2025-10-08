import React from "react";

const UpdateModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-bg">
      <div className="modal-card">
        <h2>¡Actualización exitosa!</h2>
        <p>Los datos se han actualizado correctamente.</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default UpdateModal;