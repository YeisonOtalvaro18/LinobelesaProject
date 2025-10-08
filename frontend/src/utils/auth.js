// Utilidades para manejo de autenticación y tokens
export const auth = {
  // Obtener token del localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Verificar si hay un token válido
  hasToken: () => {
    const token = localStorage.getItem('token');
    return token && token !== 'null' && token !== 'undefined';
  },

  // Limpiar datos de autenticación
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
  },

  // Verificar si el token ha expirado (básico)
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      // Decodificar JWT básico (sin verificar firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return true;
    }
  },

  // Obtener headers de autorización
  getAuthHeaders: () => {
    const token = auth.getToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
};

// Función para hacer peticiones autenticadas con manejo de errores
export const authenticatedFetch = async (url, options = {}) => {
  const token = auth.getToken();
  
  // Verificar si hay token
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  // Verificar si el token ha expirado
  if (auth.isTokenExpired(token)) {
    auth.clearAuth();
    throw new Error('Token expirado');
  }

  // Configurar headers
  const headers = {
    ...auth.getAuthHeaders(),
    ...options.headers
  };

  // Hacer la petición
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  // Manejar respuesta 401 (no autorizado)
  if (response.status === 401) {
    auth.clearAuth();
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }

  return response;
};

export default auth;