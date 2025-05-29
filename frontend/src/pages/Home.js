import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { actividadesAPI } from '../services/api';

const Home = () => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [horario, setHorario] = useState('');
    const [diaSeleccionado, setDiaSeleccionado] = useState('');
    const [error, setError] = useState('');

    const categorias = ['Yoga', 'Pilates', 'Crossfit', 'Spinning', 'Aeróbicos', 'Musculación'];
    const horarios = ['06:00', '07:00', '08:00', '09:00', '10:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Obtener día actual
    const obtenerDiaActual = () => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoy = new Date();
        return dias[hoy.getDay()];
    };

    useEffect(() => {
        // Establecer día actual por defecto al cargar la página
        setDiaSeleccionado(obtenerDiaActual());
    }, []);

    useEffect(() => {
        fetchActividades();
    }, [search, categoria, horario, diaSeleccionado]);

    const fetchActividades = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (categoria) params.categoria = categoria;
            if (horario) params.horario = horario;

            const response = await actividadesAPI.getAll(params);
            let actividadesFiltradas = response.data;

            // Filtrar por día si está seleccionado
            if (diaSeleccionado) {
                actividadesFiltradas = actividadesFiltradas.filter(
                    actividad => actividad.dia === diaSeleccionado
                );
            }

            setActividades(actividadesFiltradas);
        } catch (err) {
            setError('Error cargando actividades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDiaFilter = (dia) => {
        setDiaSeleccionado(diaSeleccionado === dia ? '' : dia);
    };

    return (
        <div className="container">
            <h1>🏃‍♂️ Actividades Deportivas</h1>

            {/* Filtro por días de la semana */}
            <div className="dia-filter">
                <button
                    onClick={() => setDiaSeleccionado('')}
                    className={`dia-filter-btn ${diaSeleccionado === '' ? 'active' : ''}`}
                >
                    📅 Todos los días
                </button>
                {diasSemana.map(dia => (
                    <button
                        key={dia}
                        onClick={() => handleDiaFilter(dia)}
                        className={`dia-filter-btn ${diaSeleccionado === dia ? 'active' : ''}`}
                    >
                        {dia === obtenerDiaActual() ? '⭐ ' : ''}{dia}
                    </button>
                ))}
            </div>

            {/* Barra de búsqueda */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar por título, descripción o profesor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control"
                />

                <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="form-control"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    className="form-control"
                >
                    <option value="">Todos los horarios</option>
                    {horarios.map(hora => (
                        <option key={hora} value={hora}>{hora}</option>
                    ))}
                </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Cargando actividades</div>
            ) : (
                <div className="actividades-grid">
                    {actividades.length === 0 ? (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                            <h3>🔍 No se encontraron actividades</h3>
                            <p>
                                {diaSeleccionado
                                    ? `No hay actividades disponibles para ${diaSeleccionado}.`
                                    : 'No se encontraron actividades con los filtros seleccionados.'
                                }
                            </p>
                            <p>Intenta cambiar los criterios de búsqueda o seleccionar otro día.</p>
                        </div>
                    ) : (
                        actividades.map(actividad => {
                            const cupoDisponible = actividad.cupo_disponible || 0;
                            const esCupoCompleto = cupoDisponible === 0;

                            return (
                                <div key={actividad.id} className="actividad-card">
                                    {actividad.foto_url ? (
                                        <img
                                            src={actividad.foto_url}
                                            alt={actividad.titulo}
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
                                        <h3 className="actividad-title">{actividad.titulo}</h3>
                                        <div className="actividad-info">
                                            <p><strong>📋 Categoría:</strong> {actividad.categoria}</p>
                                            <p><strong>📅 Horario:</strong> {actividad.dia} {actividad.horario}</p>
                                            <p><strong>👨‍🏫 Profesor:</strong> {actividad.profesor}</p>
                                            <p><strong>⏱️ Duración:</strong> {actividad.duracion_minutos} minutos</p>
                                        </div>
                                        <div className="cupo-info">
                                            <p>👥 Cupo disponible:</p>
                                            <span className={`cupo-numero ${esCupoCompleto ? 'cupo-completo' : 'cupo-disponible'}`}>
                        {cupoDisponible} / {actividad.cupo_maximo}
                      </span>
                                            {esCupoCompleto && (
                                                <p style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: '14px', margin: '5px 0 0 0' }}>
                                                    ⚠️ ¡Cupo completo!
                                                </p>
                                            )}
                                        </div>
                                        <Link
                                            to={`/actividades/${actividad.id}`}
                                            className="btn btn-primary"
                                        >
                                            👀 Ver Detalle
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;