import React, { useState, useEffect } from 'react';
import {
  FaShoppingCart, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaTruck, FaBox,
  FaSearch, FaFilter, FaSort, FaArrowUp, FaArrowDown, FaCalendarAlt, FaDollarSign,
  FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaSpinner, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaArrowLeft, FaDownload, FaPrint, FaPlus
} from 'react-icons/fa';
import '../../styles/ordersAdmin.css';
import { authenticatedFetch, auth } from '../../utils/auth.js';

const OrdersAdmin = ({ onNavigate }) => {
  // Estados principales
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de filtrado y búsqueda
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('fechaPedido');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Estados de vista
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Estados de operaciones
  const [operationLoading, setOperationLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('admin-dashboard');
    }
  };

  // Datos de ejemplo para demostración
  const getMockOrders = () => [
    {
      _id: '1',
      usuario: { nombre: 'María García', email: 'maria@email.com', telefono: '123-456-7890' },
      productos: [
        { _id: 'p1', nombre: 'Shampoo Aromina Bio', precio: 25.99, cantidad: 2 },
        { _id: 'p2', nombre: 'Cepillo Cabello Rizado', precio: 15.50, cantidad: 1 }
      ],
      total: 67.48,
      estado: 'Pendiente',
      fechaPedido: '2025-01-15T10:30:00Z',
      direccionEnvio: {
        direccion: 'Calle 123 #45-67',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigoPostal: '110111'
      },
      metodoPago: 'Tarjeta de Crédito',
      numeroSeguimiento: 'TRK001234567'
    },
    {
      _id: '2',
      usuario: { nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '098-765-4321' },
      productos: [
        { _id: 'p3', nombre: 'Keratina Brasileña', precio: 45.00, cantidad: 1 }
      ],
      total: 45.00,
      estado: 'Enviado',
      fechaPedido: '2025-01-10T14:20:00Z',
      direccionEnvio: {
        direccion: 'Carrera 50 #25-30',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        codigoPostal: '050001'
      },
      metodoPago: 'PSE',
      numeroSeguimiento: 'TRK001234568'
    },
    {
      _id: '3',
      usuario: { nombre: 'Ana López', email: 'ana@email.com', telefono: '555-123-4567' },
      productos: [
        { _id: 'p4', nombre: 'Set Cepillos Profesionales', precio: 35.99, cantidad: 1 },
        { _id: 'p5', nombre: 'Acondicionador Natural', precio: 18.50, cantidad: 2 }
      ],
      total: 72.99,
      estado: 'Entregado',
      fechaPedido: '2025-01-05T09:15:00Z',
      direccionEnvio: {
        direccion: 'Avenida 80 #12-34',
        ciudad: 'Cali',
        departamento: 'Valle del Cauca',
        codigoPostal: '760001'
      },
      metodoPago: 'Efectivo',
      numeroSeguimiento: 'TRK001234569'
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Verificar autenticación antes de hacer la petición
      if (!auth.hasToken()) {
        setError('No estás autenticado. Usando datos de ejemplo...');
        setOrders(getMockOrders());
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await authenticatedFetch(`${apiUrl}/pedidos`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        setError('Sesión expirada. Usando datos de ejemplo...');
        setOrders(getMockOrders());
      } else {
        setError('Error del servidor. Usando datos de ejemplo...');
        setOrders(getMockOrders());
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      
      if (err.message.includes('Token expirado') || err.message.includes('Sesión expirada')) {
        setError('Sesión expirada. Usando datos de ejemplo...');
      } else if (err.message.includes('No hay token')) {
        setError('No estás autenticado. Usando datos de ejemplo...');
      } else {
        setError('Backend no disponible. Usando datos de ejemplo...');
      }
      
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  // Funciones utilitarias
  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(order => {
        switch (filter) {
          case 'pendiente': return order.estado.toLowerCase() === 'pendiente';
          case 'enviado': return order.estado.toLowerCase() === 'enviado';
          case 'entregado': return order.estado.toLowerCase() === 'entregado';
          case 'cancelado': return order.estado.toLowerCase() === 'cancelado';
          default: return true;
        }
      });
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(order => 
        (order.numeroSeguimiento && order.numeroSeguimiento.toLowerCase().includes(search.toLowerCase())) ||
        (order.usuario && order.usuario.nombre && order.usuario.nombre.toLowerCase().includes(search.toLowerCase())) ||
        (order.usuario && order.usuario.email && order.usuario.email.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'fechaPedido':
          aValue = new Date(a.fechaPedido);
          bValue = new Date(b.fechaPedido);
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        case 'cliente':
          aValue = a.usuario?.nombre || '';
          bValue = b.usuario?.nombre || '';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Manejadores de eventos
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setOperationLoading(orderId);
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/pedidos/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      });
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, estado: newStatus } : order
        ));
        setSuccessMessage('Estado del pedido actualizado correctamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Error al actualizar estado del pedido');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      setTimeout(() => setError(''), 3000);
    } finally {
      setOperationLoading(null);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return <FaClock className="status-icon pending" />;
      case 'enviado': return <FaTruck className="status-icon shipping" />;
      case 'entregado': return <FaCheckCircle className="status-icon completed" />;
      case 'cancelado': return <FaTimesCircle className="status-icon cancelled" />;
      default: return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'pending';
      case 'enviado': return 'shipping';
      case 'entregado': return 'completed';
      case 'cancelado': return 'cancelled';
      default: return 'pending';
    }
  };

  // Calcular estadísticas
  const stats = {
    total: orders.length,
    pendiente: orders.filter(o => o.estado.toLowerCase() === 'pendiente').length,
    enviado: orders.filter(o => o.estado.toLowerCase() === 'enviado').length,
    entregado: orders.filter(o => o.estado.toLowerCase() === 'entregado').length,
    cancelado: orders.filter(o => o.estado.toLowerCase() === 'cancelado').length,
    totalRevenue: orders
      .filter(o => o.estado.toLowerCase() === 'entregado')
      .reduce((sum, order) => sum + order.total, 0)
  };

  const filteredOrders = getFilteredOrders();

  // Debug: Mostrar información básica
  console.log('OrdersAdmin render - Loading:', loading, 'Orders:', orders.length, 'Error:', error);

  if (loading) {
    return (
      <div className="orders-admin" style={{ padding: '20px' }}>
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  // Versión simplificada para debug
  return (
    <div className="orders-admin" style={{ padding: '20px', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>🛒 Gestión de Pedidos - DEBUG</h1>
      
      <div style={{ background: '#f0f0f0', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <p><strong>Estado del componente:</strong></p>
        <p>Loading: {loading ? 'Sí' : 'No'}</p>
        <p>Número de pedidos: {orders.length}</p>
        <p>Error: {error || 'Ninguno'}</p>
      </div>

      {orders.length > 0 && (
        <div style={{ background: '#e8f5e8', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
          <h3>📦 Pedidos encontrados:</h3>
          {orders.map((order, index) => (
            <div key={order._id} style={{ 
              background: 'white', 
              padding: '10px', 
              margin: '5px 0', 
              borderRadius: '3px',
              border: '1px solid #ddd'
            }}>
              <p><strong>Pedido #{index + 1}</strong></p>
              <p>Cliente: {order.usuario?.nombre}</p>
              <p>Total: ${order.total}</p>
              <p>Estado: {order.estado}</p>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div style={{ background: '#ffe8e8', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
          <p>❌ No hay pedidos para mostrar</p>
        </div>
      )}

      <button 
        onClick={handleBackToDashboard}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
};

export default OrdersAdmin;