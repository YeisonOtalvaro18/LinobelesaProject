// Hook para verificar autenticación en componentes admin
import { useEffect, useState } from 'react';
import { auth } from './auth.js';

export const useAuthCheck = (onNavigate) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = auth.getToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (auth.isTokenExpired(token)) {
        auth.clearAuth();
        setIsAuthenticated(false);
        setIsLoading(false);
        
        // Mostrar mensaje y redirigir
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
    
    // Verificar cada 5 minutos
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [onNavigate]);

  return { isAuthenticated, isLoading };
};