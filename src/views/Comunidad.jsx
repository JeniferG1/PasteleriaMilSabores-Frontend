import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import DOMPurify from 'dompurify';

export default function Comunidad() {
  const { usuarioLogueado } = useAuth();

  const [publicaciones, setPublicaciones] = useState(() => {
    const guardadas = localStorage.getItem('comunidad_milsabores');
    if (guardadas) return JSON.parse(guardadas);
    return [
      {
        id: 1,
        autor: 'Maestro Pastelero Mil Sabores',
        rol: 'admin',
        tipo: 'Receta & Tip',
        titulo: 'El secreto para conservar tu torta húmeda por más tiempo',
        contenido:
          '<p>Para mantener la frescura de nuestras tortas artesanales, recomendamos:</p><ul><li>Guardar en un recipiente hermético dentro del refrigerador.</li><li>Sacar la torta <strong>20 minutos antes de servir</strong> para que la crema recupere su textura suave.</li></ul>',
        fecha: '15 de Noviembre, 2026'
      },
      {
        id: 2,
        autor: 'Camila R.',
        rol: 'cliente',
        tipo: 'Reseña',
        titulo: '¡La mejor Torta Cuadrada de Chocolate que he probado!',
        contenido:
          '<p>La pedimos para el cumpleaños de mi mamá y llegó puntualísima. El toque de <em>ganache con avellanas</em> es increíble. Totalmente recomendada.</p>',
        fecha: '16 de Noviembre, 2026'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('comunidad_milsabores', JSON.stringify(publicaciones));
  }, [publicaciones]);

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('Reseña');
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handlePublicar = (e) => {
    e.preventDefault();
    const textoPlano = contenido.replace(/<[^>]*>?/gm, '').trim();

    if (!titulo.trim() || titulo.trim().length < 4) {
      setError('Ingresa un título de al menos 4 caracteres.');
      return;
    }
    if (!textoPlano) {
      setError('Escribe el contenido de tu reseña o receta antes de publicar.');
      return;
    }

    const nuevaPublicacion = {
      id: Date.now(),
      autor: usuarioLogueado.nombre,
      rol: usuarioLogueado.rol || 'cliente',
      tipo: usuarioLogueado.rol === 'admin' ? tipo : 'Reseña',
      titulo: titulo.trim(),
      contenido,
      fecha: new Date().toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };

    setPublicaciones([nuevaPublicacion, ...publicaciones]);
    setTitulo('');
    setContenido('');
    setError('');
    setExito('¡Tu publicación ha sido compartida con la comunidad!');
    setTimeout(() => setExito(''), 3500);
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      setPublicaciones(publicaciones.filter((pub) => pub.id !== id));
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mx-auto mb-5" style={{ maxWidth: '680px' }}>
        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
          💬 Comunidad Mil Sabores
        </span>
        <h1 className="display-6 fw-bold mb-3">Reseñas, Recetas y Tips Dulces</h1>
        <p className="text-muted">
          Comparte tu experiencia con nuestros productos o descubre consejos de repostería artesanal.
        </p>
        <hr className="w-25 mx-auto bg-primary" />
      </div>

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 sticky-top" style={{ top: '20px' }}>
            {usuarioLogueado ? (
              <>
                <h4 className="fw-bold mb-1">Nueva Publicación</h4>
                <p className="text-muted small mb-3">
                  Publicando como <strong>{usuarioLogueado.nombre}</strong>
                </p>

                {exito && <div className="alert alert-success py-2 small fw-semibold">{exito}</div>}
                {error && <div className="alert alert-danger py-2 small fw-semibold">{error}</div>}

                <form onSubmit={handlePublicar}>
                  {usuarioLogueado.rol === 'admin' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Tipo de Publicación</label>
                      <select
                        className="form-select"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                      >
                        <option value="Receta & Tip">Receta & Tip</option>
                        <option value="Anuncio">Anuncio Oficial</option>
                        <option value="Reseña">Reseña</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Título *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: ¡Excelente atención y sabor increíble!"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mensaje / Receta *</label>
                    <RichTextEditor
                      value={contenido}
                      onChange={(html) => setContenido(html)}
                      placeholder="Usa negrita, cursiva o listas para dar formato..."
                    />
                  </div>

                  <button type="submit" className="btn btn-warning w-100 rounded-pill py-2 fw-bold shadow-sm">
                    Publicar Comentario ✍️
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="fs-1 mb-2">🔒</div>
                <h5 className="fw-bold mb-2">Inicia sesión para participar</h5>
                <p className="text-muted small mb-3">
                  Solo los clientes registrados pueden dejar reseñas o compartir recetas en nuestra comunidad.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/login" className="btn btn-primary rounded-pill px-4 fw-bold">
                    Ingresar
                  </Link>
                  <Link to="/registro" className="btn btn-outline-dark rounded-pill px-4 fw-bold">
                    Registrarse
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Listado de Publicaciones */}
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-3">
            {publicaciones.map((pub) => (
              <div key={pub.id} className="card border-0 shadow-sm p-4 bg-white rounded-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span
                      className={`badge me-2 ${
                        pub.rol === 'admin' ? 'bg-dark text-warning' : 'bg-warning text-dark'
                      }`}
                    >
                      {pub.tipo}
                    </span>
                    <small className="text-muted">{pub.fecha}</small>
                  </div>

                  {usuarioLogueado?.rol === 'admin' && (
                    <button
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      onClick={() => handleEliminar(pub.id)}
                      title="Eliminar publicación"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <h5 className="fw-bold mb-2">{pub.titulo}</h5>

                <div
                  className="text-muted mb-3"
                  style={{ lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(pub.contenido)
                  }}
                />

                <div className="border-top pt-2 d-flex align-items-center justify-content-between">
                  <small className="text-secondary fw-semibold">
                    Escrito por: {pub.autor}{' '}
                    {pub.rol === 'admin' && <span className="badge bg-secondary ms-1">Equipo Mil Sabores</span>}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}