import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import "../styles/footer.css";

const footerSections = [
  {
    title: "Nosotros",
    links: [
      { label: "Misión", href: "#mision" },
      { label: "Visión", href: "#vision" },
      { label: "Quiénes Somos", href: "#nosotros" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Preguntas Frecuentes", href: "#faq" },
      { label: "Envíos", href: "#envios" },
      { label: "Métodos de Pago", href: "#pagos" },
      { label: "Devoluciones", href: "#devoluciones" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Calle 123 #45-67, Bogotá", href: "#", icon: <FaMapMarkerAlt /> },
      { label: "+57 316 0448131", href: "tel:+573160448131", icon: <FaPhone /> },
      { label: "infolinobelesa@gmail.com", href: "mailto:infolinobelesa@gmail.com", icon: <FaEnvelope /> },
    ],
    isContact: true,
  },
  {
    title: "Síguenos",
    links: [
      { label: "Facebook", href: "#", icon: <FaFacebookF /> },
      { label: "Instagram", href: "#", icon: <FaInstagram /> },
      { label: "TikTok", href: "#", icon: <FaTiktok /> },
      { label: "WhatsApp", href: "https://wa.me/573160448131", icon: <FaWhatsapp /> },
    ],
    isSocial: true,
  },
];

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Logo y descripción */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/src/IMG/logoheader.png" alt="Linobelesa" />
            <h3>Linobelesa</h3>
          </div>
          <p>Cuidamos tu cabello con los mejores productos de belleza y tratamientos capilares profesionales.</p>
        </div>

        {/* Secciones */}
        <div className="footer-sections">
          {footerSections.map((section) => (
            <div key={section.title} className="footer-section">
              <h4>{section.title}</h4>
              <ul className={`${section.isSocial ? "social" : ""} ${section.isContact ? "contact" : ""}`}>
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} target={link.href.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer">
                      {link.icon && <span className="icon">{link.icon}</span>}
                      <span className="text">{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copy">
          <p>© 2025 Linobelesa. Todos los derechos reservados.</p>
          <p>Desarrollado con ❤️ para el cuidado capilar</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;