import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminPanel = () => {
    const { isAdmin } = useAuth();
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filtros
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [diaSeleccionado, setDiaSeleccionado] = useState('');

    const categorias = ['Yoga', 'Pilates', 'Crossfit', 'Spinning', 'Aeróbicos', 'Musculación'];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Horario Libre'];

    useEffect(() => {
        fetchActividades();
    }, [search, categoria, diaSeleccionado]);

    const fetchActividades = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (categoria) params.categoria = categoria;
            if (diaSeleccionado) params.dia = diaSeleccionado;

            // Usar la ruta de admin con filtros
            const response = await api.get('/admin/actividades', { params });
            setActividades(response.data);
        } catch (err) {
            setError('Error cargando actividades');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, titulo) => {
        if (!window.confirm(`¿Estás seguro de eliminar la actividad "${titulo}"?`)) {
            return;
        }

        try {
            await api.delete(`/admin/actividades/${id}`);
            setSuccess('Actividad eliminada correctamente ✅');
            fetchActividades();
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error eliminando actividad');
            console.error(err);
        }
    };

    const formatearHorario = (dia, horario) => {
        if (dia === 'Horario Libre' || horario === 'Horario Libre') {
            return '⏰ Horario Libre';
        }
        return `${dia} ${horario}`;
    };

    if (!isAdmin()) {
        return <div className="container">❌ No tienes permisos para acceder a esta página.</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>🔧 Panel de Administración</h1>
                <Link to="/admin/crear-actividad" className="btn btn-success">
                    ➕ Nueva Actividad
                </Link>
            </div>

            {/* Filtros */}
            <div className="search-bar" style={{ marginBottom: '20px' }}>
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
                    value={diaSeleccionado}
                    onChange={(e) => setDiaSeleccionado(e.target.value)}
                    className="form-control"
                >
                    <option value="">Todos los días</option>
                    {diasSemana.map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                    ))}
                </select>
            </div>

            {/* Información de filtros activos */}
            {(search || categoria || diaSeleccionado) && (
                <div style={{
                    marginBottom: '20px',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
                    borderRadius: '8px',
                    border: '1px solid #bee3f8'
                }}>
                    <p style={{ margin: 0, color: '#2b6cb0', fontWeight: '600' }}>
                        🔍 Filtros activos:
                        {search && ` "${search}"`}
                        {categoria && ` | ${categoria}`}
                        {diaSeleccionado && ` | ${diaSeleccionado}`}
                        <button
                            onClick={() => {
                                setSearch('');
                                setCategoria('');
                                setDiaSeleccionado('');
                            }}
                            style={{
                                marginLeft: '10px',
                                background: 'none',
                                border: 'none',
                                color: '#2b6cb0',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Limpiar filtros
                        </button>
                    </p>
                </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {loading ? (
                <div className="loading">Cargando actividades</div>
            ) : (
                <div className="card">
                    <h2>📋 Gestión de Actividades ({actividades.length} resultados)</h2>

                    {actividades.length === 0 ? (
                        <p>No hay actividades que coincidan con los filtros seleccionados.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Título</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Categoría</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Horario</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Profesor</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Cupo</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {actividades.map(actividad => (
                                    <tr key={actividad.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px' }}>{actividad.titulo}</td>
                                        <td style={{ padding: '12px' }}>
                        <span style={{
                            background: '#667eea',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                        }}>
                          {actividad.categoria}
                        </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {formatearHorario(actividad.dia, actividad.horario)}
                                        </td>
                                        <td style={{ padding: '12px' }}>{actividad.profesor}</td>
                                        <td style={{ padding: '12px' }}>
                        <span style={{
                            color: actividad.cupo_disponible === 0 ? '#e53e3e' : '#48bb78',
                            fontWeight: 'bold'
                        }}>
                          {actividad.cupo_disponible || 0} / {actividad.cupo_maximo}
                        </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Link
                                                    to={`/admin/editar-actividad/${actividad.id}`}
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                                >
                                                    ✏️ Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(actividad.id, actividad.titulo)}
                                                    className="btn btn-danger"
                                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;