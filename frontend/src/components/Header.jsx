import { useState, useEffect, useRef } from "react";
import "../styles/header.css";
import { FaSearch, FaShoppingCart, FaArrowUp, FaBars, FaTimes } from "react-icons/fa";

function Header({ onNavigate, cart = [], removeFromCart }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
              {["inicio", "productos", "galeria", "contacto"].map((item) => (
                <li key={item}>
                  <button onClick={() => onNavigate?.(item)}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
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

            {/* Carrito con badge */}
            <button
              className="icon-btn carrito-btn"
              onClick={() => setShowCart(true)}
              aria-label="Carrito"
            >
              <FaShoppingCart />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {/* Login */}
            <button className="btn-login" onClick={() => onNavigate?.("login")}>
              Login
            </button>

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
      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <nav className="mobile-nav">
          <ul>
            {["inicio", "productos", "galeria", "contacto"].map((item) => (
              <li key={item}>
                <button onClick={() => handleMobileMenuClick(item)}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              </li>
            ))}
          </ul>
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
      {showCart && (
        <div id="carritoModal" onClick={() => setShowCart(false)}>
          <div
            className="carrito-contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Carrito de Compras</h3>
            <ul>
              {cart.length === 0 ? (
                <li>No hay productos en el carrito</li>
              ) : (
                cart.map((item) => (
                  <li key={item.id}>
                    {item.name} x{item.qty} - ${item.price * item.qty}
                    <button onClick={() => removeFromCart(item.id)}>❌</button>
                  </li>
                ))
              )}
            </ul>
            {cart.length > 0 && (
              <p className="carrito-total">Total: ${totalPrice}</p>
            )}
            <button onClick={() => setShowCart(false)}>Cerrar</button>
          </div>
        </div>
      )}

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

