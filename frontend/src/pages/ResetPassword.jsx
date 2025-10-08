import React, { useState, useEffect } from 'react';
import '../styles/reset-password.css';

const ResetPassword = ({ onNavigate, token: tokenProp }) => {
  const [token, setToken] = useState(tokenProp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones de contraseña
  const passwordRules = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?\":{}|<>._]/.test(newPassword),
    noSpaces: !/\\s/.test(newPassword),
    match: newPassword === confirmPassword && newPassword.length > 0,
  };

  useEffect(() => {
    if (tokenProp) {
      setToken(tokenProp);
      verifyToken(tokenProp);
    } else {
      setError('Token no encontrado en la URL');
      setIsVerifying(false);
    }
  }, [tokenProp]);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/verify-reset-token/${tokenToVerify}`);
      const data = await response.json();

      if (data.success) {
        setIsTokenValid(true);
        setUserInfo(data.data);
      } else {
        setError(data.message || 'Token inválido o expirado');
        setIsTokenValid(false);
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      setError('Error de conexión. Inténtalo más tarde.');
      setIsTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!passwordRules.length || !passwordRules.lowercase || !passwordRules.uppercase || 
        !passwordRules.number || !passwordRules.special || !passwordRules.noSpaces || 
        !passwordRules.match) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }

    setIsLoading(true);
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
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          onNavigate('login');
        }, 3000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-content">
            <div className="loading-spinner large"></div>
            <h2>Verificando token...</h2>
            <p>Por favor espera mientras verificamos tu enlace de restablecimiento.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h2>Enlace inválido</h2>
            <p className="error-message">{error}</p>
            <div className="possible-reasons">
              <h4>Posibles razones:</h4>
              <ul>
                <li>El enlace ha expirado (válido por 1 hora)</li>
                <li>El enlace ya fue utilizado</li>
                <li>El enlace está mal formado</li>
              </ul>
            </div>
            <button 
              className="btn-primary"
              onClick={() => onNavigate('login')}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>¡Contraseña restablecida!</h2>
            <p className="success-message">{message}</p>
            <p>Serás redirigido al login en unos segundos...</p>
            <button 
              className="btn-primary"
              onClick={() => onNavigate('login')}
            >
              Ir al Login Ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2>🔐 Nueva Contraseña</h2>
          <p>Hola {userInfo?.name}, crea tu nueva contraseña</p>
        </div>

        <div className="reset-password-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tu nueva contraseña"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.83 9L15 12.16C15 12.11 15 12.05 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9 11.83 9ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM12 7C14.76 7 17 9.24 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.76 7.13 11.37 7 12 7Z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.83 9L15 12.16C15 12.11 15 12.05 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9 11.83 9ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM12 7C14.76 7 17 9.24 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.76 7.13 11.37 7 12 7Z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Reglas de contraseña */}
            <div className="password-rules">
              <p><strong>La contraseña debe cumplir:</strong></p>
              <ul>
                <li className={passwordRules.length ? "valid" : "invalid"}>
                  Mínimo 8 caracteres
                </li>
                <li className={passwordRules.lowercase ? "valid" : "invalid"}>
                  Al menos una letra minúscula
                </li>
                <li className={passwordRules.uppercase ? "valid" : "invalid"}>
                  Al menos una letra mayúscula
                </li>
                <li className={passwordRules.number ? "valid" : "invalid"}>
                  Al menos un número
                </li>
                <li className={passwordRules.special ? "valid" : "invalid"}>
                  Al menos un carácter especial (!@#$%^&*)
                </li>
                <li className={passwordRules.noSpaces ? "valid" : "invalid"}>
                  No debe contener espacios
                </li>
                <li className={passwordRules.match ? "valid" : "invalid"}>
                  Las contraseñas coinciden
                </li>
              </ul>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !passwordRules.length || !passwordRules.lowercase || 
                       !passwordRules.uppercase || !passwordRules.number || !passwordRules.special || 
                       !passwordRules.noSpaces || !passwordRules.match}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Restableciendo...
                </>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </form>

          <div className="back-to-login">
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate('login')}
            >
              ← Volver al Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;