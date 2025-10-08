import React, { useState } from "react";
import "../styles/contacto.css";
import ContactModal from "../components/ContactModal";


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
      <div className="contact-page contact-grid">
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
        <div className="contact-extra">
          <h2>Redes Sociales & Ubicación</h2>
          <div className="contact-social">
            <a href="https://www.facebook.com/p/Linobelesa-100093308496757/" target="_blank" rel="noopener noreferrer" className="social-icon"><span><i className="fab fa-facebook-f"></i></span> Facebook</a>
            <a href="https://www.instagram.com/linobelesa/" target="_blank" rel="noopener noreferrer" className="social-icon"><span><i className="fab fa-instagram"></i></span> Instagram</a>
            <a href="https://www.tiktok.com/@linobelesa" target="_blank" rel="noopener noreferrer" className="social-icon"><span><i className="fab fa-tiktok"></i></span> TikTok</a>
            <a href="https://wa.me/573160448131" target="_blank" rel="noopener noreferrer" className="social-icon"><span><i className="fab fa-whatsapp"></i></span> WhatsApp</a>
          </div>
          <div className="contact-map">
            <div style={{ position: 'relative' }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-75.3803178%2C6.1651623%2C-75.3723178%2C6.1691623&amp;layer=mapnik&amp;marker=6.1671623%2C-75.3763178"
                width="100%"
                height="220"
                style={{ 
                  border: 0, 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 12px rgba(108,12,191,0.13)' 
                }}
                allowFullScreen=""
                loading="lazy"
                title="Ubicación Linobelesa - OpenStreetMap"
              />
              
              {/* Overlay con información y enlaces */}
              <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '15px',
                right: '15px',
                background: 'rgba(108, 12, 191, 0.95)',
                borderRadius: '8px',
                padding: '10px 15px',
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <strong>Cl. 67 #54-297, Rionegro</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a 
                    href="https://maps.google.com/?q=6.1671623,-75.3763178" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'white', 
                      textDecoration: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: '11px'
                    }}
                  >
                    Google Maps
                  </a>
                  <a 
                    href="https://waze.com/ul?q=Cl.%2067%20%2354-297%2C%20Rionegro%2C%20Antioquia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'white', 
                      textDecoration: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: '11px'
                    }}
                  >
                    Waze
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal de éxito elegante */}
        {showSuccessModal && (
          <ContactModal 
            open={showSuccessModal} 
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </div>
    </>
  );
}