import React, { useState, useEffect } from 'react';
import ProductForm from '../../components/ProductForm';
import '../../styles/inventory.css';

const Inventory = () => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/all`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json();
        setError('Error al cargar productos: ' + (errorData.error || 'Error desconocido'));
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newQuantity, reason = "Ajuste manual") => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) {
        alert('Producto no encontrado');
        return;
      }

      const inventoryEntry = {
        productId: product._id,
        action: newQuantity > product.stock ? "restock" : "adjustment",
        quantity: newQuantity - product.stock,
        previousStock: product.stock,
        newStock: newQuantity,
        reason: reason
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inventoryEntry)
      });
      
      if (response.ok) {
        setProducts(products.map(p => 
          p._id === productId ? { ...p, stock: newQuantity } : p
        ));
      } else {
        const errorData = await response.json();
        alert('Error al actualizar stock: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error de conexión: ' + err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setProducts(products.filter(product => product._id !== productId));
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const getFilteredProducts = () => {
    switch (filter) {
      case 'low-stock':
        return products.filter(product => product.stock > 0 && product.stock <= 10);
      case 'out-of-stock':
        return products.filter(product => product.stock === 0);
      default:
        return products;
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { className: 'out-of-stock', text: 'Sin Stock' };
    if (stock <= 10) return { className: 'low-stock', text: 'Stock Bajo' };
    return { className: 'in-stock', text: 'En Stock' };
  };

  if (loading) return <div className="loading">Cargando inventario...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredProducts = getFilteredProducts();

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h2>Gestión de Inventario</h2>
        <button 
          className="add-product-button"
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
          }}
        >
          {showForm ? 'Ver Lista de Productos' : 'Agregar Nuevo Producto'}
        </button>
        <div className="inventory-stats">
          <div className="stat">
            <span className="number">{products.length}</span>
            <span className="label">Total Productos</span>
          </div>
          <div className="stat">
            <span className="number">{products.filter(p => p.stock === 0).length}</span>
            <span className="label">Sin Stock</span>
          </div>
          <div className="stat">
            <span className="number">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</span>
            <span className="label">Stock Bajo</span>
          </div>
        </div>
      </div>

      {showForm ? (
        <ProductForm 
          editingProduct={editingProduct}
          onSuccess={() => {
            setShowForm(false);
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      ) : (
        <div>
          <div className="inventory-filters">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Todos ({products.length})
            </button>
            <button 
              className={filter === 'low-stock' ? 'active' : ''}
              onClick={() => setFilter('low-stock')}
            >
              Stock Bajo ({products.filter(p => p.stock > 0 && p.stock <= 10).length})
            </button>
            <button 
              className={filter === 'out-of-stock' ? 'active' : ''}
              onClick={() => setFilter('out-of-stock')}
            >
              Sin Stock ({products.filter(p => p.stock === 0).length})
            </button>
          </div>
          
          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product._id}>
                      <td>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="product-thumb" 
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>
                        <div className="stock-controls">
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0;
                              const reason = newStock > product.stock ? 
                                `Reposición manual: +${newStock - product.stock}` : 
                                `Ajuste manual: ${newStock - product.stock}`;
                              updateStock(product._id, newStock, reason);
                            }}
                            min="0"
                            className="stock-input"
                          />
                          <div className="stock-buttons">
                            <button 
                              onClick={() => updateStock(
                                product._id, 
                                product.stock + 10, 
                                "Reposición: +10 unidades"
                              )}
                              className="btn-restock"
                            >
                              +10
                            </button>
                            <button 
                              onClick={() => updateStock(
                                product._id, 
                                product.stock + 50, 
                                "Reposición: +50 unidades"
                              )}
                              className="btn-restock"
                            >
                              +50
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`stock-status ${stockStatus.className}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(product)}>Editar</button>
                        <button onClick={() => handleDelete(product._id)}>Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>No hay productos que coincidan con el filtro seleccionado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;