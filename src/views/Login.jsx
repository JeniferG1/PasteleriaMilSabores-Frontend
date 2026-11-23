import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { loginUsuario } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (password.length < 4 || password.length > 10) {
      setError('La contraseña debe tener entre 4 y 10 caracteres.');
      return;
    }

    const resultado = await loginUsuario(email, password);

    if (!resultado.success) {
      setError(resultado.message);
      return;
    }

    if (resultado.usuario?.rol === 'admin' || resultado.usuario?.rol === 'vendedor') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 rounded-3 p-4 bg-white">
            <h2 className="text-center fw-bold mb-4">Iniciar Sesión</h2>

            {error && (
              <div className="alert alert-danger fw-semibold" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="login-email" className="form-label fw-semibold">
                  Correo Electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  maxLength={100}
                  className="form-control"
                  placeholder="correo@ejemplo.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="login-password" className="form-label fw-semibold">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  minLength={4}
                  maxLength={10}
                  className="form-control"
                  placeholder="Entre 4 y 10 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-warning w-100 fw-bold py-2 rounded-pill mt-3">
                Ingresar
              </button>
            </form>

            <hr className="my-4" />
            <div className="text-center">
              <small className="text-muted">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}