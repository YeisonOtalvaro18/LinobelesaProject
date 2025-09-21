import React, { useState } from "react";
import "../styles/contacto.css";


export default function ContactForm() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formsubmit.co/e11182b2c927117f2f4e7de495c1fc93", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Limpiar formulario y mostrar modal de éxito
        e.target.reset();
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      alert("Error enviando el formulario. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="contact-page">
        <div className="formu">
          <h2>Formulario de Contacto</h2>
          <form onSubmit={handleSubmit}>
            {/* Campos hidden requeridos por FormSubmit */}
            <input type="hidden" name="_subject" value="Nuevo mensaje desde Linobelesa!" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <label htmlFor="name">Nombre:</label>
            <input type="text" id="name" name="name" required />
            <label htmlFor="email">Correo electrónico:</label>
            <input type="email" id="email" name="email" required />
            <label htmlFor="subject">Asunto:</label>
            <input type="text" id="subject" name="subject" required />
            <label htmlFor="message">Mensaje:</label>
            <textarea id="message" name="message" rows="5" required></textarea>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
        {/* ====== INFO CONTACTO ====== */}
        <div className="info-contacto">
          <h2>Información de contacto</h2>
          <p>Teléfono: +57 316 0448131</p>
          <p>Email: infolinobelesa@gmail.com</p>
        </div>
        {/* Modal de éxito elegante */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="success-icon">✅</div>
                <h3>¡Mensaje enviado!</h3>
                <p>Tu mensaje ha sido enviado correctamente</p>
              </div>
              <div className="modal-body">
                <p>Gracias por contactarnos. Te responderemos pronto.</p>
                <div className="modal-actions">
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}