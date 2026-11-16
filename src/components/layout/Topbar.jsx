import { ROLE_AREAS, pageLabel } from '../../routes/navigation.js';

export default function Topbar({ role, page, onMenuClick, menuOpen = false }) {
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenuClick} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>☰</button><div className="breadcrumb">{ROLE_AREAS[role] || ROLE_AREAS.atleta} <span>/</span> <b>{pageLabel(page)}</b></div><div className="top-actions"><span className="demo-pill"><i/> Datos de ejemplo</span><button className="icon-button" aria-label="Notificaciones">♧<em>2</em></button><div className="top-avatar">AM</div></div></header>;
}
