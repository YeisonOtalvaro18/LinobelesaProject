import React, { useState, useEffect } from 'react';
import '../styles/ProductForm.css';
import {
  FaBox,
  FaDollarSign,
  FaFileAlt,
  FaTags,
  FaImage,
  FaSave,
  FaEdit,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaCloudUploadAlt
} from 'react-icons/fa';

const ProductForm = ({ editingProduct, onSuccess, onCancel }) => {
  // helper to normalize image src (data:, absolute or server-relative)
  const getImageSrc = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('data:')) return img;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return img.startsWith('/') ? `${base}${img}` : `${base}/${img}`;
  };

  const [form, setForm] = useState({
    name: editingProduct?.name || "",
    price: editingProduct?.price || "",
    description: editingProduct?.description || "",
    category: editingProduct?.category || "",
    stock: editingProduct?.stock || 0,
    image: editingProduct ? (getImageSrc(editingProduct.imageUrl || editingProduct.images?.[0]) || null) : null,
    removeImage: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  const categories = [
    "Shampoo",
    "Acondicionador", 
    "Mascarillas",
    "Tratamientos",
    "Aceites",
    "Cepillos",
    "Herramientas",
    "Otros"
  ];

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        price: editingProduct.price || "",
        description: editingProduct.description || "",
        category: editingProduct.category || "",
        stock: editingProduct.stock || 0,
        image: getImageSrc(editingProduct.imageUrl || editingProduct.images?.[0]) || null,
        removeImage: false
      });
    }
  }, [editingProduct]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.price || form.price <= 0) newErrors.price = "El precio debe ser mayor a 0";
    if (!form.description.trim()) newErrors.description = "La descripción es obligatoria";
    if (!form.category) newErrors.category = "La categoría es obligatoria";
    if (!form.stock || form.stock < 0) newErrors.stock = "El stock debe ser 0 o mayor";
    if (!editingProduct && !form.image) newErrors.image = "La imagen es obligatoria";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "La imagen debe ser menor a 5MB" }));
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Debe ser un archivo de imagen" }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
        setErrors(prev => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
  const { name, price, description, category, stock, image, removeImage } = form;
      
      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}`
        : `${import.meta.env.VITE_API_URL}/api/products/add`;
        
      const method = editingProduct ? "PUT" : "POST";
      
      const productData = {
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        stock: Number(stock)
      };
      
      // Solo agregar imagen si es nueva o estamos creando
      // Nota: editingProduct.imageUrl puede haber sido normalizada con getImageSrc
      if (removeImage) {
        productData.removeImage = true;
      }

      if (image && (!editingProduct || image !== getImageSrc(editingProduct.imageUrl || editingProduct.images?.[0]))) {
        productData.image = image;
      }
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        // Resetear formulario si es creación
        if (!editingProduct) {
          setForm({
            name: "",
            price: "",
            description: "",
            category: "",
            stock: 0,
            image: null
          });
        }
        // Close form / refresh list
        onSuccess?.();
      } else {
        setErrors({ submit: data.error || data.message || "Error al guardar el producto" });
      }
    } catch (err) {
      setErrors({ submit: "Error de conexión: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            {editingProduct ? <FaEdit className="form-icon" /> : <FaBox className="form-icon" />}
          </div>
          <div className="header-text">
            <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <p>{editingProduct ? 'Modifica la información del producto' : 'Agrega un nuevo producto al inventario'}</p>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="error-message">
          <FaExclamationTriangle />
          {errors.submit}
        </div>
      )}

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">
              <FaBox className="label-icon" />
              Nombre del Producto
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ej: Shampoo Hidratante"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="price">
              <FaDollarSign className="label-icon" />
              Precio (COP)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              <FaTags className="label-icon" />
              Categoría
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="stock">
              <FaBox className="label-icon" />
              Stock Inicial
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
              className={errors.stock ? 'error' : ''}
            />
            {errors.stock && <span className="field-error">{errors.stock}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">
            <FaFileAlt className="label-icon" />
            Descripción
          </label>
          <textarea
            id="description"
            placeholder="Describe las características y beneficios del producto..."
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className={errors.description ? 'error' : ''}
            rows="4"
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="image">
            <FaImage className="label-icon" />
            Imagen del Producto
          </label>
          <div className="image-upload-container">
            <div
              className="upload-area-large"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  // forward focus to file input
                  const input = e.currentTarget.querySelector('.file-input');
                  input && input.click();
                }
              }}
              onClick={(e) => {
                const input = e.currentTarget.querySelector('.file-input');
                input && input.click();
              }}
              aria-label="Subir imagen del producto"
            >
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                disabled={form.removeImage}
              />
              <div className="upload-placeholder">
                <FaCloudUploadAlt className="upload-icon" />
                <p>Haz clic para subir una imagen</p>
                <span>PNG, JPG, GIF hasta 5MB</span>
              </div>
            </div>
            
            {form.image && (
              <div className="image-preview">
                <img src={form.image} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={() => setForm(prev => ({ ...prev, image: null }))}
                  title="Eliminar imagen"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>

        <div className="form-actions">
          <button 
            type="button"
            className="btn-cancel"
            onClick={() => {
              // Allow parent to handle closing via onCancel or onSuccess fallback
              if (onCancel) return onCancel();
              if (onSuccess) return onSuccess();
            }}
            disabled={loading}
          >
            Cancelar
          </button>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {editingProduct ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                {editingProduct ? (
                  <>
                    <FaCheck className="btn-icon" />
                    Actualizar Producto
                  </>
                ) : (
                  <>
                    <FaSave className="btn-icon" />
                    Guardar Producto
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;