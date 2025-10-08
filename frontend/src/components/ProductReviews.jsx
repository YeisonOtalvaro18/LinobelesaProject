import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import "../styles/product-reviews.css";
import Header from "./Header";
import Footer from "./Footer";

// SVG Icons personalizados
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
  </svg>
);

const LaughIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const SadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
  </svg>
);

const StarFilledIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffd700">
    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z"/>
  </svg>
);

const StarEmptyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.77 5.82 22 7 13.87 2 9l6.91-.74L12 2z"/>
  </svg>
);

export default function ProductReviews({
  user,
  onNavigate,
  cart = [],
  isAuthenticated = false,
  isAdmin = false,
  onLogout,
}) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterRating, setFilterRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Cargar productos con mejor manejo de errores
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const apiUrl = `${baseUrl}/api`;
        
        // Timeout de 15 segundos para dar más margen
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${apiUrl}/products/all`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validar que data sea un array
        if (Array.isArray(data)) {
          setProducts(data);
          setFilteredProducts(data);
        } else {
          console.warn('Los productos recibidos no son un array:', data);
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Carga de productos cancelada por timeout');
        } else {
          console.error("Error cargando productos:", error);
        }
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Cargar reseñas de forma asíncrona sin bloquear
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const apiUrl = `${baseUrl}/api`;
        
        // Timeout de 10 segundos para reviews
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${apiUrl}/reviews`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        // Validar que data sea un array antes de usar reduce
        if (Array.isArray(data)) {
          const reviewsByProduct = data.reduce((acc, review) => {
            if (!acc[review.productId]) {
              acc[review.productId] = [];
            }
            acc[review.productId].push(review);
            return acc;
          }, {});
          setReviews(reviewsByProduct);
        } else {
          console.warn('Las reseñas recibidas no son un array:', data);
          setReviews({});
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Carga de reseñas cancelada por timeout');
        } else {
          console.error("Error cargando reseñas:", error);
        }
        setReviews({});
      }
    };
    
    // Cargar reviews con un pequeño delay para no bloquear la UI
    const timer = setTimeout(() => {
      fetchReviews();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = [...products];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por rating
    if (filterRating > 0) {
      filtered = filtered.filter(product => {
        const avgRating = Number(getAverageRating(product._id));
        return avgRating >= filterRating;
      });
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return Number(getAverageRating(b._id)) - Number(getAverageRating(a._id));
        case 'reviews':
          return (reviews[b._id]?.length || 0) - (reviews[a._id]?.length || 0);
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, reviews, searchTerm, sortBy, filterRating]);

  const handleSubmitReview = async (productId) => {
    if (!newReview.rating || !newReview.comment.trim()) {
      alert("Por favor, proporciona una calificación y un comentario.");
      return;
    }

    if (!isAuthenticated || !user) {
      alert("Debes iniciar sesión para escribir una reseña.");
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const apiUrl = `${baseUrl}/api`;
      const response = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          productId,
          usuario: user.name || user.usuario || 'Usuario Anónimo',
          texto: newReview.comment,
          rating: newReview.rating,
          imagenes: [] // Por ahora sin imágenes, se puede agregar después
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Actualizar reseñas localmente
        setReviews((prev) => ({
          ...prev,
          [productId]: [...(prev[productId] || []), data.review],
        }));
        // Resetear formulario
        setNewReview({ rating: 0, comment: "" });
        alert("¡Reseña publicada exitosamente!");
      } else {
        throw new Error(data.message || "Error al publicar la reseña");
      }
    } catch (error) {
      console.error("Error añadiendo reseña:", error);
      alert("Error al publicar la reseña. Por favor, intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Función para agregar reacciones
  const handleReaction = async (reviewId, tipo) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const apiUrl = `${baseUrl}/api`;
      const response = await fetch(`${apiUrl}/reviews/${reviewId}/reaccion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Actualizar reseñas localmente
        setReviews((prev) => {
          const newReviews = { ...prev };
          Object.keys(newReviews).forEach(productId => {
            newReviews[productId] = newReviews[productId].map(review => 
              review._id === reviewId ? data.review : review
            );
          });
          return newReviews;
        });
      }
    } catch (error) {
      console.error("Error agregando reacción:", error);
    }
  };

  const getAverageRating = (productId) => {
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce(
      (sum, review) => sum + (review.rating || 5), // Default rating 5 si no existe
      0
    );
    return (total / productReviews.length).toFixed(1);
  };

  const StarRating = ({ rating, onRatingChange, interactive = false }) => {
    return (
      <div className="star-rating" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            disabled={!interactive}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '2px', 
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {star <= rating ? <StarFilledIcon /> : <StarEmptyIcon />}
          </button>
        ))}
      </div>
    );
  };

  const ReactionButtons = ({ review }) => {
    const reacciones = review.reacciones || { corazon: 0, like: 0, risa: 0, triste: 0 };
    
    return (
      <div className="reaction-buttons">
        <button 
          className="reaction-btn"
          onClick={() => handleReaction(review._id, 'corazon')}
          title="Me encanta"
        >
          <HeartIcon /> {reacciones.corazon || 0}
        </button>
        <button 
          className="reaction-btn"
          onClick={() => handleReaction(review._id, 'like')}
          title="Me gusta"
        >
          <ThumbsUpIcon /> {reacciones.like || 0}
        </button>
        <button 
          className="reaction-btn"
          onClick={() => handleReaction(review._id, 'risa')}
          title="Me divierte"
        >
          <LaughIcon /> {reacciones.risa || 0}
        </button>
        <button 
          className="reaction-btn"
          onClick={() => handleReaction(review._id, 'triste')}
          title="Me entristece"
        >
          <SadIcon /> {reacciones.triste || 0}
        </button>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Cargando productos...</p>
    </div>
  );

  return (
    <>
      <Header
        onNavigate={onNavigate}
        cart={cart}
        user={user}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={onLogout}
      />

      <div className="product-reviews-container">
        <div className="reviews-header">
          <h3>Reseñas de Productos</h3>
          <div className="reviews-controls">
            <div className="search-bar">
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="sort-control">
                <SortIcon />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">Nombre</option>
                  <option value="rating">Calificación</option>
                  <option value="reviews">Número de reseñas</option>
                  <option value="price">Precio</option>
                </select>
              </div>
              
              <div className="rating-filter">
                <FilterIcon />
                <select 
                  value={filterRating} 
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                >
                  <option value={0}>Todas las calificaciones</option>
                  <option value={4}>4+ estrellas</option>
                  <option value={3}>3+ estrellas</option>
                  <option value={2}>2+ estrellas</option>
                  <option value={1}>1+ estrellas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        
        <div className="products-stats">
          <p>Mostrando {filteredProducts.length} de {products.length} productos</p>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? filteredProducts.map((product) => (
            <div
              key={product._id}
              className={`product-card ${
                activeProduct === product._id ? "active" : ""
              }`}
              onClick={() =>
                setActiveProduct(
                  activeProduct === product._id ? null : product._id
                )
              }
            >
              <img
                src={product.images?.[0] || "/src/IMG/placeholder.png"}
                alt={product.name}
              />
              <h4>{product.name}</h4>
              <div className="rating-summary">
                <StarRating rating={Number(getAverageRating(product._id))} />
                <span>({reviews[product._id]?.length || 0} reseñas)</span>
              </div>

              {activeProduct === product._id && (
                <div className="reviews-section">
                  {isAuthenticated && user ? (
                    <div className="new-review-form">
                      <h5>Escribe una reseña</h5>
                      <div className="rating-input">
                        <span>Tu calificación:</span>
                        <StarRating
                          rating={newReview.rating}
                          onRatingChange={(rating) =>
                            setNewReview((prev) => ({ ...prev, rating }))
                          }
                          interactive={true}
                        />
                      </div>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                        placeholder="Comparte tu opinión sobre este producto..."
                        maxLength={500}
                      />
                      <div className="character-count">
                        {newReview.comment.length}/500 caracteres
                      </div>
                      <button 
                        onClick={() => handleSubmitReview(product._id)}
                        disabled={submitting || !newReview.rating || !newReview.comment.trim()}
                        className={submitting ? 'submitting' : ''}
                      >
                        {submitting ? 'Publicando...' : 'Publicar Reseña'}
                      </button>
                    </div>
                  ) : (
                    <div className="login-prompt">
                      <p>Debes iniciar sesión para escribir una reseña.</p>
                      <button onClick={() => onNavigate('login')} className="login-btn">
                        Iniciar Sesión
                      </button>
                    </div>
                  )}

                  <div className="reviews-list">
                    {reviews[product._id]?.length > 0 ? (
                      reviews[product._id].map((review) => (
                        <div key={review._id} className="review-item">
                          <div className="review-header">
                            <div className="review-user-info">
                              <strong>{review.usuario || review.userName || 'Usuario'}</strong>
                              <StarRating rating={review.rating || 5} />
                            </div>
                            <span className="review-date">
                              {new Date(review.fecha || review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="review-content">
                            <p>{review.texto || review.comment}</p>
                            
                            {/* Mostrar imágenes si las hay */}
                            {review.imagenes && review.imagenes.length > 0 && (
                              <div className="review-images">
                                {review.imagenes.map((img, index) => (
                                  <div key={index} className="review-image">
                                    <img src={img.url} alt={img.descripcion} />
                                    <p className="image-desc">{img.descripcion}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Botones de reacción */}
                          <ReactionButtons review={review} />

                          {/* Respuestas */}
                          {review.respuestas && review.respuestas.length > 0 && (
                            <div className="respuestas">
                              <h6>Respuestas:</h6>
                              {review.respuestas.map((respuesta) => (
                                <div key={respuesta._id} className="respuesta-item">
                                  <strong>{respuesta.usuario}</strong>
                                  <p>{respuesta.texto}</p>
                                  <span className="respuesta-fecha">
                                    {new Date(respuesta.fecha).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Botón para responder */}
                          {isAuthenticated && (
                            <button className="reply-btn">
                              <ReplyIcon /> Responder
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-reviews">
                        No hay reseñas aún para este producto.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="no-products">
              <div className="no-products-content">
                <h4>No se encontraron productos</h4>
                <p>
                  {searchTerm || filterRating > 0
                    ? "Intenta ajustar los filtros de búsqueda."
                    : "No hay productos disponibles para mostrar reseñas."}
                </p>
                {(searchTerm || filterRating > 0) && (
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterRating(0);
                    }}
                    className="clear-filters-btn"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
