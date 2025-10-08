import React, { useState, useEffect } from 'react';
import '../../styles/ReviewsAdmin.css';

const ReviewsAdmin = ({ onNavigate }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, approved, pending, rejected
  const [search, setSearch] = useState('');

  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('admin-dashboard');
    }
  };

  // Calculate statistics
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.estado === 'aprobado').length;
  const pendingReviews = reviews.filter(r => r.estado === 'pendiente').length;
  const rejectedReviews = reviews.filter(r => r.estado === 'rechazado').length;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data);
        setError('');
      } else {
        setError(data.message || 'Error al cargar reseñas');
        // Mostrar datos mock en caso de error
        setReviews(getMockReviews());
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión al servidor');
      // Mostrar datos mock en caso de error
      setReviews(getMockReviews());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const getMockReviews = () => [
    {
      _id: '1',
      usuario: 'María García',
      email: 'maria@email.com',
      producto: 'Champú Aromina Bio',
      calificacion: 5,
      comentario: 'Excelente producto, mi cabello se siente más suave y brillante.',
      fecha: '2024-01-15T10:30:00Z',
      estado: 'aprobado'
    },
    {
      _id: '2',
      usuario: 'Carlos López',
      email: 'carlos@email.com',
      producto: 'Keratina Brasileña',
      calificacion: 4,
      comentario: 'Muy buen resultado, aunque tardó un poco en llegar.',
      fecha: '2024-01-14T14:20:00Z',
      estado: 'pendiente'
    },
    {
      _id: '3',
      usuario: 'Ana Rodríguez',
      email: 'ana@email.com',
      producto: 'Cepillo Cabello Rizado',
      calificacion: 3,
      comentario: 'El producto está bien pero esperaba mejor calidad por el precio.',
      fecha: '2024-01-13T16:45:00Z',
      estado: 'pendiente'
    },
    {
      _id: '4',
      usuario: 'Luis Martínez',
      email: 'luis@email.com',
      producto: 'Jabón Natural',
      calificacion: 1,
      comentario: 'Producto de muy mala calidad, no lo recomiendo.',
      fecha: '2024-01-12T09:15:00Z',
      estado: 'rechazado'
    },
    {
      _id: '5',
      usuario: 'Sofía Hernández',
      email: 'sofia@email.com',
      producto: 'Set Cuidado Capilar',
      calificacion: 5,
      comentario: 'Increíble resultado! Mi cabello nunca se había visto tan saludable.',
      fecha: '2024-01-11T12:00:00Z',
      estado: 'aprobado'
    }
  ];

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(review => {
        switch (filter) {
          case 'approved': return review.estado === 'aprobado';
          case 'pending': return review.estado === 'pendiente';
          case 'rejected': return review.estado === 'rechazado';
          default: return true;
        }
      });
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(review => 
        review.usuario.toLowerCase().includes(search.toLowerCase()) ||
        review.producto.toLowerCase().includes(search.toLowerCase()) ||
        review.comentario.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      });
      
      if (response.ok) {
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, estado: newStatus } : review
        ));
      } else {
        alert('Error al actualizar estado de la reseña');
      }
    } catch (err) {
      alert('Error de conexión al servidor');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'aprobado': return 'approved';
      case 'pendiente': return 'pending';
      case 'rechazado': return 'rejected';
      default: return 'pending';
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div className="loading">Cargando reseñas...</div>;
  if (error && reviews.length === 0) return <div className="error">{error}</div>;

  const filteredReviews = getFilteredReviews();

  return (
    <div className="reviews-management">
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        ← Volver al Dashboard
      </button>
      
      <div className="reviews-header">
        <h2>Gestión de Reseñas</h2>
        <div className="reviews-stats">
          <div className="stat">
            <span className="number">{totalReviews}</span>
            <span className="label">Total Reseñas</span>
          </div>
          <div className="stat">
            <span className="number">{approvedReviews}</span>
            <span className="label">Aprobadas</span>
          </div>
          <div className="stat">
            <span className="number">{pendingReviews}</span>
            <span className="label">Pendientes</span>
          </div>
          <div className="stat">
            <span className="number">{rejectedReviews}</span>
            <span className="label">Rechazadas</span>
          </div>
        </div>
      </div>

      <div className="reviews-tools">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por usuario, producto o comentario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="reviews-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todas ({totalReviews})
        </button>
        <button
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Aprobadas ({approvedReviews})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({pendingReviews})
        </button>
        <button
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rechazadas ({rejectedReviews})
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error} - Mostrando datos de demostración
        </div>
      )}

      <div className="reviews-table">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Producto</th>
              <th>Calificación</th>
              <th>Comentario</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(review => (
              <tr key={review._id}>
                <td>
                  <div>
                    <strong>{review.usuario}</strong>
                    <br />
                    <small>{review.email}</small>
                  </div>
                </td>
                <td>{review.producto}</td>
                <td>
                  <div className="rating">
                    <span className="stars">{renderStars(review.calificacion)}</span>
                    <span className="rating-number">({review.calificacion}/5)</span>
                  </div>
                </td>
                <td>
                  <div className="comment-text">
                    {review.comentario.length > 100 ? 
                      review.comentario.substring(0, 100) + '...' : 
                      review.comentario
                    }
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(review.estado)}`}>
                    {review.estado.charAt(0).toUpperCase() + review.estado.slice(1)}
                  </span>
                </td>
                <td>{new Date(review.fecha).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    {review.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(review._id, 'aprobado')}
                          className="btn-approve"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleStatusChange(review._id, 'rechazado')}
                          className="btn-reject"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {review.estado === 'aprobado' && (
                      <button
                        onClick={() => handleStatusChange(review._id, 'rechazado')}
                        className="btn-reject"
                      >
                        Rechazar
                      </button>
                    )}
                    {review.estado === 'rechazado' && (
                      <button
                        onClick={() => handleStatusChange(review._id, 'aprobado')}
                        className="btn-approve"
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReviews.length === 0 && (
          <div className="no-results">
            <p>No se encontraron reseñas que coincidan con los criterios de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsAdmin;