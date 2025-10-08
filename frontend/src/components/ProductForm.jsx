import React, { useState } from 'react';
import '../styles/ProductForm.css';

const ProductForm = ({ editingProduct, onSuccess }) => {
  const [form, setForm] = useState({
    name: editingProduct?.name || "",
    price: editingProduct?.price || "",
    description: editingProduct?.description || "",
    category: editingProduct?.category || "",
    image: editingProduct?.images?.[0] || null
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, price, description, category, image } = form;
    if (!name || !price || !description || !category || (!editingProduct && !image)) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}`
        : `${import.meta.env.VITE_API_URL}/api/products/add`;
        
      const method = editingProduct ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          name, 
          price: Number(price), 
          description, 
          category,
          image: image || undefined // Solo enviamos la imagen si hay una nueva
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setForm({
          name: "",
          price: "",
          description: "",
          category: "",
          image: null
        });
        onSuccess?.();
      } else {
        alert("Error al guardar: " + (data.error || "Error desconocido"));
      }
    } catch (err) {
      alert("Error de conexión: " + err.message);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nombre del Producto</label>
        <input
          id="name"
          type="text"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Precio</label>
        <input
          id="price"
          type="number"
          placeholder="Precio"
          value={form.price}
          onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          placeholder="Descripción del producto"
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Categoría</label>
        <input
          id="category"
          type="text"
          placeholder="Categoría"
          value={form.category}
          onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Imagen</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={!editingProduct}
        />
        {form.image && (
          <div className="image-preview">
            <img src={form.image} alt="Preview" />
          </div>
        )}
      </div>

      <button type="submit" className="submit-button">
        {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
      </button>
    </form>
  );
};

export default ProductForm;