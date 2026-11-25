import React, { useState } from 'react';

const FORM_INICIAL = {
  nombre: '',
  correo: '',
  mensaje: ''
};

export default function Contacto() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [enviadoExito, setEnviadoExito] = useState(false);

  const validar = () => {
    const nuevosErrores = {};
    const correoTrim = form.correo.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'Ingresa tu nombre completo.';
    }

    if (!correoTrim || !emailRegex.test(correoTrim)) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.';
    }

    if (!form.mensaje.trim() || form.mensaje.trim().length < 8) {
      nuevosErrores.mensaje = 'Escribe un mensaje de al menos 8 caracteres.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;

    const nuevaConsulta = {
      id: Date.now(),
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      mensaje: form.mensaje.trim(),
      fecha: new Date().toLocaleString('es-CL')
    };

    try {
      const prev = JSON.parse(localStorage.getItem('consultas_milsabores') || '[]');
      localStorage.setItem('consultas_milsabores', JSON.stringify([nuevaConsulta, ...prev]));
    } catch {
      
    }

    setEnviadoExito(true);
    setForm(FORM_INICIAL);
    setErrores({});
  };

  return (
    <div className="container py-5">
      <div className="text-center mx-auto mb-5" style={{ maxWidth: '680px' }}>
        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
          ✉️ Contacto
        </span>
        <h1 className="display-6 fw-bold mb-3">Escríbenos tus Consultas o Comentarios</h1>
        <p className="text-muted">
          ¿Tienes dudas sobre pedidos especiales, cotizaciones o algún producto? Completa el formulario y te responderemos a la brevedad.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <h4 className="fw-bold mb-3">Canales de Atención</h4>
            <p className="text-muted small mb-4">
              Nuestro equipo de pastelería y atención al cliente está disponible para ayudarte con tus celebraciones y consultas.
            </p>

            <div className="mb-3">
              <div className="fw-semibold">📧 Correo Electrónico</div>
              <div className="text-muted small">contacto@milsabores.cl</div>
            </div>

            <div className="mb-3">
              <div className="fw-semibold">📞 Teléfono</div>
              <div className="text-muted small">+56 2 2840 5090</div>
            </div>

            <div className="mb-3">
              <div className="fw-semibold">🕒 Horario de Atención</div>
              <div className="text-muted small">Lunes a Domingo · 09:00 a 20:00 hrs</div>
            </div>

          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h4 className="fw-bold mb-3">Formulario de Contacto</h4>

            {enviadoExito && (
              <div className="alert alert-success rounded-3" role="alert">
                <div className="fw-bold mb-1">¡Mensaje enviado con éxito!</div>
                <div className="small">
                  Gracias por escribirnos. Hemos registrado tu consulta y nos pondremos en contacto pronto.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="contacto-nombre" className="form-label fw-semibold">
                  Nombre *
                </label>
                <input
                  id="contacto-nombre"
                  type="text"
                  name="nombre"
                  className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                  placeholder="Ej: Valentina Soto"
                  value={form.nombre}
                  onChange={handleChange}
                />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="contacto-correo" className="form-label fw-semibold">
                  Correo electrónico *
                </label>
                <input
                  id="contacto-correo"
                  type="email"
                  name="correo"
                  className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                  placeholder="nombre@ejemplo.cl"
                  value={form.correo}
                  onChange={handleChange}
                />
                {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
              </div>

              <div className="mb-4">
                <label htmlFor="contacto-mensaje" className="form-label fw-semibold">
                  Mensaje *
                </label>
                <textarea
                  id="contacto-mensaje"
                  name="mensaje"
                  rows="5"
                  className={`form-control ${errores.mensaje ? 'is-invalid' : ''}`}
                  placeholder="Escribe aquí tu consulta, comentario o solicitud..."
                  value={form.mensaje}
                  onChange={handleChange}
                />
                {errores.mensaje && <div className="invalid-feedback">{errores.mensaje}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-warning text-dark fw-bold rounded-pill px-4 py-2 shadow-sm"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
