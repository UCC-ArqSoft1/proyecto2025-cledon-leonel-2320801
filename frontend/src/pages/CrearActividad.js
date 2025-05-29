import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { actividadesAPI } from '../services/api';

const CrearActividad = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        categoria: '',
        descripcion: '',
        dias: [], // Array de días seleccionados
        horario: '',
        duracion_minutos: '',
        cupo_maximo: '',
        profesor: '',
        foto_url: '',
        todo_el_dia: false, // Nueva opción
        horario_inicio: '06:00',
        horario_fin: '22:00'
    });

    const categorias = ['Yoga', 'Pilates', 'Crossfit', 'Spinning', 'Aeróbicos', 'Musculación'];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horarios = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDiaChange = (dia) => {
        setFormData(prev => ({
            ...prev,
            dias: prev.dias.includes(dia)
                ? prev.dias.filter(d => d !== dia)
                : [...prev.dias, dia]
        }));
    };

    const seleccionarTodosLosDias = () => {
        setFormData(prev => ({
            ...prev,
            dias: prev.dias.length === diasSemana.length ? [] : [...diasSemana]
        }));
    };

    const generarHorariosRango = (inicio, fin) => {
        const horariosRango = [];
        const inicioIndex = horarios.indexOf(inicio);
        const finIndex = horarios.indexOf(fin);

        for (let i = inicioIndex; i <= finIndex; i++) {
            if (horarios[i]) {
                horariosRango.push(horarios[i]);
            }
        }
        return horariosRango;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.dias.length === 0) {
            setError('Debes seleccionar al menos un día de la semana');
            setLoading(false);
            return;
        }

        try {
            const promesasActividades = [];

            for (const dia of formData.dias) {
                if (formData.todo_el_dia) {
                    // Crear actividades para cada hora del rango
                    const horariosRango = generarHorariosRango(formData.horario_inicio, formData.horario_fin);

                    for (const horario of horariosRango) {
                        const data = {
                            titulo: `${formData.titulo} - ${horario}`,
                            categoria: formData.categoria,
                            descripcion: formData.descripcion + ` (Disponible de ${formData.horario_inicio} a ${formData.horario_fin})`,
                            dia: dia,
                            horario: horario,
                            duracion_minutos: parseInt(formData.duracion_minutos),
                            cupo_maximo: parseInt(formData.cupo_maximo),
                            profesor: formData.profesor,
                            foto_url: formData.foto_url
                        };
                        promesasActividades.push(actividadesAPI.create(data));
                    }
                } else {
                    // Crear actividad normal para horario específico
                    const data = {
                        titulo: formData.titulo,
                        categoria: formData.categoria,
                        descripcion: formData.descripcion,
                        dia: dia,
                        horario: formData.horario,
                        duracion_minutos: parseInt(formData.duracion_minutos),
                        cupo_maximo: parseInt(formData.cupo_maximo),
                        profesor: formData.profesor,
                        foto_url: formData.foto_url
                    };
                    promesasActividades.push(actividadesAPI.create(data));
                }
            }

            await Promise.all(promesasActividades);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Error creando actividad(es)');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin()) {
        return <div className="container">❌ No tienes permisos para acceder a esta página.</div>;
    }

    const calcularTotalActividades = () => {
        if (formData.todo_el_dia) {
            const horariosRango = generarHorariosRango(formData.horario_inicio, formData.horario_fin);
            return formData.dias.length * horariosRango.length;
        }
        return formData.dias.length;
    };

    return (
        <div className="container">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <Link to="/admin" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                    ← Volver al Panel
                </Link>

                <div className="card">
                    <h1>➕ Crear Nueva Actividad</h1>

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
                                placeholder="Ej: Sala de Musculación"
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
                                placeholder="Describe la actividad..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Días de la semana *</label>
                            <button
                                type="button"
                                onClick={seleccionarTodosLosDias}
                                className="todos-los-dias"
                                style={{
                                    background: formData.dias.length === diasSemana.length
                                        ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                {formData.dias.length === diasSemana.length ? '✅ Desmarcar todos' : '📅 Todos los días'}
                            </button>
                            <div className="dias-semana">
                                {diasSemana.map(dia => (
                                    <div key={dia} className="dia-checkbox">
                                        <input
                                            type="checkbox"
                                            id={dia}
                                            checked={formData.dias.includes(dia)}
                                            onChange={() => handleDiaChange(dia)}
                                        />
                                        <label htmlFor={dia}>{dia}</label>
                                    </div>
                                ))}
                            </div>
                            {formData.dias.length > 0 && (
                                <p style={{ fontSize: '14px', color: '#667eea', marginTop: '10px' }}>
                                    📋 Seleccionados: {formData.dias.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Opción "Todo el día" */}
                        <div className="form-group">
                            <div style={{
                                background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #bee3f8'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="todo_el_dia"
                                        checked={formData.todo_el_dia}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', accentColor: '#667eea' }}
                                    />
                                    <span style={{ fontWeight: '600', color: '#2b6cb0' }}>
                    🕐 Actividad disponible todo el día (ideal para Musculación)
                  </span>
                                </label>
                                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0 0 30px' }}>
                                    Crea múltiples horarios automáticamente en el rango seleccionado
                                </p>
                            </div>
                        </div>

                        {formData.todo_el_dia ? (
                            // Mostrar selectores de rango horario
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">🌅 Horario de apertura *</label>
                                    <select
                                        name="horario_inicio"
                                        value={formData.horario_inicio}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    >
                                        {horarios.map(hora => (
                                            <option key={hora} value={hora}>{hora}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">🌙 Horario de cierre *</label>
                                    <select
                                        name="horario_fin"
                                        value={formData.horario_fin}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    >
                                        {horarios.map(hora => (
                                            <option key={hora} value={hora}>{hora}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            // Mostrar selector de horario único
                            <div className="form-group">
                                <label className="form-label">Horario *</label>
                                <select
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    required={!formData.todo_el_dia}
                                    className="form-control"
                                >
                                    <option value="">Seleccionar horario</option>
                                    {horarios.map(hora => (
                                        <option key={hora} value={hora}>{hora}</option>
                                    ))}
                                </select>
                            </div>
                        )}

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
                                    placeholder="60"
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
                                    placeholder="20"
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
                                placeholder="Nombre del instructor"
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
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-success"
                                style={{ flex: '1', minWidth: '200px' }}
                            >
                                {loading ? '⏳ Creando...' : `✅ Crear ${calcularTotalActividades()} ${calcularTotalActividades() === 1 ? 'Actividad' : 'Actividades'}`}
                            </button>

                            <Link to="/admin" className="btn btn-secondary" style={{ flex: '1', minWidth: '150px' }}>
                                ❌ Cancelar
                            </Link>
                        </div>

                        {calcularTotalActividades() > 1 && (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                background: 'linear-gradient(135deg, #f0fff4 0%, #f0f8ff 100%)',
                                borderRadius: '8px',
                                border: '1px solid #bee3f8'
                            }}>
                                <p style={{ margin: 0, color: '#2b6cb0', fontWeight: '600' }}>
                                    ℹ️ Se crearán {calcularTotalActividades()} actividades en total
                                    {formData.todo_el_dia && (
                                        <span> (de {formData.horario_inicio} a {formData.horario_fin})</span>
                                    )}
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearActividad;