import React from "react";
import { useState } from "react";
import "../styles/bienvenida.css";



function Bienvenida() {
  const [search, setSearch] = useState("");

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
      {/* SECCIÓN PRINCIPAL */}
      <div className="div-cont-prin">
        <ul>
          <li>
            <h1>Descubre el poder de un cabello sano!</h1>
          </li>
          <li>
            <p>
              Bienvenida al lugar donde la belleza comienza desde la raíz. ¿Estás
              lista para transformar tu melena en su mejor versión? Con nuestros
              productos innovadores, cada hebra recibe el cuidado que merece:
              nutrición profunda, protección duradera y un estilo que habla por
              ti.
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
            src="/src/IMG/brazilianKeratina.jpg"
            alt="keratina-brazilia"
            className="brazilian"
          />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img
            src="/src/IMG/white hear.jpg"
            alt="white-hair"
            className="brazilian"
          />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img
            src="/src/IMG/cepillos.jpg"
            alt="cepillos"
            className="brazilian"
          />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/Loreal.jpg" alt="loreal" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
        <div className="divs-cont-ga">
          <img src="/src/IMG/Fauno.jpg" alt="fauno" className="brazilian" />
          <button className="btn-gal-Ini">Ver en Galería</button>
        </div>
      </div>

      {/* EVENTOS */}
      <h1 className="title-gal">Eventos</h1>
      <div className="div-eve">
        <div className="divs-cont-eve">
          <img src="/src/IMG/Event1.jpg" alt="evento1" className="im-ev" />
          <button className="btn-gal-Inir">Algunos eventos</button>
        </div>
        <div className="divs-cont-eve">
          <img src="/src/IMG/Evento1.jpg" alt="evento2" className="im-ev" />
          <button className="btn-gal-Inir">Algunos eventos</button>
        </div>
        <div className="divs-cont-eve">
          <img src="/src/IMG/Event2.jpg" alt="evento3" className="im-ev" />
          <button className="btn-gal-Inir">Algunos eventos</button>
        </div>
      </div>

      {/* EMPRESA */}
      <div className="div-empr">
        <div className="div-emprs1">
          <div className="div-emprs1-img">
            <img src="/src/IMG/exper.jpg" alt="experiencia" className="expe-img" />
          </div>
        </div>
        <div className="div-emprs2">
          <h1 className="test">Testimonios</h1>
          <img src="/src/IMG/testpo.png" alt="testimonio" className="testimonio-img" />
          <h1 className="ty">¿Quiénes somos?</h1>
        </div>
        <div className="div-emprs3">
          <img src="/src/IMG/chicas.jpg" alt="chicas" className="chic" />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="fot">
        <div className="fot-2">
          <button className="btnfot">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="currentColor"
              className="bi bi-cart3"
              viewBox="0 0 16 16"
            >
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <br />
            Haz tu pedido
          </button>
        </div>
      </footer>

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

export default Bienvenida;
