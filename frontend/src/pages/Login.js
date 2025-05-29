import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Si ya está logueado, redirigir
    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(email, password);
            const { token, user: userData } = response.data;

            login(userData, token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div style={{ maxWidth: '450px', margin: '50px auto' }}>
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '32px',
                            fontWeight: '700'
                        }}>
                            🔐 Iniciar Sesión
                        </h2>
                        <p style={{ color: '#718096', marginTop: '10px' }}>
                            Bienvenido de vuelta al Gimnasio
                        </p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">📧 Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">🔒 Contraseña:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-control"
                                placeholder="Tu contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: '600' }}
                        >
                            {loading ? '⏳ Iniciando...' : '🚀 Iniciar Sesión'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '25px',
                        textAlign: 'center',
                        padding: '20px 0',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <p style={{ color: '#718096' }}>
                            ¿No tienes cuenta?
                            <Link
                                to="/register"
                                style={{
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    marginLeft: '5px'
                                }}
                            >
                                Registrarse
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;