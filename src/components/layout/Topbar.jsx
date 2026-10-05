const labels = { Dashboard: 'Inicio', Diary: 'Diario', Data: 'Datos' };

export default function Topbar({ role, page }) {
  return <header className="topbar"><div className="breadcrumb">{role === 'atleta' ? 'Área del atleta' : 'Área del entrenador'} <span>/</span> <b>{labels[page] || page}</b></div><div className="top-actions"><span className="demo-pill"><i/> Datos de ejemplo</span><button className="icon-button" aria-label="Notificaciones">♧<em>2</em></button><div className="top-avatar">AM</div></div></header>;
}
