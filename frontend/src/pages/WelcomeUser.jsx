import React, { useState, useEffect } from "react";
import "../styles/welcome-user.css";
import {
  FaHandPaper,
  FaEnvelope,
  FaCalendarAlt,
  FaBox,
  FaShoppingCart,
  FaShippingFast,
  FaUser,
  FaStar,
  FaHeart,
  FaHeadset,
  FaMagic,
  FaClock,
  FaSignOutAlt,
  FaHome
} from "react-icons/fa";

const WelcomeUser = ({ onNavigate }) => {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Obtener información del usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Actualizar la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleLogoutAndGoHome = () => {
    // Confirmar antes de cerrar sesión
    const confirmLogout = window.confirm('¿Estás seguro de que quieres cerrar sesión y volver al inicio?');
    if (confirmLogout) {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navegar al inicio
      onNavigate('inicio');
    }
  };

  const featuredProducts = [
    {
      id: 1,
      name: "Brazilian Keratina",
      image: "/src/IMG/brazilianKeratina.jpg",
      description: "Tratamiento de keratina para cabello sedoso"
    },
    {
      id: 2,
      name: "White Hair",
      image: "/src/IMG/white hear.jpg",
      description: "Productos especiales para cabello blanco"
    },
    {
      id: 3,
      name: "Cepillos Profesionales",
      image: "/src/IMG/cepillos.jpg",
      description: "Cepillos de alta calidad para todo tipo de cabello"
    }
  ];

  if (!user) {
    return (
      <div className="welcome-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      {/* Header personalizado */}
      <header className="welcome-header">
        <div className="welcome-greeting">
          <h1>{getGreeting()}, {user.name}! <FaHandPaper className="wave-icon" /></h1>
          <p className="welcome-subtitle">
            Nos alegra tenerte de vuelta en Linobelesa
          </p>
          <div className="user-info">
            <span className="user-email">
              <FaEnvelope className="info-icon" />
              {user.email}
            </span>
            <span className="user-since">
              <FaCalendarAlt className="info-icon" />
              Miembro desde: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="welcome-actions">
          <button className="nav-btn home-btn" onClick={() => onNavigate('inicio')} title="Ir al inicio">
            <FaHome />
            <span>Inicio</span>
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogoutAndGoHome} title="Cerrar sesión">
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
          <div className="welcome-logo">
            <img src="/src/IMG/logoheader.png" alt="Linobelesa" />
          </div>
        </div>
      </header>

      {/* Sección de acciones rápidas */}
      <section className="quick-actions">
        <h2>¿Qué te gustaría hacer hoy?</h2>
        <div className="actions-grid">
          <div className="action-card">
            <div className="action-icon">
              <FaBox />
            </div>
            <h3>Ver Productos</h3>
            <p>Explora nuestra colección completa</p>
            <button className="action-btn" onClick={() => onNavigate('productos')}>Explorar</button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <FaShoppingCart />
            </div>
            <h3>Mi Carrito</h3>
            <p>Revisa tus productos guardados</p>
            <button className="action-btn">Ver Carrito</button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <FaShippingFast />
            </div>
            <h3>Mis Pedidos</h3>
            <p>Rastrea tus compras</p>
            <button className="action-btn">Ver Pedidos</button>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <FaUser />
            </div>
            <h3>Mi Perfil</h3>
            <p>Actualiza tu información</p>
            <button className="action-btn" onClick={() => onNavigate('perfil')}>Editar Perfil</button>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="featured-section">
        <h2>Productos Destacados Para Ti</h2>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <button className="product-btn">Ver Detalles</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motivacional */}
      <section className="motivation-section">
        <div className="motivation-content">
          <h2><FaMagic className="magic-icon" /> Tu cabello merece lo mejor <FaMagic className="magic-icon" /></h2>
          <p>
            Cada día es una nueva oportunidad para cuidar y transformar tu cabello. 
            Con nuestros productos profesionales, lograrás los resultados que siempre has soñado.
          </p>
          <div className="motivation-stats">
            <div className="stat">
              <div className="stat-icon">
                <FaHeart />
              </div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Satisfacción</span>
            </div>
            <div className="stat">
              <div className="stat-icon">
                <FaClock />
              </div>
              <span className="stat-number">24/7</span>
              <span className="stat-label">Soporte</span>
            </div>
            <div className="stat">
              <div className="stat-icon">
                <FaStar />
              </div>
              <span className="stat-number">Premium</span>
              <span className="stat-label">Resultados</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomeUser;