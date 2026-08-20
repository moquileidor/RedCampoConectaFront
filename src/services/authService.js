import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });

    if (response.data.token) {
      const userData = normalizeUserData(response.data);

      localStorage.setItem('user', JSON.stringify({
        ...userData,
        loginTime: new Date().getTime(),
      }));
      setAuthToken(response.data.token);

      try {
        const userId = userData.idUsuario || userData.idusuarios;
        if (userId) {
          const datosResponse = await api.get(`/datosPersonales/usuario/${userId}`);
          if (datosResponse.data) {
            localStorage.setItem('datosPersonales', JSON.stringify(datosResponse.data));
          }
        }
      } catch {
        // datos personales no disponibles aún, continuar sin ellos
      }

      return userData;
    }

    return response.data;
  },

  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });

    if (response.data.token) {
      const userData = normalizeUserData(response.data);
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        loginTime: new Date().getTime(),
      }));
      setAuthToken(response.data.token);
      return userData;
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('datosPersonales');
    delete api.defaults.headers.common['Authorization'];
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user ? normalizeUserData(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => authService.getCurrentUser() !== null,

  isTokenExpired: () => {
    const user = authService.getCurrentUser();
    if (!user?.loginTime) return true;
    const MAX_SESSION = 24 * 60 * 60 * 1000;
    return Date.now() - user.loginTime > MAX_SESSION;
  },

  getToken: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr)?.token ?? null;
    } catch {
      return null;
    }
  },

  getUserId: () => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    const id = parseInt(user.idUsuario ?? user.idusuarios ?? user.id, 10);
    return isNaN(id) ? null : id;
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'ROLE_ADMIN';
  },
};

const normalizeUserData = (userData) => {
  if (!userData) return null;

  const raw = { ...userData };
  const id = parseInt(raw.idUsuario ?? raw.idusuarios ?? raw.id, 10);

  return {
    ...raw,
    id: isNaN(id) ? null : id,
    idUsuario: isNaN(id) ? null : id,
    idusuarios: isNaN(id) ? null : id,
  };
};

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Restaurar token al cargar la app
const storedUser = authService.getCurrentUser();
if (storedUser?.token) {
  setAuthToken(storedUser.token);
}

export default authService;
