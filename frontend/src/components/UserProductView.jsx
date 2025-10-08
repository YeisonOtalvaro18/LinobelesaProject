import React from 'react';
import { FaStar, FaShoppingCart, FaHeart } from 'react-icons/fa';
import '../styles/UserProductView.css';

const UserProductView = ({ product }) => {
  const handleAddToCart = () => {
    console.log('Agregar al carrito:', product);
  };

  const handleAddToWishlist = () => {
    console.log('Agregar a favoritos:', product);
  };

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="user-product-view">
      <div className="product-gallery">
        <div className="main-image">
          <img src={product.image} alt={product.name} />
        </div>
      </div>

      <div className="product-details">
        <div className="product-header">
          <h1>{product.name}</h1>
          {product.brand && <span className="brand">{product.brand}</span>}
        </div>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.floor(product.rating || 4) ? 'filled' : 'empty'} 
              />
            ))}
          </div>
          <span className="rating-text">({product.reviews || 0} reseñas)</span>
        </div>

        <div className="product-price">
          {product.discount > 0 ? (
            <>
              <span className="original-price">${product.price}</span>
              <span className="discounted-price">
                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
              </span>
              <span className="discount-badge">{product.discount}% OFF</span>
            </>
          ) : (
            <span className="current-price">${product.price}</span>
          )}
        </div>

        <div className="product-description">
          <h3>Descripción</h3>
          <p>{product.description}</p>
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="product-colors">
            <h4>Colores disponibles:</h4>
            <div className="color-options">
              {product.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="color-option"
                  style={{ backgroundColor: color.startsWith('#') ? color : 'transparent' }}
                  title={color}
                >
                  {!color.startsWith('#') && <span>{color}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            <h4>Características:</h4>
            <div className="tags">
              {product.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="product-stock">
          <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </span>
        </div>

        <div className="product-actions">
          <button 
            className="btn-add-to-cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <FaShoppingCart /> Agregar al carrito
          </button>
          <button 
            className="btn-wishlist"
            onClick={handleAddToWishlist}
          >
            <FaHeart /> Favoritos
          </button>
        </div>

        {product.specifications && (
          <div className="product-specifications">
            <h3>Especificaciones</h3>
            <p>{product.specifications}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProductView;