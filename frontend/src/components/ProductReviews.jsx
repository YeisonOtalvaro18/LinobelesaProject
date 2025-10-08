import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import '../styles/product-reviews.css';

export default function ProductReviews({ user }) {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/all`);
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando productos:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Cargar reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`);
        const data = await response.json();
        const reviewsByProduct = data.reduce((acc, review) => {
          if (!acc[review.productId]) {
            acc[review.productId] = [];
          }
          acc[review.productId].push(review);
          return acc;
        }, {});
        setReviews(reviewsByProduct);
      } catch (error) {
        console.error('Error cargando reseñas:', error);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (productId) => {
    if (!newReview.rating || !newReview.comment.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          userId: user._id,
          userName: user.name,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar reseñas localmente
        setReviews(prev => ({
          ...prev,
          [productId]: [...(prev[productId] || []), data.review]
        }));
        // Resetear formulario
        setNewReview({ rating: 0, comment: '' });
      }
    } catch (error) {
      console.error('Error añadiendo reseña:', error);
    }
  };

  const getAverageRating = (productId) => {
    const productReviews = reviews[productId] || [];
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / productReviews.length).toFixed(1);
  };

  const StarRating = ({ rating, onRatingChange, interactive = false }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && onRatingChange(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            {star <= rating ? <FaStar className="star-filled" /> : <FaRegStar className="star-empty" />}
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div className="loading">Cargando productos...</div>;

  return (
    <div className="product-reviews-container">
      <h3>Reseñas de Productos</h3>
      <div className="products-grid">
        {products.map(product => (
          <div 
            key={product._id} 
            className={`product-card ${activeProduct === product._id ? 'active' : ''}`}
            onClick={() => setActiveProduct(activeProduct === product._id ? null : product._id)}
          >
            <img src={product.images?.[0] || '/src/IMG/placeholder.png'} alt={product.name} />
            <h4>{product.name}</h4>
            <div className="rating-summary">
              <StarRating rating={Number(getAverageRating(product._id))} />
              <span>({reviews[product._id]?.length || 0} reseñas)</span>
            </div>
            
            {activeProduct === product._id && (
              <div className="reviews-section">
                {user && (
                  <div className="new-review-form">
                    <h5>Escribe una reseña</h5>
                    <StarRating 
                      rating={newReview.rating} 
                      onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                      interactive={true}
                    />
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Comparte tu opinión sobre este producto..."
                    />
                    <button onClick={() => handleSubmitReview(product._id)}>
                      Publicar Reseña
                    </button>
                  </div>
                )}

                <div className="reviews-list">
                  {reviews[product._id]?.length > 0 ? (
                    reviews[product._id].map(review => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <strong>{review.userName}</strong>
                          <StarRating rating={review.rating} />
                        </div>
                        <p>{review.comment}</p>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-reviews">No hay reseñas aún para este producto.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}