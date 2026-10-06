const labels = { Dashboard: 'Inicio', Diary: 'Diario', Data: 'Datos' };

export default function Topbar({ role, page, onMenuClick, menuOpen = false }) {
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenuClick} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>☰</button><div className="breadcrumb">{role === 'atleta' ? 'Área del atleta' : 'Área del entrenador'} <span>/</span> <b>{labels[page] || page}</b></div><div className="top-actions"><span className="demo-pill"><i/> Datos de ejemplo</span><button className="icon-button" aria-label="Notificaciones">♧<em>2</em></button><div className="top-avatar">AM</div></div></header>;
}
