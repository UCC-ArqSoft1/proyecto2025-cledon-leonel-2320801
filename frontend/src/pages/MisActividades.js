import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { inscripcionesAPI } from '../services/api';

const MisActividades = () => {
    const { user } = useAuth();
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dandoDeBaja, setDandoDeBaja] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            fetchInscripciones();
        }
    }, [user]);

    const fetchInscripciones = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Obteniendo inscripciones para usuario:', user.id);

            const response = await inscripcionesAPI.getByUsuario(user.id);
            console.log('Respuesta inscripciones:', response.data);

            setInscripciones(response.data);
        } catch (err) {
            console.error('Error obteniendo inscripciones:', err);
            setError('Error cargando inscripciones: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDarseDeBaja = async (inscripcionId, actividadTitulo) => {
        if (!window.confirm(`¿Estás seguro de que quieres darte de baja de "${actividadTitulo}"?`)) {
            return;
        }

        try {
            setDandoDeBaja(inscripcionId);
            setError('');
            setSuccess('');

            await inscripcionesAPI.delete(inscripcionId);

            setSuccess(`Te has dado de baja de "${actividadTitulo}" exitosamente`);

            // Actualizar la lista removiendo la inscripción
            setInscripciones(prev => prev.filter(insc => insc.id !== inscripcionId));

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            console.error('Error dándose de baja:', err);
            setError('Error al darse de baja: ' + (err.response?.data?.error || err.message));
        } finally {
            setDandoDeBaja(null);
        }
    };

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="container">
            <h1>🏃‍♂️ Mis Actividades</h1>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {loading ? (
                <div className="loading">Cargando inscripciones</div>
            ) : (
                <div>
                    {inscripciones.length === 0 ? (
                        <div className="card">
                            <h3>📝 No tienes inscripciones aún</h3>
                            <p>¡Es hora de inscribirte a una actividad!</p>
                            <Link to="/" className="btn btn-primary">
                                🔍 Ver actividades disponibles
                            </Link>
                        </div>
                    ) : (
                        <div className="actividades-grid">
                            {inscripciones.map(inscripcion => {
                                // Verificar que la actividad existe
                                if (!inscripcion.actividad) {
                                    console.error('Actividad no encontrada para inscripción:', inscripcion);
                                    return (
                                        <div key={inscripcion.id} className="actividad-card">
                                            <div className="actividad-content">
                                                <h3 className="actividad-title">⚠️ Actividad no disponible</h3>
                                                <p style={{ color: '#e53e3e', marginBottom: '15px' }}>
                                                    Esta actividad ya no está disponible o fue eliminada.
                                                </p>
                                                <button
                                                    onClick={() => handleDarseDeBaja(inscripcion.id, 'Actividad no disponible')}
                                                    className="btn btn-danger"
                                                    disabled={dandoDeBaja === inscripcion.id}
                                                >
                                                    {dandoDeBaja === inscripcion.id ? '⏳ Eliminando...' : '🗑️ Eliminar inscripción'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={inscripcion.id} className="actividad-card">
                                        {inscripcion.actividad.foto_url ? (
                                            <img
                                                src={inscripcion.actividad.foto_url}
                                                alt={inscripcion.actividad.titulo}
                                                className="actividad-image"
                                            />
                                        ) : (
                                            <div className="actividad-image" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '48px',
                                                color: 'white'
                                            }}>
                                                🏋️‍♂️
                                            </div>
                                        )}
                                        <div className="actividad-content">
                                            <h3 className="actividad-title">{inscripcion.actividad.titulo}</h3>
                                            <div className="actividad-info">
                                                <p><strong>📋 Categoría:</strong> {inscripcion.actividad.categoria}</p>
                                                <p><strong>📅 Horario:</strong> {inscripcion.actividad.dia} {inscripcion.actividad.horario}</p>
                                                <p><strong>👨‍🏫 Profesor:</strong> {inscripcion.actividad.profesor}</p>
                                                <p><strong>⏱️ Duración:</strong> {inscripcion.actividad.duracion_minutos} minutos</p>
                                                <p><strong>📝 Inscrito el:</strong> {new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-ES')}</p>
                                            </div>

                                            <div className="botones-actividad">
                                                <Link
                                                    to={`/actividades/${inscripcion.actividad.id}`}
                                                    className="btn btn-primary"
                                                >
                                                    👀 Ver Detalle
                                                </Link>
                                                <button
                                                    onClick={() => handleDarseDeBaja(inscripcion.id, inscripcion.actividad.titulo)}
                                                    className="btn btn-danger"
                                                    disabled={dandoDeBaja === inscripcion.id}
                                                >
                                                    {dandoDeBaja === inscripcion.id ? '⏳ Darse de baja...' : '❌ Darse de baja'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MisActividades;