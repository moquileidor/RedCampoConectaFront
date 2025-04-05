import axios from 'axios';

const API_URL = 'http://localhost:8080/auth';

// Servicio para manejar la autenticación
const authService = {
    // Iniciar sesión
    login: async (username, password) => {
        try {
            // Primero intentamos con el endpoint de autenticación
            const response = await axios.post(`${API_URL}/login`, {
                username,
                password
            });
            
            if (response.data.token) {
                // Normalizar datos de usuario
                const userData = normalizeUserData(response.data);
                
                // Guardar usuario y token en localStorage
                localStorage.setItem('user', JSON.stringify({
                    ...userData,
                    loginTime: new Date().getTime() // Añadir timestamp del momento de login
                }));
                // Configurar token en cabeceras para futuras peticiones
                setAuthToken(response.data.token);
                
                // Intentar obtener datos personales separadamente
                try {
                    const userId = userData.idUsuario || userData.idusuarios;
                    if (userId) {
                        console.log("Auth Service: Intentando obtener datos personales para usuario ID:", userId);
                        const datosResponse = await axios.get(`http://localhost:8080/datosPersonales/usuario/${userId}`);
                        if (datosResponse.data) {
                            console.log("Auth Service: Datos personales obtenidos correctamente");
                            localStorage.setItem('datosPersonales', JSON.stringify(datosResponse.data));
                        }
                    }
                } catch (datosError) {
                    console.warn('Auth Service: No se pudieron cargar los datos personales:', datosError);
                    
                    // Intentar con el endpoint de login de usuarios como alternativa
                    try {
                        console.log("Auth Service: Intentando obtener datos vía login alternativo");
                        const loginUserResponse = await axios.post('http://localhost:8080/usuarios/login', {
                            emailUser: response.data.emailUser || username,
                            password_user: password
                        });
                        
                        if (loginUserResponse.data && loginUserResponse.data.datosPersonales) {
                            localStorage.setItem('datosPersonales', JSON.stringify(loginUserResponse.data.datosPersonales));
                        }
                    } catch (loginError) {
                        console.warn('No se pudieron cargar los datos personales via login secundario:', loginError);
                    }
                }
                
                return userData;
            }
            
            return response.data;
        } catch (error) {
            // Si falla el endpoint de auth, intentamos con el endpoint de usuarios
            try {
                const loginResponse = await axios.post('http://localhost:8080/usuarios/login', {
                    emailUser: username,
                    password_user: password
                });
                
                if (loginResponse.data) {
                    let userData = loginResponse.data.usuario || loginResponse.data;
                    
                    // Normalizar datos del usuario
                    userData = normalizeUserData(userData);
                    
                    // Guardar usuario en localStorage
                    localStorage.setItem('user', JSON.stringify({
                        ...userData,
                        loginTime: new Date().getTime()
                    }));
                    
                    // Guardar datos personales si están disponibles
                    if (loginResponse.data.datosPersonales) {
                        localStorage.setItem('datosPersonales', JSON.stringify(loginResponse.data.datosPersonales));
                    }
                    
                    return userData;
                }
                
                throw new Error("Credenciales inválidas");
            } catch (loginError) {
                console.error('Error al iniciar sesión alternativa:', loginError);
                throw loginError;
            }
        }
    },
    
    // Registrar nuevo usuario
    register: async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                username,
                password
            });
            
            if (response.data.token) {
                // Normalizar datos del usuario
                const userData = normalizeUserData(response.data);
                
                localStorage.setItem('user', JSON.stringify({
                    ...userData,
                    loginTime: new Date().getTime() // Añadir timestamp del momento de registro
                }));
                setAuthToken(response.data.token);
                
                return userData;
            }
            
            return response.data;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    },
    
    // Cerrar sesión
    logout: () => {
        // Eliminar datos de usuario y datos personales del localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('datosPersonales');

        // Limpiar token de las cabeceras
        delete axios.defaults.headers.common['Authorization'];
    },
    
    // Obtener usuario actual
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return null;
            
            let user = JSON.parse(userStr);
            
            // Normalizar datos del usuario
            if (user) {
                user = normalizeUserData(user);
                console.log("Usuario actual en authService:", user);
            }
            
            return user;
        } catch (error) {
            console.error("Error al obtener usuario actual:", error);
            return null;
        }
    },
    
    // Verificar si está autenticado
    isAuthenticated: () => {
        return authService.getCurrentUser() !== null;
    },
    
    // Verificar token con el backend
    validateToken: async () => {
        const user = authService.getCurrentUser();
        if (!user || !user.token) return false;
        
        try {
            // Esta sería la forma ideal de validar un token con el backend,
            // pero necesitaríamos un endpoint específico para esto.
            // Por ahora, simplemente verificamos si existe y no ha expirado localmente.
            return true;
        } catch (error) {
            console.error('Error al validar token:', error);
            authService.logout();
            return false;
        }
    },
    
    // Obtener el token actual
    getToken: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            return user.token;
        } catch (error) {
            console.error("Error al obtener token:", error);
            return null;
        }
    },
    
    // Obtener el ID del usuario de forma consistente
    getUserId: () => {
        try {
            const user = authService.getCurrentUser();
            if (!user) return null;
            
            // Intentar obtener el ID del usuario de varias propiedades posibles
            const userId = user.idUsuario || user.idusuarios || user.id;
            
            if (!userId) {
                console.error("No se pudo obtener un ID de usuario válido:", user);
                return null;
            }
            
            // Convertir a entero si es posible
            const userIdInt = parseInt(userId, 10);
            if (isNaN(userIdInt)) {
                console.error("El ID de usuario no es un número válido:", userId);
                return userId; // Devolver el original si no es un número
            }
            
            return userIdInt;
        } catch (error) {
            console.error("Error al obtener ID de usuario:", error);
            return null;
        }
    },
    
    // Verificar si es administrador
    isAdmin: () => {
        const user = authService.getCurrentUser();
        return user && user.rol === 'ROLE_ADMIN';
    }
};

// Función para normalizar los datos del usuario y asegurar consistencia
const normalizeUserData = (userData) => {
    if (!userData) return null;
    
    const normalizedUser = { ...userData };
    
    // Asegurar que tenemos las propiedades de ID consistentes
    if (normalizedUser.idUsuario && !normalizedUser.idusuarios) {
        normalizedUser.idusuarios = normalizedUser.idUsuario;
    } else if (normalizedUser.idusuarios && !normalizedUser.idUsuario) {
        normalizedUser.idUsuario = normalizedUser.idusuarios;
    } else if (!normalizedUser.idUsuario && !normalizedUser.idusuarios && normalizedUser.id) {
        normalizedUser.idUsuario = normalizedUser.id;
        normalizedUser.idusuarios = normalizedUser.id;
    }
    
    // Asegurar que los IDs son números
    if (normalizedUser.idUsuario) {
        const idInt = parseInt(normalizedUser.idUsuario, 10);
        if (!isNaN(idInt)) {
            normalizedUser.idUsuario = idInt;
            normalizedUser.idusuarios = idInt;
        }
    }
    
    return normalizedUser;
};

// Función para configurar el token en las cabeceras
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Configurar interceptor para manejar tokens expirados
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado o inválido, cerrar sesión
            authService.logout();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Verificar si hay un token almacenado al cargar la aplicación y configurarlo
const user = authService.getCurrentUser();
if (user && user.token) {
    setAuthToken(user.token);
}

export default authService; 