import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    <img
                        src="/logo192.png"
                        alt="Gimnasio Logo"
                        style={{
                            width: '40px',
                            height: '40px',
                            marginRight: '12px',
                            verticalAlign: 'middle',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(255,255,255,0.2)'
                        }}
                    />
                    🏋️‍♂️ Gimnasio
                </Link>

                <div className="navbar-nav">
                    <Link to="/">Actividades</Link>

                    {user ? (
                        <>
                            <Link to="/mis-actividades">Mis Actividades</Link>
                            {isAdmin() && (
                                <Link to="/admin">Panel Admin</Link>
                            )}
                            <span style={{
                                maxWidth: '180px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block'
                            }}>
                Hola, {user.nombre.split(' ')[0]}
              </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Iniciar Sesión</Link>
                            <Link to="/register">Registrarse</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;