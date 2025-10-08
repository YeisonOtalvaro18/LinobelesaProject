import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Bienvenida from "./pages/Bienvenida";
import ContactoPage from "./pages/ContactoPage";
import ForoPage from "./pages/ForoPage";
import LinobelesaPage from "./pages/LinobelesaPage";
import LoginPage from "./pages/LoginPage";
import UserMenuPage from "./pages/UserMenuPage";
import Products from "./pages/Products";
import WelcomeUser from "./pages/WelcomeUser";
import ProfileEdit from "./pages/ProfileEdit";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Orders from "./components/Orders";
import Reviews from "./components/Reviews";
import ProductReviews from "./components/ProductReviews";
import Roles from "./pages/admin/Roles";
import Notifications from "./components/Notifications";
import Inventory from "./pages/admin/Inventory";
import Coupons from "./components/Coupons";
import Addresses from "./components/Addresses";

function App() {
  const [page, setPage] = useState("inicio"); // Página inicial
  const [user, setUser] = useState(null); // Usuario autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Estado global del carrito
  const [cart, setCart] = useState([]);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Función para manejar login exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Redirigir según el rol - Verificar la estructura correcta
    const userRole = userData.role || userData.rol;
    const isAdminUser = userRole === 'admin' || userData.isAdmin === true;
    
    if (isAdminUser) {
      setPage("admin-dashboard");
    } else {
      setPage("welcome");
    }
  };

  // Función para logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setPage("inicio");
  };

  // Verificar si el usuario tiene permisos de admin - Nueva estructura
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;
  const isClient = user?.role === 'cliente' || user?.role === 'customer' || (!isAdmin && user);

  // Redirigir automáticamente a admin si es admin e intenta acceder a páginas normales
  useEffect(() => {
    if (isAdmin && page !== "admin-dashboard" && !["usuarios", "ordenes", "reseñas", "roles", "notificaciones", "inventario", "cupones", "direcciones", "login"].includes(page)) {
      setPage("admin-dashboard");
    }
  }, [isAdmin, page]); // Solo dependemos de isAdmin y page, no de user

  // Función para añadir al carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Función para eliminar del carrito
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Función para actualizar cantidad
  const updateCartItemQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: newQuantity } : item
      )
    );
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
        return <LoginPage onNavigate={setPage} onLoginSuccess={handleLoginSuccess} />;
      case "welcome":
        return <WelcomeUser onNavigate={setPage} user={user} />;
      case "perfil":
        return <ProfileEdit onNavigate={setPage} user={user} />;
      case "usuario":
        return <UserMenuPage />;
      case "productos":
        // Solo admin puede gestionar productos, clientes solo ven catálogo
        return <Products addToCart={addToCart} isAdmin={isAdmin} isAuthenticated={isAuthenticated} />;
      
      // Páginas exclusivas del admin
      case "admin-dashboard":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <AdminDashboard user={user} onNavigate={setPage} />;
      case "usuarios":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Users onNavigate={setPage} />;
      case "ordenes":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Orders onNavigate={setPage} />;
      case "reseñas":
        if (isAdmin) {
          return <Reviews onNavigate={setPage} />;
        } else {
          return <ProductReviews user={user} />;
        }
      case "roles":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Roles onNavigate={setPage} />;
      case "notificaciones":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Notifications onNavigate={setPage} />;
      case "inventario":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Inventory onNavigate={setPage} />;
      case "cupones":
        if (!isAdmin) return <div>Acceso denegado</div>;
        return <Coupons onNavigate={setPage} />;
      case "direcciones":
        return <Addresses />;
      default:
        return <Bienvenida />;
    }
  };

  // Verificar si estamos en páginas de administración
  const isAdminPage = [
    "admin-dashboard", 
    "usuarios", 
    "ordenes", 
    "reseñas", 
    "roles", 
    "notificaciones", 
    "inventario", 
    "cupones"
  ].includes(page);

  return (
    <>
      {page !== "login" && page !== "welcome" && page !== "perfil" && !isAdminPage && (
        <Header
          onNavigate={setPage}
          cart={cart}
          removeFromCart={removeFromCart}
          updateCartItemQuantity={updateCartItemQuantity}
          user={user}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}

      <main
        style={{
          minHeight: isAdminPage ? "100vh" : "70vh",
          padding: (page === "login" || page === "welcome" || page === "perfil" || isAdminPage)
              ? "0"
              : "20px",
          backgroundColor: isAdminPage ? "#f8f9fa" : "transparent"
        }}
      >
        {renderPage()}
      </main>

      {page !== "login" && page !== "welcome" && page !== "perfil" && !isAdminPage && (
        <Footer />
      )}
    </>
  );
}

export default App;
