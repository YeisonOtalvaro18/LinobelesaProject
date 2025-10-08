import React, { useState } from "react";
import "../styles/reviews.css";

function Reviews() {
  const [comentarios, setComentarios] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.comentario;
    if (input.value.trim() !== "") {
      setComentarios([...comentarios, input.value]);
      input.value = "";
    }
  };

  return (
    <section className="foro-section">
      <h1 className="foro-title">Foro de la comunidad</h1>
      <div className="foro-card">
        {/* Lista de comentarios */}
        <div className="foro-comentarios">
          {comentarios.length === 0 ? (
            <p className="sin-comentarios">
              Sé la primera en dejar tu comentario 
            </p>
          ) : (
            <ul>
              {comentarios.map((c, i) => (
                <li key={i} className="comentario">
                  <strong>Usuario {i + 1}:</strong> {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Formulario abajo */}
        <form className="foro-form" onSubmit={handleSubmit}>
          <textarea
            name="comentario"
            placeholder="Escribe tu opinión o pregunta..."
            required
          ></textarea>
          <button type="submit">Publicar</button>
        </form>
      </div>
    </section>
  );
}

export default Reviews;