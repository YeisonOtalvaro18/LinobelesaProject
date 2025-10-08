import React, { useState } from "react";
import "../styles/ForoPage.css";
import thumbsUp from "../IMG/me-gusta.png";
import heart from "../IMG/corazon.png";
import uploadIcon from "../IMG/subir.png";
import closeIcon from "../IMG/equis.png";

export default function ForoGaleria() {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [usuario, setUsuario] = useState("Anónimo");
  const [respuestas, setRespuestas] = useState({});
  const [archivo, setArchivo] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [archivosRespuesta, setArchivosRespuesta] = useState({});
  const [errorArchivoResp, setErrorArchivoResp] = useState({});

  // Validar archivo imagen principal
  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setErrorArchivo("Solo se permiten imágenes.");
      setArchivo(null);
      return;
    }
    setArchivo(file);
    setErrorArchivo("");
  };

  // Validar archivo imagen respuesta
  const handleArchivoRespuestaChange = (comentarioIdx, e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setErrorArchivoResp((prev) => ({
        ...prev,
        [comentarioIdx]: "Solo se permiten imágenes.",
      }));
      setArchivosRespuesta((prev) => ({ ...prev, [comentarioIdx]: null }));
      return;
    }
    setArchivosRespuesta((prev) => ({ ...prev, [comentarioIdx]: file }));
    setErrorArchivoResp((prev) => ({ ...prev, [comentarioIdx]: "" }));
  };

  // Comentar principal
  const handleComentar = () => {
    if (!nuevoComentario.trim() && !archivo) return;
    let imagen = null;
    if (archivo) {
      imagen = URL.createObjectURL(archivo);
    }
    const comentario = {
      usuario,
      texto: nuevoComentario,
      fecha: new Date().toISOString(),
      respuestas: [],
      reacciones: { corazon: 0, like: 0 },
      imagen,
    };
    setComentarios([...comentarios, comentario]);
    setNuevoComentario("");
    setArchivo(null);
    setErrorArchivo("");
  };

  // Comentar respuesta
  const handleResponder = (comentarioIdx) => {
    const texto = respuestas[comentarioIdx];
    const archivoResp = archivosRespuesta[comentarioIdx];
    if (!texto?.trim() && !archivoResp) return;
    let imagen = null;
    if (archivoResp) {
      imagen = URL.createObjectURL(archivoResp);
    }
    const respuesta = {
      usuario,
      texto,
      fecha: new Date().toISOString(),
      reacciones: { corazon: 0, like: 0 },
      imagen,
    };
    const nuevosComentarios = [...comentarios];
    nuevosComentarios[comentarioIdx].respuestas.push(respuesta);
    setComentarios(nuevosComentarios);
    setRespuestas({ ...respuestas, [comentarioIdx]: "" });
    setArchivosRespuesta({ ...archivosRespuesta, [comentarioIdx]: null });
    setErrorArchivoResp({ ...errorArchivoResp, [comentarioIdx]: "" });
  };

  // Reaccionar a comentario o respuesta
  const handleReaccion = (comentarioIdx, tipo, idxResp = null) => {
    setComentarios((prevComentarios) => {
      const nuevosComentarios = prevComentarios.map((comentario, idx) => {
        if (idx !== comentarioIdx) return comentario;
        // Clona el comentario y sus respuestas
        const nuevoComentario = { ...comentario };
        if (idxResp !== null) {
          nuevoComentario.respuestas = nuevoComentario.respuestas.map(
            (resp, rIdx) => {
              if (rIdx !== idxResp) return resp;
              return {
                ...resp,
                reacciones: {
                  ...resp.reacciones,
                  [tipo]: resp.reacciones[tipo] + 1,
                },
              };
            }
          );
        } else {
          nuevoComentario.reacciones = {
            ...nuevoComentario.reacciones,
            [tipo]: nuevoComentario.reacciones[tipo] + 1,
          };
        }
        return nuevoComentario;
      });
      return nuevosComentarios;
    });
  };

  return (
    <div className="foro-galeria">
      <h2>Foro</h2>
      <div className="nuevo-comentario">
        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe tu comentario..."
        />
        <div className="foro-upload-row">
          <label htmlFor="archivo" className="foro-upload-label">
            <img src={uploadIcon} alt="Subir archivo" width={28} height={28} />
          </label>
          <input
            id="archivo"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleArchivoChange}
          />
          <button onClick={handleComentar}>Comentar</button>
        </div>
        {errorArchivo && <div className="foro-error">{errorArchivo}</div>}
        {archivo && (
          <div className="foro-img-preview">
            <img
              src={URL.createObjectURL(archivo)}
              alt="Vista previa"
              className="foro-img-preview-img"
            />
            <button
              type="button"
              onClick={() => setArchivo(null)}
              className="foro-img-remove"
              title="Quitar imagen"
              style={{ background: "transparent", color: "inherit" }}
            >
              <img
                src={closeIcon}
                alt="Quitar"
                style={{
                  width: 22,
                  height: 22,
                  display: "block",
                  pointerEvents: "none",
                }}
              />
            </button>
          </div>
        )}
      </div>
      <div className="comentarios-lista">
        {comentarios.length === 0 ? (
          <div className="sin-comentarios">
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        ) : (
          comentarios.map((comentario, comentarioIdx) => (
            <div
              key={comentario.fecha}
              className="comentario comentario-principal"
            >
              <div className="comentario-cabecera">
                <strong>{comentario.usuario}</strong>{" "}
                <span>{new Date(comentario.fecha).toLocaleString()}</span>
              </div>
              <div className="comentario-texto">{comentario.texto}</div>
              {comentario.imagen && (
                <img
                  src={comentario.imagen}
                  alt="Imagen subida"
                  className="comentario-imagen"
                />
              )}
              <div className="comentario-reacciones">
                <button
                  onClick={() => handleReaccion(comentarioIdx, "like")}
                  title="Like"
                >
                  <img src={thumbsUp} alt="Like" width={22} height={22} />
                  {comentario.reacciones.like > 0 && (
                    <span>{comentario.reacciones.like}</span>
                  )}
                </button>
                <button
                  onClick={() => handleReaccion(comentarioIdx, "corazon")}
                  title="Corazón"
                >
                  <img src={heart} alt="Corazón" width={22} height={22} />
                  {comentario.reacciones.corazon > 0 && (
                    <span>{comentario.reacciones.corazon}</span>
                  )}
                </button>
              </div>
              {/* Respuestas */}
              <div>
                {comentario.respuestas.length > 0 && (
                  <div>
                    {comentario.respuestas.map((resp, idx) => (
                      <div key={resp.fecha} className="respuesta">
                        <div>
                          <strong>{resp.usuario}</strong>{" "}
                          <span>{new Date(resp.fecha).toLocaleString()}</span>
                        </div>
                        <div>{resp.texto}</div>
                        {resp.imagen && (
                          <img
                            src={resp.imagen}
                            alt="Imagen respuesta"
                            className="respuesta-imagen"
                          />
                        )}
                        <div className="comentario-reacciones">
                          <button
                            onClick={() =>
                              handleReaccion(comentarioIdx, "like", idx)
                            }
                            title="Like"
                          >
                            <img
                              src={thumbsUp}
                              alt="Like"
                              width={18}
                              height={18}
                            />
                            {resp.reacciones.like > 0 && (
                              <span>{resp.reacciones.like}</span>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleReaccion(comentarioIdx, "corazon", idx)
                            }
                            title="Corazón"
                          >
                            <img
                              src={heart}
                              alt="Corazón"
                              width={18}
                              height={18}
                            />
                            {resp.reacciones.corazon > 0 && (
                              <span>{resp.reacciones.corazon}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Formulario de respuesta */}
                <div className="responder" style={{ position: "relative" }}>
                  <textarea
                    value={respuestas[comentarioIdx] || ""}
                    onChange={(e) =>
                      setRespuestas({
                        ...respuestas,
                        [comentarioIdx]: e.target.value,
                      })
                    }
                    placeholder="Responder..."
                  />
                  <div className="foro-upload-row">
                    <label
                      htmlFor={`archivo-resp-${comentarioIdx}`}
                      className="foro-upload-label"
                    >
                      <img
                        src={uploadIcon}
                        alt="Subir archivo"
                        width={22}
                        height={22}
                      />
                    </label>
                    <input
                      id={`archivo-resp-${comentarioIdx}`}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleArchivoRespuestaChange(comentarioIdx, e)
                      }
                    />
                    <button onClick={() => handleResponder(comentarioIdx)}>
                      Responder
                    </button>
                  </div>
                  {errorArchivoResp[comentarioIdx] && (
                    <div className="foro-error">
                      {errorArchivoResp[comentarioIdx]}
                    </div>
                  )}
                  {archivosRespuesta[comentarioIdx] && (
                    <div className="foro-img-preview">
                      <img
                        src={URL.createObjectURL(
                          archivosRespuesta[comentarioIdx]
                        )}
                        alt="Vista previa respuesta"
                        className="foro-img-preview-img"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setArchivosRespuesta((prev) => ({
                            ...prev,
                            [comentarioIdx]: null,
                          }))
                        }
                        className="foro-img-remove"
                        title="Quitar imagen"
                        style={{ background: "transparent", color: "inherit" }}
                      >
                        <img
                          src={closeIcon}
                          alt="Quitar"
                          style={{
                            width: 22,
                            height: 22,
                            display: "block",
                            pointerEvents: "none",
                          }}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}