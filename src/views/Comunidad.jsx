import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import DOMPurify from 'dompurify';

const ARTICULOS_HISTORIA = [
  {
    id: 'blog-guinness-1995',
    etiqueta: 'Hito Histórico · 1995',
    titulo: 'El Récord Guinness de 1995: la torta más grande que unió a todo Chile',
    fecha: 'Archivo Histórico · 1995',
    imagen: '/img/portada4.jpg',
    resumen:
      'Revive la hazaña de nuestros maestros pasteleros en 1995, cuando horneamos y decoramos una torta monumental que nos valió un Récord Guinness.',
    contenido: `
      <p>En <strong>1995</strong>, Pastelería Mil Sabores marcó un antes y un después en la repostería nacional al alcanzar un <strong>Récord Guinness</strong> con la preparación de una torta gigante elaborada de forma artesanal.</p>
      <p>Durante días, decenas de maestros pasteleros trabajaron de manera coordinada batiendo bizcochos, preparando rellenos tradicionales de manjar y crema, y decorando cada tramo ante miles de familias que se acercaron a celebrar.</p>
      <ul>
        <li><strong>Trabajo en equipo:</strong> Más de 40 especialistas en pastelería y logística participaron en el montaje.</li>
        <li><strong>Sabor tradicional:</strong> Se utilizaron recetas clásicas chilenas con ingredientes frescos seleccionados.</li>
        <li><strong>Legado comunitario:</strong> Miles de porciones fueron compartidas con los asistentes y organizaciones sociales.</li>
      </ul>
    `
  },
  {
    id: 'blog-50-anos',
    etiqueta: 'Aniversario · 50 Años',
    titulo: '50 años de trayectoria: medio siglo endulzando celebraciones familiares',
    fecha: 'Especial Aniversario',
    imagen: '/img/Trayectoria.jpg',
    resumen:
      'Desde nuestros primeros hornos hasta hoy, repasamos cinco décadas de dedicación, recetas heredadas y compromiso con cada cliente.',
    contenido: `
      <p>Cumplir <strong>50 años de historia</strong> es el reflejo del cariño de generaciones de familias que nos han elegido para sus cumpleaños, matrimonios y reuniones de domingo.</p>
      <p>A lo largo de estas cinco décadas hemos mantenido intacta nuestra esencia artesanal, incorporando además opciones <strong>sin azúcar, sin gluten y veganas</strong> para que nadie quede fuera de la mesa.</p>
      <p>Como agradecimiento a quienes nos han acompañado durante tantos años, mantenemos activo nuestro <strong>beneficio especial del 50% de descuento</strong> para clientes mayores de 50 años en toda nuestra tienda.</p>
    `
  }
];

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

  // Estado para el modal de lectura de artículos del Blog
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

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
      {/* Encabezado Principal */}
      <div className="text-center mx-auto mb-5" style={{ maxWidth: '720px' }}>
        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
          📖 Blogs & Comunidad Mil Sabores
        </span>
        <h1 className="display-6 fw-bold mb-3">Nuestra Historia, Consejos y Reseñas</h1>
        <p className="text-muted">
          Conoce los hitos que marcaron nuestros 50 años de tradición artesanal y comparte tus experiencias con nuestra comunidad.
        </p>
        <hr className="w-25 mx-auto bg-warning" />
      </div>

      {/* SECCIÓN 1: ARTÍCULOS DEL BLOG (HISTORIA DE LA PASTELERÍA) */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="fw-bold mb-0">📰 Crónicas y Blogs de Nuestra Pastelería</h3>
          <span className="text-muted small d-none d-md-inline">Haz clic en "Leer artículo" para ver la historia completa</span>
        </div>

        <div className="row g-4">
          {ARTICULOS_HISTORIA.map((art) => (
            <div className="col-md-6" key={art.id}>
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
                <div style={{ height: '210px', overflow: 'hidden' }}>
                  <img
                    src={art.imagen}
                    alt={art.titulo}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/img/product_1.jpg';
                    }}
                  />
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-dark text-warning px-3 py-2 rounded-pill">
                      {art.etiqueta}
                    </span>
                    <small className="text-muted">{art.fecha}</small>
                  </div>
                  <h4 className="fw-bold mt-2 mb-2">{art.titulo}</h4>
                  <p className="text-muted small flex-grow-1 mb-4">{art.resumen}</p>
                  <div className="mt-auto">
                    <button
                      type="button"
                      className="btn btn-outline-dark rounded-pill px-4 fw-bold"
                      onClick={() => setArticuloSeleccionado(art)}
                    >
                      Leer artículo completo →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-5" />

      {/* SECCIÓN 2: MURO INTERACTIVO DE RESEÑAS, TIPS Y ANUNCIOS */}
      <div className="mb-4">
        <h3 className="fw-bold">💬 Muro de la Comunidad: Reseñas, Recetas y Anuncios</h3>
        <p className="text-muted small">
          Revisa los consejos de nuestros maestros pasteleros, anuncios oficiales y opiniones de clientes.
        </p>
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

      {articuloSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1050 }}
          onClick={() => setArticuloSeleccionado(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <div>
                  <span className="badge bg-dark text-warning px-3 py-2 rounded-pill me-2">
                    {articuloSeleccionado.etiqueta}
                  </span>
                  <small className="text-muted">{articuloSeleccionado.fecha}</small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setArticuloSeleccionado(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="text-center bg-light rounded-3 p-3 mb-4">
                  <img
                    src={articuloSeleccionado.imagen}
                    alt={articuloSeleccionado.titulo}
                    className="img-fluid rounded-3"
                    style={{ maxHeight: '380px', width: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/img/product_1.jpg';
                    }}
                  />
                </div>

                <h3 className="fw-bold mb-3">{articuloSeleccionado.titulo}</h3>
                <div
                  className="text-muted"
                  style={{ lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(articuloSeleccionado.contenido)
                  }}
                />
                <div className="text-end mt-4">
                  <button
                    type="button"
                    className="btn btn-warning rounded-pill px-4 fw-bold"
                    onClick={() => setArticuloSeleccionado(null)}
                  >
                    Cerrar lectura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
