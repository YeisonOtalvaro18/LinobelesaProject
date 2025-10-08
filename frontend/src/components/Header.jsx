import { useState, useEffect, useRef } from "react";
import "../styles/header.css";
import "../styles/cart.css";
import {
  FaSearch,
  FaShoppingCart,
  FaArrowUp,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Header({ onNavigate, cart = [], removeFromCart, updateCartItemQuantity, user, isAuthenticated, isAdmin, onLogout }) {
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
      { id: "inicio", label: "Inicio" },
      { id: "productos", label: "Productos" },
      { id: "reseñas", label: "Reseñas" },
      { id: "foro", label: "Foro" },
      { id: "contacto", label: "Contacto" },
    ];

    // Admin users only get admin-specific navigation
    if (isAdmin) {
      return [
        { id: "admin-dashboard", label: "Panel Admin" },
        { id: "usuarios", label: "Usuarios" },
        { id: "inventario", label: "Inventario" },
      ];
    }

    return baseMenu;
  };

  return (
    <>
      <header className={`main-header${hideHeader ? " hide-header" : ""}`}>
        <div className="container">
          {/* LOGO */}
          <div className="logo" onClick={() => onNavigate?.("inicio")}>
            <img src="/src/IMG/logoheader.png" alt="Linobelesa logo" />
            <h1>Linobelesa</h1>
          </div>

          {/* MENÚ DESKTOP */}
          <nav className="desktop-nav">
            <ul>
              {getMenuItems().map((item) => (
                <li key={item.id}>
                  <button onClick={() => onNavigate?.(item.id)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ACCIONES */}
          <div className="acciones">
            {/* Buscar */}
            <button
              className="icon-btn"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Buscar"
            >
              <FaSearch />
            </button>

            {/* Carrito con badge - Solo para clientes autenticados */}
            {isAuthenticated && !isAdmin && (
              <button
                className="icon-btn carrito-btn"
                onClick={() => setShowCart(true)}
                aria-label="Carrito"
              >
                <FaShoppingCart />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </button>
            )}

            {/* Usuario autenticado */}
            {isAuthenticated ? (
              <div className="user-menu-container">
                <button 
                  className="btn-user" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.nombre} {isAdmin && '(Admin)'}
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    {!isAdmin && (
                      <button onClick={() => { onNavigate?.("perfil"); setShowUserMenu(false); }}>
                        Mi Perfil
                      </button>
                    )}
                    {isAdmin && (
                      <button onClick={() => { onNavigate?.("admin-dashboard"); setShowUserMenu(false); }}>
                        Panel Admin
                      </button>
                    )}
                    <button onClick={() => { onLogout?.(); setShowUserMenu(false); }}>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-login" onClick={() => onNavigate?.("login")}>
                Login
              </button>
            )}

            {/* Menú Hamburguesa */}
            <button
              className="hamburger-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menú"
            >
              {showMobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú Mobile */}
      <div className={`mobile-menu ${showMobileMenu ? "active" : ""}`}>
        <nav className="mobile-nav">
          <ul>
            {getMenuItems().map((item) => (
              <li key={item.id}>
                <button onClick={() => handleMobileMenuClick(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Usuario en menú móvil */}
          <div className="mobile-user-section">
            {isAuthenticated && !isAdmin && (
              <button 
                className="mobile-cart-btn"
                onClick={() => {
                  setShowCart(true);
                  setShowMobileMenu(false);
                }}
              >
                <FaShoppingCart />
                Carrito {totalItems > 0 && `(${totalItems})`}
              </button>
            )}

            {isAuthenticated ? (
              <div className="mobile-user-menu">
                <p className="user-welcome">
                  Hola, {user?.nombre} {isAdmin && '(Admin)'}
                </p>
                {!isAdmin && (
                  <button onClick={() => { onNavigate?.("perfil"); setShowMobileMenu(false); }}>
                    Mi Perfil
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => { onNavigate?.("admin-dashboard"); setShowMobileMenu(false); }}>
                    Panel Admin
                  </button>
                )}
                <button onClick={() => { onLogout?.(); setShowMobileMenu(false); }}>
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button 
                className="mobile-login-btn"
                onClick={() => { onNavigate?.("login"); setShowMobileMenu(false); }}
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Overlay para cerrar menú mobile */}
      {showMobileMenu && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Barra buscador */}
      <div className={`buscador ${showSearch ? "visible" : ""}`}>
        <input type="text" placeholder="Buscar productos..." />
      </div>

      {/* Modal Carrito */}
      <div id="carritoModal" className={`carrito-modal ${showCart ? 'active' : ''}`} onClick={() => setShowCart(false)}>
          <div
            className={`carrito-contenido ${showCart ? 'active' : ''}`}
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
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.image || item.images?.[0] || '/src/IMG/logolinobelesa.jpg'}
                        alt={item.name}
                        className="cart-item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/src/IMG/logolinobelesa.jpg';
                        }}
                      />
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <p className="cart-item-price">
                          ${(item.price * item.qty).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div className="cart-item-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => updateCartItemQuantity(item._id, item.qty - 1)}
                          disabled={item.qty <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.qty}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => updateCartItemQuantity(item._id, item.qty + 1)}
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
                  <span>${totalPrice.toLocaleString('es-CO')}</span>
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
                      // Implementar checkout
                      alert('Función de checkout en desarrollo');
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