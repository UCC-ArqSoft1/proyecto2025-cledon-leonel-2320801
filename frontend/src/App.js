import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // ← NUEVA IMPORTACIÓN
import ActividadDetalle from './pages/ActividadDetalle';
import MisActividades from './pages/MisActividades';
import AdminPanel from './pages/AdminPanel';
import CrearActividad from './pages/CrearActividad';
import EditarActividad from './pages/EditarActividad';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} /> {/* ← NUEVA RUTA */}
                            <Route path="/actividades/:id" element={<ActividadDetalle />} />
                            <Route path="/mis-actividades" element={<MisActividades />} />

                            {/* Rutas de administrador */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requiredRole="administrador">
                                        <AdminPanel />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/crear-actividad"
                                element={
                                    <ProtectedRoute requiredRole="administrador">
                                        <CrearActividad />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/editar-actividad/:id"
                                element={
                                    <ProtectedRoute requiredRole="administrador">
                                        <EditarActividad />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;