import React, { useState, useEffect } from 'react';
import ProductForm from '../../components/ProductForm';

const AdminProductManager = ({ onNavigate }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Cargar producto para editar desde localStorage
  useEffect(() => {
    const productToEdit = localStorage.getItem('editingProduct');
    if (productToEdit) {
      try {
        setEditingProduct(JSON.parse(productToEdit));
      } catch (error) {
        console.error('Error parsing editing product:', error);
        localStorage.removeItem('editingProduct');
      }
    }
  }, []);

  const handleProductSubmit = async (productData) => {
    setLoading(true);
    try {
      // Aquí iría la lógica para enviar al backend
      console.log('Datos del producto (Admin):', productData);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Limpiar localStorage y redirigir al inventario
      localStorage.removeItem('editingProduct');
      onNavigate('inventario');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('editingProduct');
    onNavigate('inventario');
  };

  return (
    <div className="admin-product-manager">
      <ProductForm
        editingProduct={editingProduct}
        onSubmit={handleProductSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
};

export default AdminProductManager;