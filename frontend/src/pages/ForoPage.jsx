// Normaliza los datos recibidos de MongoDB
function normalizarComentario(comentario) {
  return {
    ...comentario,
    _id: comentario._id?.$oid || comentario._id,
    reacciones: {
      corazon: comentario.reacciones?.corazon?.$numberInt
        ? Number(comentario.reacciones.corazon.$numberInt)
        : comentario.reacciones?.corazon || 0,
      like: comentario.reacciones?.like?.$numberInt
        ? Number(comentario.reacciones.like.$numberInt)
        : comentario.reacciones?.like || 0,
    },
    respuestas: (comentario.respuestas || []).map(resp => ({
      ...resp,
      _id: resp._id?.$oid || resp._id,
      reacciones: {
        corazon: resp.reacciones?.corazon?.$numberInt
          ? Number(resp.reacciones.corazon.$numberInt)
          : resp.reacciones?.corazon || 0,
        like: resp.reacciones?.like?.$numberInt
          ? Number(resp.reacciones.like.$numberInt)
          : resp.reacciones?.like || 0,
      }
    }))
  };
}
import React, { useState, useEffect } from "react";
import Reviews from "../components/Reviews";
  // Eliminar comentario
  const handleEliminarComentario = async (comentarioId) => {
    try {
      // Aquí deberías tener Reviews.delete(comentarioId) implementado en backend y Reviews.jsx
      await Reviews.delete(comentarioId);
      setComentarios(comentarios.filter((c) => c._id !== comentarioId));
    } catch {
      setError("No se pudo eliminar el comentario.");
    }
  };
import "../styles/foro-galeria.css";

export default function ForoPage({ user, isAuthenticated }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const usuario = user?.nombre || user?.name || user?.email || "Anónimo";
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [reaccionando, setReaccionando] = useState({});

  // Cargar comentarios al montar
  useEffect(() => {
    Reviews.getAll()
      .then((data) => {
        const normalizados = Array.isArray(data) ? data.map(normalizarComentario) : [];
        setComentarios(normalizados);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los comentarios.");
        setCargando(false);
      });
  }, []);

  // Comentar principal
  const handleComentar = async () => {
    if (!nuevoComentario.trim()) return;
    const comentario = {
      usuario,
      texto: nuevoComentario,
      fecha: new Date().toISOString(),
      respuestas: [],
      reacciones: { corazon: 0, like: 0 },
    };
    try {
      const guardado = await Reviews.create(comentario);
      setComentarios([...comentarios, guardado]);
      setNuevoComentario("");
    } catch {
      setError("No se pudo guardar el comentario.");
    }
  };

  // Comentar respuesta
  const handleResponder = async (comentarioId) => {
    const texto = respuestas[comentarioId];
    if (!texto || !texto.trim()) return;
    const comentarioExiste = comentarios.some((c) => c._id === comentarioId);
    if (!comentarioExiste) {
      setError("No se puede responder: el comentario no existe o fue eliminado.");
      return;
    }
    const respuesta = {
      usuario,
      texto,
      fecha: new Date().toISOString(),
      reacciones: { corazon: 0, like: 0 },
    };
    try {
      const actualizado = await Reviews.addReply(comentarioId, respuesta);
      setComentarios(
        comentarios.map((c) => (c._id === comentarioId ? actualizado : c))
      );
      setRespuestas({ ...respuestas, [comentarioId]: "" });
    } catch {
      setError("No se pudo guardar la respuesta.");
    }
  };

  // Reaccionar a comentario o respuesta
  const handleReaccion = async (comentarioId, tipo, idxResp = null) => {
    if (!comentarioId) return; // Evita reaccionar si no hay ID
    setReaccionando({ [comentarioId]: true });
    try {
      let actualizado;
      if (idxResp !== null) {
        actualizado = await Reviews.reactReply(comentarioId, idxResp, tipo);
      } else {
        actualizado = await Reviews.react(comentarioId, tipo);
      }
      setComentarios(
        comentarios.map((c) => (c._id === comentarioId ? actualizado : c))
      );
    } catch {
      setError("No se pudo registrar la reacción.");
    }
    setReaccionando({});
  };

  return (
    <div className="foro-galeria">
      <h2>Foro</h2>
      <div className="nuevo-comentario">
        <div className="comentario-cabecera">
          <strong>{usuario}</strong>
        </div>
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe tu comentario..."
        />
        <button onClick={handleComentar}>Comentar</button>
      </div>
      <div className="comentarios-lista">
        {cargando ? (
          <div className="sin-comentarios">
            <p>Cargando comentarios...</p>
          </div>
        ) : error ? (
          <div className="sin-comentarios">
            <p>{error}</p>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="sin-comentarios">
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        ) : (
          comentarios.map((comentario) => (
            <div key={comentario._id || comentario.fecha}>
              <div className="comentario-cabecera">
                <strong>{comentario.usuario}</strong>{" "}
                <span>{new Date(comentario.fecha).toLocaleString()}</span>
                {isAuthenticated && (usuario === comentario.usuario) && (
                  <button
                    className="eliminar-comentario"
                    title="Eliminar comentario"
                    onClick={() => handleEliminarComentario(comentario._id)}
                    style={{ marginLeft: 12, color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1em' }}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="comentario-texto">{comentario.texto}</div>
              <div className="comentario-reacciones">
                <button
                  disabled={!!reaccionando[comentario._id]}
                  onClick={() =>
                    comentario._id && handleReaccion(comentario._id, "corazon")
                  }
                  title="Corazón"
                >
                  ❤️ {comentario.reacciones?.corazon || 0}
                </button>
                <button
                  disabled={!!reaccionando[comentario._id]}
                  onClick={() =>
                    comentario._id && handleReaccion(comentario._id, "like")
                  }
                  title="Like"
                >
                  👍 {comentario.reacciones?.like || 0}
                </button>
              </div>
              {/* Respuestas */}
              <div>
                {comentario.respuestas && comentario.respuestas.length > 0 && (
                  <div>
                    {comentario.respuestas.map((resp, idx) => (
                      <div key={resp._id || idx} className="respuesta">
                        <div>
                          <strong>{resp.usuario}</strong>{" "}
                          <span>{new Date(resp.fecha).toLocaleString()}</span>
                        </div>
                        <div>{resp.texto}</div>
                        <div className="comentario-reacciones">
                          <button
                            disabled={!!reaccionando[comentario._id]}
                            onClick={() =>
                              comentario._id &&
                              handleReaccion(comentario._id, "corazon", idx)
                            }
                            title="Corazón"
                          >
                            ❤️ {resp.reacciones?.corazon || 0}
                          </button>
                          <button
                            disabled={!!reaccionando[comentario._id]}
                            onClick={() =>
                              comentario._id &&
                              handleReaccion(comentario._id, "like", idx)
                            }
                            title="Like"
                          >
                            👍 {resp.reacciones?.like || 0}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Formulario de respuesta */}
                <div className="responder">
                  <textarea
                    value={respuestas[comentario._id] || ""}
                    onChange={(e) =>
                      setRespuestas({
                        ...respuestas,
                        [comentario._id]: e.target.value,
                      })
                    }
                    placeholder="Responder..."
                    disabled={!comentario._id}
                  />
                  <button
                    onClick={() => handleResponder(comentario._id)}
                    disabled={!comentario._id}
                  >
                    Responder
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
