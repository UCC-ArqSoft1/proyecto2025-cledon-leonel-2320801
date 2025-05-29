import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { actividadesAPI, inscripcionesAPI } from '../services/api';

const ActividadDetalle = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [actividad, setActividad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [dandoDeBaja, setDandoDeBaja] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [yaInscrito, setYaInscrito] = useState(false);
    const [inscripcionId, setInscripcionId] = useState(null);

    useEffect(() => {
        fetchActividad();
        if (user) {
            verificarInscripcion();
        }
    }, [id, user]);

    const fetchActividad = async () => {
        try {
            setLoading(true);
            const response = await actividadesAPI.getById(id);
            setActividad(response.data);
        } catch (err) {
            setError('Error cargando actividad');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verificarInscripcion = async () => {
        try {
            const response = await inscripcionesAPI.getByUsuario(user.id);
            const inscripciones = response.data;

            // Verificar si ya está inscrito en esta actividad
            const inscripcionExistente = inscripciones.find(
                insc => insc.actividad_id === parseInt(id)
            );

            if (inscripcionExistente) {
                setYaInscrito(true);
                setInscripcionId(inscripcionExistente.id);
            } else {
                setYaInscrito(false);
                setInscripcionId(null);
            }
        } catch (err) {
            console.error('Error verificando inscripción:', err);
        }
    };

    const handleInscripcion = async () => {
        if (!user) {
            setError('Debes iniciar sesión para inscribirte');
            return;
        }

        setInscribiendo(true);
        setError('');
        setSuccess('');

        try {
            await inscripcionesAPI.create({
                usuario_id: user.id,
                actividad_id: parseInt(id)
            });

            setSuccess('¡Te has inscrito exitosamente! 🎉');
            setYaInscrito(true);

            // Actualizar cupo disponible
            fetchActividad();
            // Verificar inscripción nuevamente
            verificarInscripcion();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al inscribirse');
        } finally {
            setInscribiendo(false);
        }
    };

    const handleDarseDeBaja = async () => {
        if (!inscripcionId) {
            setError('No se encontró la inscripción');
            return;
        }

        if (!window.confirm(`¿Estás seguro de que quieres darte de baja de "${actividad.titulo}"?`)) {
            return;
        }

        setDandoDeBaja(true);
        setError('');
        setSuccess('');

        try {
            await inscripcionesAPI.delete(inscripcionId);

            setSuccess('¡Te has dado de baja exitosamente! 👋');
            setYaInscrito(false);
            setInscripcionId(null);

            // Actualizar cupo disponible
            fetchActividad();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al darse de baja');
        } finally {
            setDandoDeBaja(false);
        }
    };

    if (loading) return <div className="loading">Cargando</div>;
    if (!actividad) return <div className="container">Actividad no encontrada</div>;

    return (
        <div className="container">
            <Link to="/" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                ← Volver a actividades
            </Link>

            <div className="card">
                {actividad.foto_url && (
                    <img
                        src={actividad.foto_url}
                        alt={actividad.titulo}
                        style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }}
                    />
                )}

                <h1>🏃‍♂️ {actividad.titulo}</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <h3>📋 Información General</h3>
                        <p><strong>Categoría:</strong> {actividad.categoria}</p>
                        <p><strong>Profesor:</strong> {actividad.profesor}</p>
                        <p><strong>Día:</strong> {actividad.dia}</p>
                        <p><strong>Horario:</strong> {actividad.horario}</p>
                        <p><strong>Duración:</strong> {actividad.duracion_minutos} minutos</p>
                    </div>

                    <div>
                        <h3>👥 Cupo</h3>
                        <div className="cupo-info">
                            <p><strong>Disponible:</strong> {actividad.cupo_disponible || 0}</p>
                            <p><strong>Total:</strong> {actividad.cupo_maximo}</p>
                            {actividad.cupo_disponible === 0 && (
                                <p style={{ color: '#dc3545', fontWeight: 'bold' }}>¡Cupo completo!</p>
                            )}
                        </div>
                    </div>
                </div>

                {actividad.descripcion && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>📝 Descripción</h3>
                        <p>{actividad.descripcion}</p>
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div style={{ marginTop: '30px' }}>
                    {user ? (
                        <div>
                            {yaInscrito ? (
                                // Si ya está inscrito, mostrar estado y opción de darse de baja
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginBottom: '15px',
                                        border: '1px solid #c3e6cb'
                                    }}>
                                        <p style={{ margin: 0, color: '#155724', fontWeight: 'bold', fontSize: '16px' }}>
                                            ✅ ¡Ya estás inscrito en esta actividad!
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <Link
                                            to="/mis-actividades"
                                            className="btn btn-primary"
                                        >
                                            📋 Ver mis actividades
                                        </Link>
                                        <button
                                            onClick={handleDarseDeBaja}
                                            disabled={dandoDeBaja}
                                            className="btn btn-danger"
                                        >
                                            {dandoDeBaja ? '⏳ Dándose de baja...' : '❌ Darse de baja'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Si no está inscrito, mostrar botón de inscripción
                                <div style={{ textAlign: 'center' }}>
                                    <button
                                        onClick={handleInscripcion}
                                        disabled={inscribiendo || actividad.cupo_disponible === 0}
                                        className={`btn ${actividad.cupo_disponible === 0 ? 'btn-secondary' : 'btn-success'}`}
                                        style={{ padding: '15px 30px', fontSize: '16px' }}
                                    >
                                        {inscribiendo ? '⏳ Inscribiendo...' :
                                            actividad.cupo_disponible === 0 ? '❌ Sin cupo disponible' :
                                                '✅ Inscribirse'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <p>Debes <Link to="/login">iniciar sesión</Link> para inscribirte.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActividadDetalle;