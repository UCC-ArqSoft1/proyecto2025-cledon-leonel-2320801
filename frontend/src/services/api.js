import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/login', { email, password }),
    register: (nombre, email, password, tipo = 'socio') =>
        api.post('/register', { nombre, email, password, tipo }),
};

// Actividades API
export const actividadesAPI = {
    getAll: (params = {}) => api.get('/actividades', { params }),
    getById: (id) => api.get(`/actividades/${id}`),
    create: (data) => api.post('/admin/actividades', data),
    update: (id, data) => api.put(`/admin/actividades/${id}`, data),
    delete: (id) => api.delete(`/admin/actividades/${id}`),
};

// Inscripciones API
export const inscripcionesAPI = {
    create: (data) => api.post('/inscripciones', data),
    getByUsuario: (usuarioId) => api.get(`/usuarios/${usuarioId}/inscripciones`),
    delete: (inscripcionId) => api.delete(`/inscripciones/${inscripcionId}`), // ← NUEVA FUNCIÓN
};

export default api;