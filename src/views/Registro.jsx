import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, esCorreoDuoc } from '../context/AuthContext';
import { regionesComunas, nombresRegiones } from '../data/regionesComunas';

export default function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    fechaNacimiento: '',
    region: '',
    comuna: '',
    password: '',
    confirmarPassword: ''
  });

  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');

  const { registrarUsuario } = useAuth();
  const navigate = useNavigate();

  const comunasDisponibles = formData.region ? regionesComunas[formData.region] || [] : [];

  const calcularEdad = (fechaNac) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'region') {
      setFormData({ ...formData, region: value, comuna: '' });
      setErrores({ ...errores, region: '', comuna: '' });
      return;
    }

    setFormData({ ...formData, [name]: value });
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre.trim() || formData.nombre.trim().length < 3 || formData.nombre.trim().length > 100) {
      nuevosErrores.nombre = 'El nombre debe tener entre 3 y 100 caracteres.';
    }

    if (!emailRegex.test(formData.email) || formData.email.length > 100) {
      nuevosErrores.email = 'Ingresa un correo electrónico válido (máx. 100 caracteres).';
    }

    if (!formData.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    } else {
      const edad = calcularEdad(formData.fechaNacimiento);
      if (edad < 14) {
        nuevosErrores.fechaNacimiento = 'Debes tener al menos 14 años para registrarte.';
      } else if (edad > 120) {
        nuevosErrores.fechaNacimiento = 'Por favor ingresa una fecha de nacimiento válida.';
      }
    }

    if (!formData.region) {
      nuevosErrores.region = 'Selecciona tu región.';
    }

    if (!formData.comuna) {
      nuevosErrores.comuna = 'Selecciona tu comuna.';
    }

    if (formData.password.length < 4 || formData.password.length > 10) {
      nuevosErrores.password = 'La contraseña debe tener entre 4 y 10 caracteres.';
    }

    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const edad = calcularEdad(formData.fechaNacimiento);
    const tieneDescuentoSenior = edad >= 50;
    const tieneBeneficioDuoc = esCorreoDuoc(formData.email);

    const nuevoUsuario = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim().toLowerCase(),
      fechaNacimiento: formData.fechaNacimiento,
      region: formData.region,
      comuna: formData.comuna,
      password: formData.password,
      edad,
      esSenior: tieneDescuentoSenior,
      esDuoc: tieneBeneficioDuoc,
      descuento: tieneDescuentoSenior ? 0.50 : 0,
      rol: 'cliente'
    };

    const resultado = await registrarUsuario(nuevoUsuario);

    if (!resultado.success) {
      setErrores({ ...errores, email: resultado.message });
      return;
    }

    let beneficiosTexto = [];
    if (tieneDescuentoSenior) {
      beneficiosTexto.push('50% de descuento permanente por tener 50+ años');
    }
    if (tieneBeneficioDuoc) {
      beneficiosTexto.push('torta gratis en tu cumpleaños por correo institucional Duoc UC');
    }

    setMensajeExito(
      beneficiosTexto.length > 0
        ? `¡Cuenta creada! Beneficios activados: ${beneficiosTexto.join(' y ')}. Redirigiendo...`
        : '¡Cuenta creada con éxito! Redirigiendo al inicio...'
    );

    setTimeout(() => {
      navigate('/');
    }, 2200);
  };

  const detectadoDuoc = esCorreoDuoc(formData.email);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-3 p-4 bg-white">
            <h2 className="text-center fw-bold mb-4">Crear Cuenta 🍰</h2>

            {mensajeExito && (
              <div className="alert alert-success fw-semibold" role="alert">
                {mensajeExito}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  maxLength={100}
                  className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                  placeholder="Ej: Camila Soto"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  maxLength={100}
                  className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                  placeholder="usuario@duoc.cl o correo@ejemplo.cl"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errores.email ? (
                  <div className="invalid-feedback">{errores.email}</div>
                ) : detectadoDuoc ? (
                  <small className="text-success fw-semibold d-block mt-1">
                    🎓 Correo Duoc UC detectado: ¡Torta gratis activada para tu cumpleaños!
                  </small>
                ) : (
                  <small className="text-muted d-block mt-1">
                    🎓 Si usas tu correo institucional Duoc UC (@duoc.cl / @duocuc.cl), obtienes una torta gratis en tu cumpleaños.
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  className={`form-control ${errores.fechaNacimiento ? 'is-invalid' : ''}`}
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                />
                {errores.fechaNacimiento ? (
                  <div className="invalid-feedback">{errores.fechaNacimiento}</div>
                ) : (
                  <small className="text-muted d-block mt-1">
                    👵 Beneficio Mil Sabores: 50% de descuento automático si tienes 50+ años.
                  </small>
                )}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Región</label>
                  <select
                    name="region"
                    className={`form-select ${errores.region ? 'is-invalid' : ''}`}
                    value={formData.region}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona región...</option>
                    {Object.keys(regionesComunas).map((key) => (
                      <option key={key} value={key}>
                        {nombresRegiones[key] || key}
                      </option>
                    ))}
                  </select>
                  {errores.region && <div className="invalid-feedback">{errores.region}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Comuna</label>
                  <select
                    name="comuna"
                    className={`form-select ${errores.comuna ? 'is-invalid' : ''}`}
                    value={formData.comuna}
                    onChange={handleChange}
                    disabled={!formData.region}
                  >
                    <option value="">
                      {formData.region ? 'Selecciona comuna...' : 'Primero elige una región'}
                    </option>
                    {comunasDisponibles.map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna}
                      </option>
                    ))}
                  </select>
                  {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  minLength={4}
                  maxLength={10}
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  placeholder="Entre 4 y 10 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errores.password && <div className="invalid-feedback">{errores.password}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmarPassword"
                  minLength={4}
                  maxLength={10}
                  className={`form-control ${errores.confirmarPassword ? 'is-invalid' : ''}`}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                />
                {errores.confirmarPassword && (
                  <div className="invalid-feedback">{errores.confirmarPassword}</div>
                )}
              </div>

              <button type="submit" className="btn btn-warning w-100 fw-bold py-2 rounded-pill mt-3">
                Registrarse
              </button>
            </form>

            <hr className="my-4" />
            <div className="text-center">
              <small className="text-muted">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}