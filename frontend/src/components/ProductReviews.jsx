import React, { useEffect, useRef, useState } from 'react';
import '../styles/product-reviews.css';
import Header from './Header';
import Footer from './Footer';

// Interactive ProductReviews with per-product drafts and rating
export default function ProductReviews({ user, onNavigate, cart = [], isAuthenticated = false, isAdmin = false, onLogout }) {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [newReviews, setNewReviews] = useState({}); // { [productId]: { rating, title, comment } }
  const [submitting, setSubmitting] = useState({}); // { [productId]: boolean }
  const textareaRefs = useRef({});

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/all`);
        const data = await res.json();
        if (mounted && Array.isArray(data)) setProducts(data);
      } catch (err) {
        console.error('Error loading products', err);
      }
    })();
    return () => { mounted = false; };
  }, [API_BASE]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews`);
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          const byProduct = data.reduce((acc, r) => {
            const pid = r.productId ? String(r.productId) : 'unknown';
            acc[pid] = acc[pid] || [];
            acc[pid].push(r);
            return acc;
          }, {});
          setReviews(byProduct);
        }
      } catch (err) {
        console.warn('Error loading reviews', err);
      }
    })();
    return () => { mounted = false; };
  }, [API_BASE]);

  const filtered = !searchTerm ? products : products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  function Star({ filled }) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? '#ffd700' : 'none'} stroke={filled ? '#ffc107' : '#ddd'} strokeWidth="1.5">
        <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847L19.335 24 12 20.202 4.665 24 6 15.595 0 9.748l8.332-1.73z" />
      </svg>
    );
  }

  function StarRating({ rating = 0, onChange = () => {}, interactive = false }) {
    const [hover, setHover] = useState(0);
    const display = hover || Number(rating || 0);
    return (
      <div className="star-rating" role="radiogroup" aria-label="Calificación">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            className={`star-btn ${interactive ? 'interactive' : ''}`}
            aria-pressed={n <= display}
            aria-label={`${n} estrellas`}
            onClick={() => interactive && onChange(n)}
            onKeyDown={(e) => { if (interactive && (e.key === 'Enter' || e.key === ' ')) onChange(n); }}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
          >
            <Star filled={n <= display} />
          </button>
        ))}
      </div>
    );
  }

  // Robust, accessible StarPicker using radio inputs
  function StarPicker({ name, value = 0, onChange = () => {} }) {
    const [hover, setHover] = useState(0);
    const display = hover || Number(value || 0);
    // render stars from 1..5
    return (
      <div className="star-picker" role="radiogroup" aria-label="Calificación">
        {[1,2,3,4,5].map(n => (
          <label
            key={n}
            className={`star-label ${display >= n ? 'filled' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={Number(value) === n}
              onChange={() => onChange(n)}
              aria-label={`${n} estrellas`}
            />
            <span className="star-visual"><Star filled={display >= n} /></span>
          </label>
        ))}
        <span style={{ marginLeft: 8, fontWeight: 600 }}>{display ? `${display}.0` : 'Sin calificar'}</span>
      </div>
    );
  }

  const openProduct = (productId) => {
    setActiveProduct(prev => prev === productId ? null : productId);
    // focus textarea after a small delay to allow DOM to render
    setTimeout(() => {
      const ref = textareaRefs.current[productId];
      if (ref && ref.focus) ref.focus();
    }, 80);
  };

  const handleChangeDraft = (productId, patch) => {
    setNewReviews(prev => {
      const next = { ...prev, [productId]: { ...(prev[productId] || { rating: 0, title: '', comment: '' }), ...patch } };
      if (import.meta.env.MODE === 'development') {
        // small debug to help reproduce rating issues
        // eslint-disable-next-line no-console
        console.debug('draft updated', productId, next[productId]);
      }
      return next;
    });
  };

  const handleSubmitReview = async (productId) => {
    const draft = newReviews[productId] || { rating: 0, title: '', comment: '' };
    if (!draft.rating || !(draft.comment || '').trim()) { alert('Completa la calificación y el comentario.'); return; }
    if (!isAuthenticated || !user) { alert('Debes iniciar sesión para publicar una reseña.'); return; }

    setSubmitting(prev => ({ ...prev, [productId]: true }));
    try {
      const token = localStorage.getItem('token');
      const body = {
        productId,
        userId: user._id || user.id || null,
        userName: user.name || user.usuario || 'Usuario',
        userAvatar: user.avatar || '',
        rating: draft.rating,
        title: draft.title || '',
        comment: draft.comment || '',
        images: []
      };
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error al publicar reseña');
      const added = data.review || data;
      setReviews(prev => ({ ...prev, [productId]: [...(prev[productId] || []), added] }));
      setNewReviews(prev => ({ ...prev, [productId]: { rating: 0, title: '', comment: '' } }));
    } catch (err) {
      console.error('post review', err);
      alert('Error publicando la reseña. Intenta otra vez.');
    } finally {
      setSubmitting(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <>
      <Header onNavigate={onNavigate} cart={cart} user={user} isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={onLogout} currentPage="reseñas" />

      <div className="product-reviews-container">
        <div className="reviews-header">
          <h3>Reseñas de Productos</h3>
          <div className="reviews-controls">
            <div className="search-bar">
              <input placeholder="Buscar productos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="products-stats">Mostrando {filtered.length} de {products.length} productos</div>

        <div className="products-grid">
          {filtered.map(product => {
            const pid = product._id;
            const draft = newReviews[pid] || { rating: 0, title: '', comment: '' };
            const isActive = activeProduct === pid;
            return (
              <div key={pid} className={`product-card ${isActive ? 'active' : ''}`} onClick={() => openProduct(pid)}>
                <img src={product.images?.[0] || '/src/IMG/placeholder.png'} loading="lazy" alt={product.name} />
                <h4>{product.name}</h4>
                {/* Static small read-only stars under the product name (avoid overflow) */}
                <div className="static-stars">
                  {(() => {
                    const list = (reviews[pid] || []);
                    const avg = list.length ? (list.reduce((s, r) => s + (Number(r.rating) || 0), 0) / list.length) : 0;
                    const roundedAvg = Math.round(avg);
                    return <StarRating rating={Number(roundedAvg)} />;
                  })()}
                </div>

                {isActive && (
                  <div className="reviews-section" onClick={e => e.stopPropagation()}>
                    {isAuthenticated && user ? (
                      <div className="new-review-form">
                        <h5>Escribe una reseña</h5>
                        <div className="rating-input">
                          <span>Tu calificación:</span>
                          <StarPicker value={draft.rating || 0} onChange={(r) => handleChangeDraft(pid, { rating: r })} />
                        </div>
                        <input type="text" placeholder="Título (opcional)" value={draft.title || ''} onChange={e => handleChangeDraft(pid, { title: e.target.value })} maxLength={100} />
                        <textarea ref={el => textareaRefs.current[pid] = el} placeholder="Comparte tu opinión..." value={draft.comment || ''} onChange={e => handleChangeDraft(pid, { comment: e.target.value })} maxLength={500} />
                        <div className="character-count">{(draft.comment || '').length}/500 caracteres</div>
                        <button disabled={submitting[pid]} onClick={() => handleSubmitReview(pid)} className={submitting[pid] ? 'submitting' : ''}>{submitting[pid] ? 'Publicando...' : 'Publicar Reseña'}</button>
                      </div>
                    ) : (
                      <div className="login-prompt"><p>Debes iniciar sesión para escribir una reseña.</p><button onClick={() => onNavigate('login')} className="login-btn">Iniciar Sesión</button></div>
                    )}

                    <div className="reviews-list">
                      {(reviews[pid] || []).length > 0 ? (reviews[pid].map(review => (
                        <div key={review._id || Math.random()} className="review-item">
                          <div className="review-header">
                            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                              {(review.userAvatar || review.avatar) && <img src={review.userAvatar || review.avatar} alt={review.userName || review.usuario} style={{width:36,height:36,borderRadius:'50%'}} />}
                              <div>
                                <strong>{review.userName || review.usuario || 'Usuario'}</strong>
                                <div style={{marginTop:4}}><StarRating rating={review.rating || 0} /></div>
                              </div>
                            </div>
                            <span className="review-date">{new Date(review.createdAt || review.fecha || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <div className="review-content">{review.title && <h5 className="review-title">{review.title}</h5>}<p>{review.comment || review.texto}</p></div>
                        </div>
                      ))) : <p className="no-reviews">No hay reseñas aún para este producto.</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
}