import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Bienvenida from "./pages/Bienvenida";
import ContactoPage from "./pages/ContactoPage";
import GaleriaPage from "./pages/GaleriaPage";
import LinobelesaPage from "./pages/LinobelesaPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UserMenuPage from "./pages/UserMenuPage";
import Products from "./pages/Products";
import WelcomeUser from "./pages/WelcomeUser";
import ProfileEdit from "./pages/ProfileEdit";

import Users from "./components/Users";
import Orders from "./components/Orders";
import Reviews from "./components/Reviews";
import Roles from "./components/Roles";
import Notifications from "./components/Notifications";
import Inventory from "./components/Inventory";
import Coupons from "./components/Coupons";
import Addresses from "./components/Addresses";

function App() {
  const [page, setPage] = useState("inicio"); // Página inicial

  // 🔹 Estado global del carrito
  const [cart, setCart] = useState([]);

  // Función para añadir al carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Función para eliminar
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const renderPage = () => {
    switch (page) {
      case "inicio":
        return <Bienvenida />;
      case "contacto":
        return <ContactoPage />;
      case "galeria":
        return <GaleriaPage />;
      case "linobelesa":
        return <LinobelesaPage />;
      case "login":
        return <LoginPage onNavigate={setPage} />;
      case "welcome":
        return <WelcomeUser onNavigate={setPage} />;
      case "perfil":
        return <ProfileEdit onNavigate={setPage} />;
      case "usuario":
        return <UserMenuPage />;
      case "productos":
        return <Products addToCart={addToCart} />;
      case "usuarios":
        return <Users />;
      case "ordenes":
        return <Orders />;
      case "reseñas":
        return <Reviews />;
      case "roles":
        return <Roles />;
      case "notificaciones":
        return <Notifications />;
      case "inventario":
        return <Inventory />;
      case "cupones":
        return <Coupons />;
      case "direcciones":
        return <Addresses />;
      default:
        return <Bienvenida />;
    }
  };

  return (
    <>
      {page !== "login" && page !== "welcome" && page !== "perfil" && (
        <Header onNavigate={setPage} cart={cart} removeFromCart={removeFromCart} />
      )}

      <main style={{ minHeight: "70vh", padding: (page === "login" || page === "welcome" || page === "perfil") ? "0" : "20px" }}>
        {renderPage()}
      </main>

      {page !== "login" && page !== "welcome" && page !== "perfil" && <Footer />}
    </>
  );
}

export default App;
