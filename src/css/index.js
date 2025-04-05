/**
 * Archivo central para exportar todos los estilos CSS
 * Permite importar todos los estilos desde una ubicación centralizada
 */

// Estilos de componentes principales
import './Navbar.css';
import './NavBarUsuario.css';
import './Footer.css';
import './Banner.css';

// Estilos de secciones
import './AboutSection.css';
import './ContentSection.css';
import './TestimonialSection.css';

// Estilos de componentes modales
import './ModalInfoUsuario.css';
import './ModalIniciarSesion.css';
import './ModalRegistrarse.css';
import './ModalRegistroNegocio.css';
import './ModalRegistroComentario.css';
import './ModalEliminar.css';
import './ModalEliminarNegocio.css';
import './ModalActualizarUsuario.css';
import './ModalActualizarNegocio.css';

// Estilos de vistas
import './VistaUsuarios.css';
import './VistaNegociosEmprendimientos.css';
import './VistaComentariosYCalificaciones.css';

// Estilos de noticias
import './NewsFeed.css';
import './NoticiaDetalle.css';

// Estilos de gráficas
import './GraficasProductos.css';

// Exportamos una constante para confirmar que los estilos se han cargado
export const CSS_LOADED = true; 