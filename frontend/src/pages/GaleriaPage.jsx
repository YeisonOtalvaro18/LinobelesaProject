import React from "react";
import "../styles/galeria.css";
export default function GaleriaPage() {
  return (
    <>
      <section className="galeria">
        <h1>Galería</h1>
        <div className="imagenes">
          <img src="/IMG/producto1.jpg" alt="Producto 1" />
          <img src="/IMG/producto2.jpg" alt="Producto 2" />
        </div>
      </section>
    </>
  );
}