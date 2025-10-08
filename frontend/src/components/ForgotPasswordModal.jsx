import React, { useState } from 'react';
import '../styles/ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail('');
        // Llamar callback de éxito después de 3 segundos
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <div className="forgot-password-header">
          <h2>Recuperar Contraseña</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="forgot-password-content">
          <div className="forgot-password-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#6c0cbf" strokeWidth="2" fill="rgba(108, 12, 191, 0.1)"/>
              <path d="M9 12L11 14L15 10" stroke="#6c0cbf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <p className="forgot-password-description">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {message && (
            <div className="success-message">
              <span className="success-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </span>
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                </svg>
              </span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                disabled={loading || message}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || message}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Enviando...
                </>
              ) : message ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                  </svg>
                  Email Enviado
                </>
              ) : (
                'Enviar Email de Recuperación'
              )}
            </button>
          </form>

          <div className="forgot-password-footer">
            <button 
              type="button" 
              className="back-link"
              onClick={handleClose}
            >
              ← Volver al Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;