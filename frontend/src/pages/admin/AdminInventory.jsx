import React, { useState, useEffect } from 'react';
import ProductForm from '../../components/ProductForm';
import '../../styles/inventory.css';
import {
  FaBox,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaEye,
  FaArrowUp,
  FaImage,
  FaArrowDown,
  FaFilter,
  FaSearch,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaShoppingCart,
  FaDollarSign,
  FaWarehouse,
  FaChartBar
} from 'react-icons/fa';

const Inventory = ({ onNavigate }) => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, price, stock, category
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

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
    let filtered = products;

    // Filtrar por estado de stock
    switch (filter) {
      case 'low-stock':
        filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(product => product.stock === 0);
        break;
      default:
        break;
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'price' || sortBy === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
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
      {/* Botón volver al dashboard */}
      <button 
        className="back-to-dashboard" 
        onClick={() => onNavigate && onNavigate('admin-dashboard')}
      >
        ← Volver al Dashboard
      </button>

      <div className="inventory-header">
        <div className="header-title">
          <FaWarehouse className="header-icon" />
          <h2>Gestión de Inventario</h2>
        </div>
        
        <button 
          className="add-product-button"
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
          }}
        >
          {showForm ? (
            <>
              <FaEye className="btn-icon" />
              Ver Lista de Productos
            </>
          ) : (
            <>
              <FaPlus className="btn-icon" />
              Agregar Nuevo Producto
            </>
          )}
        </button>
      </div>

      <div className="inventory-stats">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-info">
            <span className="number">{products.length}</span>
            <span className="label">Total Productos</span>
          </div>
        </div>
        <div className="stat-card no-stock">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-info">
            <span className="number">{products.filter(p => p.stock === 0).length}</span>
            <span className="label">Sin Stock</span>
          </div>
        </div>
        <div className="stat-card low-stock">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-info">
            <span className="number">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</span>
            <span className="label">Stock Bajo</span>
          </div>
        </div>
        <div className="stat-card value">
          <div className="stat-icon">
            <FaDollarSign />
          </div>
          <div className="stat-info">
            <span className="number">
              ${products.reduce((total, p) => total + (p.price * p.stock), 0).toLocaleString()}
            </span>
            <span className="label">Valor Inventario</span>
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
          {/* Barra de búsqueda y filtros */}
          <div className="inventory-controls">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="sort-container">
              <label>Ordenar por:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Nombre</option>
                <option value="category">Categoría</option>
                <option value="price">Precio</option>
                <option value="stock">Stock</option>
              </select>
              <button 
                className="sort-order"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
              </button>
            </div>
          </div>

          <div className="inventory-filters">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              <FaBox className="filter-icon" />
              Todos ({products.length})
            </button>
            <button 
              className={filter === 'low-stock' ? 'active' : ''}
              onClick={() => setFilter('low-stock')}
            >
              <FaChartBar className="filter-icon" />
              Stock Bajo ({products.filter(p => p.stock > 0 && p.stock <= 10).length})
            </button>
            <button 
              className={filter === 'out-of-stock' ? 'active' : ''}
              onClick={() => setFilter('out-of-stock')}
            >
              <FaExclamationTriangle className="filter-icon" />
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
                        <div className="product-image-container">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:8000${product.imageUrl}`}
                              alt={product.name} 
                              className="product-thumb"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.svg';
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="no-image-placeholder">
                              <FaImage className="no-image-icon" />
                              <span>Sin imagen</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="product-name-cell">
                          <span className="product-name">{product.name}</span>
                          <span className="product-id">ID: {product._id}</span>
                        </div>
                      </td>
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
                              title="Agregar 10 unidades"
                            >
                              <FaPlus /> 10
                            </button>
                            <button 
                              onClick={() => updateStock(
                                product._id, 
                                product.stock + 50, 
                                "Reposición: +50 unidades"
                              )}
                              className="btn-restock"
                              title="Agregar 50 unidades"
                            >
                              <FaPlus /> 50
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
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEdit(product)} 
                            className="btn-edit"
                            title="Editar producto"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(product._id)} 
                            className="btn-delete"
                            title="Eliminar producto"
                          >
                            <FaTrash />
                          </button>
                        </div>
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