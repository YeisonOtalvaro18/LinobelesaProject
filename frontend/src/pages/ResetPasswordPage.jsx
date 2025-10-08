import React, { useState, useEffect } from 'react';
import '../styles/ResetPasswordPage.css';

const ResetPasswordPage = () => {
  // Extraer token de la URL sin React Router
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
  };
  
  const token = getTokenFromUrl();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
    }
  }, [token]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>._]/.test(password);
    const noSpaces = !/\s/.test(password);

    return {
      minLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      noSpaces,
      isValid: minLength && hasLower && hasUpper && hasNumber && hasSpecial && noSpaces
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setFormData({ password: '', confirmPassword: '' });
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <div className="reset-password-logo">
            <img src="/src/IMG/logolinobelesa.jpg" alt="Linobelesa" />
            <h1>Linobelesa</h1>
          </div>
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <div className="reset-password-content">
          {message && (
            <div className="success-message">
              <span className="success-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </span>
              {message}
              <div className="redirect-info">
                Redirigiendo al login en unos segundos...
              </div>
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

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nueva contraseña"
                  disabled={loading || message}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || message}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.83 9L15 12.16C15 12.11 15 12.05 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9 11.83 9ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM12 7C14.76 7 17 9.24 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.76 7.13 11.37 7 12 7Z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirma tu nueva contraseña"
                  disabled={loading || message}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || message}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.83 9L15 12.16C15 12.11 15 12.05 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9 11.83 9ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM12 7C14.76 7 17 9.24 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.76 7.13 11.37 7 12 7Z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {formData.password && (
              <div className="password-requirements">
                <h4>Requisitos de contraseña:</h4>
                <ul>
                  <li className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                    {passwordValidation.minLength ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#22c55e'}}>
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#ef4444'}}>
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    )} Mínimo 8 caracteres
                  </li>
                  <li className={passwordValidation.hasLower ? 'valid' : 'invalid'}>
                    {passwordValidation.hasLower ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#22c55e'}}>
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#ef4444'}}>
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    )} Una letra minúscula
                  </li>
                  <li className={passwordValidation.hasUpper ? 'valid' : 'invalid'}>
                    {passwordValidation.hasUpper ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#22c55e'}}>
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#ef4444'}}>
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    )} Una letra mayúscula
                  </li>
                  <li className={passwordValidation.hasNumber ? 'valid' : 'invalid'}>
                    {passwordValidation.hasNumber ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#22c55e'}}>
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#ef4444'}}>
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    )} Un número
                  </li>
                  <li className={passwordValidation.hasSpecial ? 'valid' : 'invalid'}>
                    {passwordValidation.hasSpecial ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#22c55e'}}>
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#ef4444'}}>
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    )} Un carácter especial
                  </li>
                  <li className={passwordValidation.noSpaces ? 'valid' : 'invalid'}>
                    {passwordValidation.noSpaces ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#22c55e'}}>
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{color: '#ef4444'}}>
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                      </svg>
                    )} Sin espacios
                  </li>
                </ul>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || message || !passwordValidation.isValid}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Restableciendo...
                </>
              ) : message ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"/>
                  </svg>
                  Contraseña Restablecida
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>

          <div className="reset-password-footer">
            <button 
              type="button" 
              className="back-link"
              onClick={() => window.location.href = '/'}
            >
              ← Volver al Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;