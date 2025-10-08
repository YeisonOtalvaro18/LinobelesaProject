import React, { useState, useEffect } from "react";
import "../styles/bienvenida.css";

function Inicio() {
  const [search, setSearch] = useState("");
  const [carruselIndex, setCarruselIndex] = useState(0);

  // Imágenes del carrusel
  const carruselImgs = [
    "/src/IMG/cinco.png",
    "/src/IMG/cuatro.png",
    "/src/IMG/tres.png",
    "/src/IMG/dos.png",
  ];

  // Cambio automático cada 3 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % carruselImgs.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carruselImgs.length]);

  // Ejemplo de productos (puedes reemplazarlo con los que tengas en tu proyecto)
  const productos = [
    "Brazilian Keratina",
    "White Hair",
    "Cepillos",
    "L'Oréal",
    "Fauno",
  ];

  const filtrados = productos.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cont-princ">
      {/* Carrusel automático con fondo atractivo */}
      <div className="carrusel-bienvenida-interactivo">
        <img
          src={carruselImgs[carruselIndex]}
          alt={`carrusel-${carruselIndex}`}
          className="carrusel-img-fija"
        />
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="div-cont-prin">
        <ul>
          <li>
            <h1>Descubre el poder de un cabello sano!</h1>
          </li>
          <li>
            <p>
              Bienvenida al lugar donde la belleza comienza desde la raíz.
              ¿Estás lista para transformar tu melena en su mejor versión? Con
              nuestros productos innovadores, cada hebra recibe el cuidado que
              merece: nutrición profunda, protección duradera y un estilo que
              habla por ti.
              <br />
              Explora nuestra amplia gama de tratamientos diseñados para cada
              tipo de cabello desde rizos rebeldes hasta lisos sedosos y déjate
              sorprender por fórmulas que combinan ciencia y naturaleza para
              resultados visibles desde el primer uso.
            </p>
          </li>
          <li>
            <p>✨ Tu cabello merece brillar con confianza ✨</p>
          </li>
        </ul>
      </div>

      <div className="div-cont-prin">
        <img
          src="/src/IMG/cuida.jpg"
          alt="IMG linobelesa"
          className="img-lino-prin"
        />
      </div>

      {/* GALERÍA */}
      <h1 className="title-gal">Galería</h1>
      <div className="div-gal">
        <div className="divs-cont-ga">
          <img
            src="/src/IMG/cuatro.png"
            alt="keratina-brazilia"
            className="brazilian"
          />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/uno.png" alt="white-hair" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/dos.png" alt="cepillos" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/tres.png" alt="loreal" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/cinco.png" alt="fauno" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/seis.png" alt="fauno" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
      </div>

      {/* EVENTOS */}
      <h1 className="title-gal">Eventos</h1>
      <div className="div-eve">
        <div className="divs-cont-eve">
          <img
            src="/src/IMG/crespa-de-lado.avif"
            alt="evento1"
            className="im-ev"
          />
          <button className="btn-gal-Inir">Algunos eventos</button>
        </div>
        <div className="divs-cont-eve">
          <img src="/src/IMG/evento.png" alt="evento2" className="im-ev" />
          <button className="btn-gal-Inir">Algunos eventos</button>
        </div>
        <div className="divs-cont-eve">
          <img src="/src/IMG/crespa.avif" alt="evento3" className="im-ev" />
          <button className="btn-gal-Inir">Algunos eventos</button>
        </div>
      </div>

      {/* TESTIMONIOS */}
      <section className="testimonios-section">
        <h1 className="test">Testimonios</h1>
        <div className="testimonios-grid">
          <img
            src="/src/IMG/testpo.png"
            alt="testimonio1"
            className="testimonio-img"
          />
          <img
            src="/src/IMG/chicas.jpg"
            alt="testimonio2"
            className="testimonio-img"
          />
          <img
            src="/src/IMG/exper.jpg"
            alt="testimonio3"
            className="testimonio-img"
          />
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="quienes-section">
        <h1 className="test">¿Quiénes somos?</h1>
        <div className="mision-vision">
          <div className="mision">
            <h2>Misión</h2>
            <p>
              En Linobelesa fabricamos productos capilares de alta calidad,
              elaborados con ingredientes naturales, innovadores y seguros, para
              cuidar la salud y belleza del cabello de nuestros clientes. Nos
              comprometemos con la excelencia en cada fórmula, promoviendo el
              bienestar, la confianza personal y el respeto por el medio
              ambiente.
            </p>
          </div>
          <div className="vision">
            <h2>Visión</h2>
            <p>
              En el año 2030 Linobelesa será una marca líder y reconocida en el
              mercado nacional e internacional por ofrecer soluciones capilares
              efectivas, naturales y sostenibles, que fortalezcan la identidad y
              el autoestima de las personas, consolidándonos como un referente
              en innovación, calidad y responsabilidad social.
            </p>
          </div>
        </div>
      </section>

      {/* BUSCADOR */}
      <div className="buscador">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LISTA DE PRODUCTOS FILTRADOS */}
      <ul id="lista-productos">
        {filtrados.map((prod, i) => (
          <li key={i}>{prod}</li>
        ))}
      </ul>
    </div>
  );
}

export default Inicio;
