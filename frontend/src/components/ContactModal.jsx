import React from "react";

const ContactModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-bg">
      <div className="modal-card">
        <h2>Contacto</h2>
        <p>Por favor, envíanos un mensaje y nos pondremos en contacto contigo.</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ContactModal;