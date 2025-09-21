import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Products from "./components/Products"; // Ejemplo de vista principal
import "./styles/global.css";

/**
 * App.jsx
 * Punto principal de la aplicación React
 * Aquí se integran el Header, Footer y la vista activa
 */
function App() {
  return (
    <>
      {/* Encabezado fijo con navegación */}
      <Header />

      {/* Contenido principal (ejemplo: Products) */}
      <main style={{ minHeight: "70vh" }}>
        <Products />
      </main>

      {/* Footer fijo en la parte inferior */}
      <Footer />
    </>
  );
}

export default App;
