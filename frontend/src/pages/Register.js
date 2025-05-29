import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        // Validaciones
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.register(nombre, email, password, 'socio');
            const { token, user: userData } = response.data;

            login(userData, token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrarse');
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
                            📝 Registrarse
                        </h2>
                        <p style={{ color: '#718096', marginTop: '10px' }}>
                            Únete a nuestro Gimnasio hoy
                        </p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">👤 Nombre completo:</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="form-control"
                                placeholder="Tu nombre completo"
                            />
                        </div>

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
                                minLength="6"
                                className="form-control"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">🔐 Confirmar contraseña:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                className="form-control"
                                placeholder="Repetir contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-success"
                            style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: '600' }}
                        >
                            {loading ? '⏳ Registrando...' : '✅ Registrarse'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '25px',
                        textAlign: 'center',
                        padding: '20px 0',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <p style={{ color: '#718096' }}>
                            ¿Ya tienes cuenta?
                            <Link
                                to="/login"
                                style={{
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    marginLeft: '5px'
                                }}
                            >
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;