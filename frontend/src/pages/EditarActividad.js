import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { actividadesAPI } from '../services/api';

const EditarActividad = () => {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        categoria: '',
        descripcion: '',
        dia: '',
        horario: '',
        duracion_minutos: '',
        cupo_maximo: '',
        profesor: '',
        foto_url: ''
    });

    const categorias = ['Yoga', 'Pilates', 'Crossfit', 'Spinning', 'Aeróbicos', 'Musculación'];
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horarios = ['06:00', '07:00', '08:00', '09:00', '10:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    useEffect(() => {
        fetchActividad();
    }, [id]);

    const fetchActividad = async () => {
        try {
            setLoadingData(true);
            const response = await actividadesAPI.getById(id);
            const actividad = response.data;

            setFormData({
                titulo: actividad.titulo || '',
                categoria: actividad.categoria || '',
                descripcion: actividad.descripcion || '',
                dia: actividad.dia || '',
                horario: actividad.horario || '',
                duracion_minutos: actividad.duracion_minutos?.toString() || '',
                cupo_maximo: actividad.cupo_maximo?.toString() || '',
                profesor: actividad.profesor || '',
                foto_url: actividad.foto_url || ''
            });
        } catch (err) {
            setError('Error cargando actividad');
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = {
                ...formData,
                duracion_minutos: parseInt(formData.duracion_minutos),
                cupo_maximo: parseInt(formData.cupo_maximo)
            };

            await actividadesAPI.update(id, data);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Error actualizando actividad');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin()) {
        return <div className="container">❌ No tienes permisos para acceder a esta página.</div>;
    }

    if (loadingData) {
        return <div className="loading">Cargando actividad...</div>;
    }

    return (
        <div className="container">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                    ← Volver al Panel
                </Link>

                <div className="card">
                    <h1>✏️ Editar Actividad</h1>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Título *</label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categoría *</label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                required
                                className="form-control"
                            >
                                <option value="">Seleccionar categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="form-control"
                                rows="4"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">Día *</label>
                                <select
                                    name="dia"
                                    value={formData.dia}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Seleccionar día</option>
                                    {dias.map(dia => (
                                        <option key={dia} value={dia}>{dia}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Horario *</label>
                                <select
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Seleccionar horario</option>
                                    {horarios.map(hora => (
                                        <option key={hora} value={hora}>{hora}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">Duración (minutos) *</label>
                                <input
                                    type="number"
                                    name="duracion_minutos"
                                    value={formData.duracion_minutos}
                                    onChange={handleChange}
                                    required
                                    min="15"
                                    max="180"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Cupo Máximo *</label>
                                <input
                                    type="number"
                                    name="cupo_maximo"
                                    value={formData.cupo_maximo}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="50"
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Profesor *</label>
                            <input
                                type="text"
                                name="profesor"
                                value={formData.profesor}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL de Foto</label>
                            <input
                                type="url"
                                name="foto_url"
                                value={formData.foto_url}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-success"
                            >
                                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                            </button>

                            <Link to="/admin" className="btn btn-secondary">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarActividad;