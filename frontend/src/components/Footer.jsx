import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBullseye,
  FaEye,
  FaUsers,
  FaQuestionCircle,
  FaTruck,
  FaCreditCard,
  FaExchangeAlt,
} from "react-icons/fa";
import "../styles/footer.css";

const footerSections = [
  {
    title: "Nosotros",
    links: [
      { label: "Misión", href: "#mision", icon: <FaBullseye /> },
      { label: "Visión", href: "#vision", icon: <FaEye /> },
      { label: "Quiénes Somos", href: "#nosotros", icon: <FaUsers /> },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Preguntas Frecuentes", href: "#faq", icon: <FaQuestionCircle /> },
      { label: "Envíos", href: "#envios", icon: <FaTruck /> },
      { label: "Métodos de Pago", href: "#pagos", icon: <FaCreditCard /> },
      { label: "Devoluciones", href: "#devoluciones", icon: <FaExchangeAlt /> },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Calle 67 # 54 - 297", href: "https://www.google.com/maps/place/Cl.+67+%2354-297,+Rionegro,+Antioquia/@6.1671623,-75.3763178,17z/data=!4m6!3m5!1s0x8e469fa601c90a23:0xcbec4b2b274acaac!8m2!3d6.1655256!4d-75.3761163!16s%2Fg%2F11s8xm8jr7?entry=ttu&g_ep=EgoyMDI1MDkyMS4wIKXMDSoASAFQAw%3D%3D", icon: <FaMapMarkerAlt /> },
      { label: "+57 316 0448131", href: "tel:+573160448131", icon: <FaPhone /> },
      { label: "infolinobelesa@gmail.com", href: "mailto:infolinobelesa@gmail.com", icon: <FaEnvelope /> },
    ],
    isContact: true,
  },
  {
    title: "Síguenos",
    links: [
      { label: "Facebook", href: "https://www.facebook.com/p/Linobelesa-100093308496757/", icon: <FaFacebookF /> },
      { label: "Instagram", href: "https://www.instagram.com/linobelesa/", icon: <FaInstagram /> },
      { label: "TikTok", href: "https://www.tiktok.com/@linobelesa", icon: <FaTiktok /> },
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