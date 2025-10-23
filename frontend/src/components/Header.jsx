import { useState, useEffect, useRef } from "react";
import "../styles/header.css";
import "../styles/cart.css";
import {
  FaSearch,
  FaShoppingCart,
  FaArrowUp,
  FaBars,
  FaTimes,
  FaHome,
  FaBox,
  FaStar,
  FaComments,
  FaEnvelope,
  FaUser,
  FaUserShield,
  FaUsers,
  FaWarehouse,
  FaSignOutAlt,
  FaChevronDown,
  FaUserCircle
} from "react-icons/fa";
import { formatPrice } from '../utils/formatPrice';

function Header({
  onNavigate,
  cart = [],
  removeFromCart,
  updateCartItemQuantity,
  user,
  isAuthenticated,
  isAdmin,
  onLogout,
  currentPage,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll.current && currentScroll > 60) {
        setHideHeader(true); // Bajando
      } else {
        setHideHeader(false); // Subiendo
      }
      lastScroll.current = currentScroll;
      setShowScrollTop(currentScroll > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMobileMenuClick = (page) => {
    onNavigate?.(page);
    setShowMobileMenu(false);
  };

  // Calcular total de productos
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Menú según el rol del usuario
  const getMenuItems = () => {
    const baseMenu = [
      { id: "inicio", label: "Inicio", icon: <FaHome /> },
      { id: "productos", label: "Productos", icon: <FaBox /> },
      { id: "reseñas", label: "Reseñas", icon: <FaStar /> },
      { id: "foro", label: "Foro", icon: <FaComments /> },
      { id: "contacto", label: "Contacto", icon: <FaEnvelope /> },
    ];

    // Admin users only get admin-specific navigation
    if (isAdmin) {
      return [
        { id: "admin-dashboard", label: "Panel Admin", icon: <FaUserShield /> },
        { id: "usuarios", label: "Usuarios", icon: <FaUsers /> },
        { id: "inventario", label: "Inventario", icon: <FaWarehouse /> },
      ];
    }

    return baseMenu;
  };

  return (

    <>
      <header className={`main-header${hideHeader ? " hide-header" : ""}`}>
        <div className="container">
          <div className="header-left">
            {/* LOGO */}
            <div className="logo" onClick={() => onNavigate?.("inicio")}> 
              <img src="/src/IMG/logoheader.png" alt="Linobelesa logo" />
              <h1>Linobelesa</h1>
            </div>
            {/* Hamburguesa solo en móvil */}
            <button
              className="hamburger-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menú"
            >
              {showMobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
          {/* MENÚ DESKTOP */}
          <nav className="desktop-nav">
            <ul>
              {getMenuItems().map((item) => (
                <li key={item.id}>
                  <button onClick={() => onNavigate?.(item.id)}>
                    <span className="nav-text">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* ACCIONES DESKTOP: Carrito y Login */}
          <div className="acciones acciones-desktop">
            {/* Buscar solo en productos */}
            {currentPage === 'productos' && (
              <button
                className="icon-btn"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Buscar"
                style={{ fontSize: '1.2rem' }}
              >
                <FaSearch style={{ fontSize: '1.2rem' }} />
              </button>
            )}
            {/* Carrito Desktop */}
            {isAuthenticated && !isAdmin && (
              <button
                className="icon-btn cart-desktop-btn"
                onClick={() => setShowCart(true)}
                aria-label="Carrito"
                style={{ position: 'relative', marginLeft: '16px', fontSize: '1.3rem' }}
              >
                <FaShoppingCart />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </button>
            )}
            {/* Login/Perfil Desktop */}
            {!isAuthenticated ? (
              <button
                className="icon-btn login-desktop-btn"
                onClick={() => onNavigate?.("login")}
                aria-label="Iniciar Sesión"
                style={{ marginLeft: '16px', fontSize: '1.3rem' }}
              >
                <FaUserCircle />
                <span className="nav-text" style={{ marginLeft: '6px' }}>Iniciar Sesión</span>
              </button>
            ) : (
              <button
                className="icon-btn perfil-desktop-btn"
                onClick={() => onNavigate?.(isAdmin ? "admin-dashboard" : "perfil")}
                aria-label="Perfil"
                style={{ marginLeft: '16px', fontSize: '1.3rem' }}
              >
                <FaUserCircle />
                <span className="nav-text" style={{ marginLeft: '6px' }}>{user?.name || `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || user?.username || 'Usuario'} {isAdmin && "(Admin)"}</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Menú Mobile */}
      <div className={`mobile-menu ${showMobileMenu ? "active" : ""}`}>
        <nav className="mobile-nav">
          <div className="mobile-menu-top">
            {isAuthenticated && !isAdmin && (
              <button
                className="mobile-cart-btn"
                onClick={() => {
                  setShowCart(true);
                  setShowMobileMenu(false);
                }}
                style={{ marginBottom: '16px', width: '100%' }}
              >
                <FaShoppingCart style={{ marginRight: '8px' }} />
                Carrito {totalItems > 0 && `(${totalItems})`}
              </button>
            )}
            {isAuthenticated ? (
              <div className="mobile-user-menu" style={{ marginBottom: '16px', width: '100%' }}>
                <p className="user-welcome" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {user?.name || `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || user?.username || 'Usuario'} {isAdmin && "(Admin)"}
                </p>
                {!isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate?.("perfil");
                      setShowMobileMenu(false);
                    }}
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    Mi Perfil
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate?.("admin-dashboard");
                      setShowMobileMenu(false);
                    }}
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    Panel Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout?.();
                    setShowMobileMenu(false);
                  }}
                  style={{ width: '100%' }}
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                className="mobile-login-btn"
                onClick={() => {
                  onNavigate?.("login");
                  setShowMobileMenu(false);
                }}
                style={{ width: '100%' }}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
          <ul>
            {getMenuItems().map((item) => (
              <li key={item.id}>
                <button onClick={() => handleMobileMenuClick(item.id)} style={{ width: '100%' }}>
                  <span className="nav-text">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Barra buscador */}
      <div className={`buscador ${showSearch ? "visible" : ""}`}>
        <input type="text" placeholder="Buscar productos..." />
      </div>
      {/* Modal Carrito */}
      <div
        id="carritoModal"
        className={`carrito-modal ${showCart ? "active" : ""}`}
        onClick={() => setShowCart(false)}
      >
        <div
          className={`carrito-contenido ${showCart ? "active" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Carrito de Compras</h3>
          {cart.length === 0 ? (
            <div className="cart-empty">
              <FaShoppingCart />
              <p>Tu carrito está vacío</p>
              <p>¡Agrega algunos productos!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img
                      src={
                        item.image ||
                        item.images?.[0] ||
                        "/src/IMG/logolinobelesa.jpg"
                      }
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/IMG/logolinobelesa.jpg";
                      }}
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">
                        ${formatPrice(Number(item.price) * Number(item.qty))}
                      </p>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateCartItemQuantity(item._id, item.qty - 1)
                        }
                        disabled={item.qty <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.qty}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          updateCartItemQuantity(item._id, item.qty + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id)}
                        title="Eliminar producto"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Total:</span>
                <span>${formatPrice(totalPrice)}</span>
              </div>
              <div className="cart-actions">
                <button
                  className="cart-button continue-btn"
                  onClick={() => setShowCart(false)}
                >
                  Seguir Comprando
                </button>
                <button
                  className="cart-button checkout-btn"
                  onClick={() => {
                    // Navegar al checkout
                    setShowCart(false);
                    onNavigate?.("checkout");
                  }}
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Botón flotante volver arriba */}
      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={handleScrollToTop}
          aria-label="Volver arriba"
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
}

export default Header;