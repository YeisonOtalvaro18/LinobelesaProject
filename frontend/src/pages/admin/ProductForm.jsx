import React, { useState } from 'react';
import '../../styles/ProductForm.css';

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null,
    brand: '',
    specifications: '',
    status: 'active'
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch('http://localhost:4000/api/products/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Producto agregado exitosamente' });
        setProduct({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          image: null,
          brand: '',
          specifications: '',
          status: 'active'
        });
        setPreviewImage(null);
      } else {
        throw new Error(data.message || 'Error al agregar el producto');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>Agregar Nuevo Producto</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Producto</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Precio</label>
            <input
              type="number"
              id="price"
              name="price"
              value={product.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={product.stock}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              name="category"
              value={product.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="shampoo">Shampoo</option>
              <option value="acondicionador">Acondicionador</option>
              <option value="tratamiento">Tratamiento</option>
              <option value="styling">Styling</option>
              <option value="aceites">Aceites</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="brand">Marca</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={product.brand}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="specifications">Especificaciones</label>
          <textarea
            id="specifications"
            name="specifications"
            value={product.specifications}
            onChange={handleInputChange}
            placeholder="Ingrese las especificaciones del producto"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Imagen del Producto</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            required
          />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Vista previa" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            value={product.status}
            onChange={handleInputChange}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;