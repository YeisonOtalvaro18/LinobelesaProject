import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth } from "./utils/auth.js";

import Bienvenida from "./pages/Bienvenida";
import ContactoPage from "./pages/ContactoPage";
import ForoPage from "./pages/ForoPage";
import LinobelesaPage from "./pages/LinobelesaPage";
import LoginPage from "./pages/LoginPage";
import UserMenuPage from "./pages/UserMenuPage";
import WelcomeUser from "./pages/WelcomeUser";
import ProfileEdit from "./pages/ProfileEdit";
import Products from "./pages/Products";
import ResetPassword from "./pages/ResetPassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/UsersAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import Reviews from "./components/Reviews";
import ProductReviews from "./components/ProductReviews";
import Roles from "./pages/admin/RolesAdmin";
import Notifications from "./pages/admin/AdminNotifications";
import Inventory from "./pages/admin/AdminInventory";
import Coupons from "./components/Coupons";
import Addresses from "./pages/admin/AdminAddresses";
import Checkout from "./components/Checkout";
import OrderTracking from "./components/OrderTracking";

function App() {
  // Recuperar la página guardada o usar "inicio" como predeterminado
  const [page, setPage] = useState(() => {
    return localStorage.getItem("currentPage") || "inicio";
  });
  const [user, setUser] = useState(null); // Usuario autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [urlParams, setUrlParams] = useState(new URLSearchParams(window.location.search));
  const [headerOffset, setHeaderOffset] = useState(0);

  // 🔹 Estado global del carrito - Recuperar del localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Función para cambiar página y guardarla en localStorage
  const handlePageChange = (newPage) => {
    setPage(newPage);
    localStorage.setItem("currentPage", newPage);
  };

  // Función para actualizar carrito y guardarlo en localStorage
  const updateCart = (newCart) => {
    setCart(newCart);
    try {
      // Guardar una versión simplificada sin las imágenes base64 pesadas
      const lightCart = newCart.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        category: item.category,
        description: item.description,
        // Solo guardar una referencia pequeña a la imagen, no el base64 completo
        image: item.image?.startsWith('data:') ? null : item.image,
        images: item.images?.filter(img => !img.startsWith('data:')) || []
      }));
      localStorage.setItem("cart", JSON.stringify(lightCart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      // Si aún así falla, guardar solo IDs y cantidades
      try {
        const minimalCart = newCart.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty
        }));
        localStorage.setItem("cart", JSON.stringify(minimalCart));
      } catch (fallbackError) {
        console.error("Error saving minimal cart:", fallbackError);
        // Como último recurso, limpiar el carrito del localStorage
        localStorage.removeItem("cart");
      }
    }
  };

  // Efecto para manejar parámetros de URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlParams(params);
    
    // Si hay un parámetro 'page' en la URL, cambiar a esa página
    const pageParam = params.get('page');
    if (pageParam) {
      setPage(pageParam);
    }
  }, []);

  // Medir ancho de ventana y ajustar offset del header fijo en móvil
  useEffect(() => {
    const computeHeaderOffset = () => {
      const w = window.innerWidth;
      if (w <= 480) return 75; // coincide con header.css (altura 75px)
      if (w <= 768) return 90; // coincide con header.css (altura 90px)
      return 0; // en desktop el header es sticky y no saca del flow
    };

    const updateOffset = () => setHeaderOffset(computeHeaderOffset());
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const savedPage = localStorage.getItem("currentPage");

    if (token && userData) {
      // Verificar si el token ha expirado
      if (auth.isTokenExpired(token)) {
        console.log('Token expirado, limpiando datos de autenticación');
        auth.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
        setPage("login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Validar si la página guardada es accesible para el usuario
        const userRole = parsedUser.role || parsedUser.rol;
        const isAdminUser = userRole === "admin" || parsedUser.isAdmin === true;
        
        // Páginas que requieren autenticación
        const authPages = ["welcome", "perfil", "productos", "checkout", "seguimiento", "reseñas"];
        
        // Páginas exclusivas de admin
        const adminPages = ["admin-dashboard", "usuarios", "ordenes", "roles", "notificaciones", "inventario", "cupones"];
        
        // Si la página guardada requiere autenticación y no está autenticado, ir a inicio
        if (savedPage && authPages.includes(savedPage) && !token) {
          handlePageChange("inicio");
        }
        // Si la página guardada es de admin y no es admin, redirigir apropiadamente
        else if (savedPage && adminPages.includes(savedPage) && !isAdminUser) {
          handlePageChange("inicio");
        }
        // Si es admin e intenta acceder a páginas de cliente, redirigir a dashboard
        else if (isAdminUser && savedPage && !adminPages.includes(savedPage) && savedPage !== "login") {
          handlePageChange("admin-dashboard");
        }
        
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("currentPage");
        localStorage.removeItem("cart");
        updateCart([]);
        handlePageChange("inicio");
      }
    } else {
      // Si no hay autenticación, verificar que la página guardada no requiera auth
      const publicPages = ["inicio", "contacto", "foro", "linobelesa", "login"];
      if (savedPage && !publicPages.includes(savedPage)) {
        handlePageChange("inicio");
      }
    }
  }, []);

  // Función para manejar login exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Redirigir según el rol - Verificar la estructura correcta
    const userRole = userData.role || userData.rol;
    const isAdminUser = userRole === "admin" || userData.isAdmin === true;

    if (isAdminUser) {
      handlePageChange("admin-dashboard");
    } else {
      handlePageChange("welcome");
    }
  };

  // Función para logout
  const handleLogout = () => {
    auth.clearAuth();
    localStorage.removeItem("cart");
    setUser(null);
    setIsAuthenticated(false);
    updateCart([]);
    handlePageChange("inicio");
  };

  // Verificar si el usuario tiene permisos de admin
  const isAdmin = user?.role === "admin" || user?.isAdmin === true;

  // Redirigir automáticamente a admin si es admin e intenta acceder a páginas normales
  useEffect(() => {
    if (
      isAdmin &&
      page !== "admin-dashboard" &&
      ![
        "usuarios",
        "ordenes",
        "reseñas",
        "roles",
        "notificaciones",
        "inventario",
        "cupones",
        "direcciones",
        "login",
      ].includes(page)
    ) {
      handlePageChange("admin-dashboard");
    }
  }, [isAdmin, page]);

    // Función para añadir al carrito
  const addToCart = (product) => {
    const newCart = ((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // Normalizar campo `image` tomando la primera de `images` si existe,
      // así garantizamos que la imagen visible en catálogo se propague al carrito
      const normalized = {
        ...product,
        qty: 1,
        image: product.image || (product.images && product.images[0]) || "",
      };
      return [...prev, normalized];
    })(cart);
    updateCart(newCart);
  };

  // Función para eliminar del carrito
  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item._id !== id);
    updateCart(newCart);
  };

  // Función para actualizar cantidad
  const updateCartItemQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = cart.map((item) =>
      item._id === id ? { ...item, qty: newQuantity } : item
    );
    updateCart(newCart);
  };

  // Interceptar la alerta usada en Header para el botón "Finalizar Compra"
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      try {
        if (typeof msg === "string" && msg.toLowerCase().includes("checkout")) {
          handlePageChange("checkout");
          return;
        }
      } catch (err) {
        console.error(err);
      }
      originalAlert(msg);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Manejar envío del pedido
  const handleOrderSubmit = async (order) => {
    const sanitize = (ord) => {
      const items = (ord.items || []).map((it) => {
        const imgs = (it.images || []).filter(
          (img) => typeof img === "string" && !img.startsWith("data:")
        );
        const image =
          it.image &&
          typeof it.image === "string" &&
          !it.image.startsWith("data:")
            ? it.image
            : imgs[0] || "";
        return { ...it, images: imgs, image };
      });
      return { ...ord, items };
    };

    const existing = JSON.parse(localStorage.getItem("orders") || "[]");
    const id = `ORD-${Date.now()}`;
    const toSave = { ...sanitize(order), _id: id };
    existing.push(toSave);
    localStorage.setItem("orders", JSON.stringify(existing));
    updateCart([]);
    handlePageChange("seguimiento");
    alert(`Pedido creado: ${id}`);
  };

  const renderPage = () => {
    switch (page) {
      case "inicio":
        return <Bienvenida />;
      case "contacto":
        return <ContactoPage />;
      case "foro":
        return <ForoPage user={user} isAuthenticated={isAuthenticated} />;
      case "linobelesa":
        return <LinobelesaPage />;
      case "login":
        return (
          <LoginPage onNavigate={handlePageChange} onLoginSuccess={handleLoginSuccess} />
        );
      case "reset-password":
        return <ResetPassword onNavigate={handlePageChange} token={urlParams.get('token')} />;
      case "welcome":
        return <WelcomeUser onNavigate={handlePageChange} user={user} />;
      case "perfil":
        return <ProfileEdit onNavigate={handlePageChange} user={user} />;
      case "usuario":
        return <UserMenuPage />;
      case "productos":
        return (
          <Products
            addToCart={addToCart}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
          />
        );
      case "checkout":
        return (
          <Checkout
            cart={cart}
            onSubmit={handleOrderSubmit}
            clearCart={() => updateCart([])}
            user={user}
          />
        );
      case "seguimiento": {
        const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        return <OrderTracking orders={storedOrders} />;
      }
      case "activate":
        return <Bienvenida />;

      // Páginas exclusivas del admin
      case "admin-dashboard":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <AdminDashboard user={user} onNavigate={handlePageChange} />;
      case "usuarios":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Users onNavigate={handlePageChange} />;
      case "ordenes":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <OrdersAdmin onNavigate={handlePageChange} />;
      case "reseñas":
        if (isAdmin) {
          return <Reviews onNavigate={handlePageChange} />;
        } else {
          return (
            <ProductReviews
              user={user}
              onNavigate={handlePageChange}
              cart={cart}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onLogout={handleLogout}
            />
          );
        }
      case "roles":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Roles onNavigate={handlePageChange} />;
      case "notificaciones":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Notifications onNavigate={handlePageChange} />;
      case "inventario":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Inventory onNavigate={handlePageChange} />;
      case "cupones":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Coupons onNavigate={handlePageChange} />;
      case "direcciones":
        return <Addresses onNavigate={handlePageChange} />;
      default:
        return <Bienvenida />;
    }
  };

  const isAdminPage = [
    "admin-dashboard",
    "usuarios",
    "ordenes",
    "reseñas",
    "roles",
    "notificaciones",
    "inventario",
    "cupones",
    "direcciones",
  ].includes(page);

  return (
    <>
      {page !== "login" &&
        page !== "welcome" &&
        page !== "perfil" &&
        !isAdminPage && (
          <Header
            onNavigate={handlePageChange}
            cart={cart}
            removeFromCart={removeFromCart}
            updateCartItemQuantity={updateCartItemQuantity}
            user={user}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            onLogout={handleLogout}
            currentPage={page}
          />
        )}

      <main
        style={{
          minHeight: isAdminPage ? "100vh" : "70vh",
          paddingTop:
            (page !== "login" && page !== "welcome" && page !== "perfil" && !isAdminPage)
              ? headerOffset
              : 0,
          paddingLeft:
            page === "login" ||
            page === "welcome" ||
            page === "perfil" ||
            isAdminPage
              ? 0
              : 20,
          paddingRight:
            page === "login" ||
            page === "welcome" ||
            page === "perfil" ||
            isAdminPage
              ? 0
              : 20,
          paddingBottom:
            page === "login" ||
            page === "welcome" ||
            page === "perfil" ||
            isAdminPage
              ? 0
              : 20,
          backgroundColor: isAdminPage ? "#f8f9fa" : "transparent",
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {renderPage()}
      </main>

      {page !== "login" &&
        page !== "welcome" &&
        page !== "perfil" &&
        !isAdminPage && <Footer />}
    </>
  );
}

export default App;
