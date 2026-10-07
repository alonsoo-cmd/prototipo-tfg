const athleteNavigation = [
  ['Dashboard', '⌂', 'Inicio'],
  ['Diary', '▦', 'Diario'],
  ['Data', '◌', 'Datos'],
];

const coachNavigation = [
  ['Athletes', '♧', 'Atletas'],
  ['Preparations', '▤', 'Preparaciones'],
  ['Workouts', '▣', 'Entrenamientos'],
];

export default function Sidebar({ role, page, onRoleChange, onNavigate, mobileOpen = false }) {
  const navigate = (nextRole, nextPage) => onRoleChange(nextRole, nextPage);
  const renderItems = (items, itemRole) => items.map(([name, icon, label]) => (
    <button
      key={name}
      className={`nav-item ${page === name ? 'active' : ''}`}
      onClick={() => navigate(itemRole, name)}
      aria-current={page === name ? 'page' : undefined}
    >
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      {label}
      <span className="nav-arrow" aria-hidden="true">›</span>
    </button>
  ));

  return <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
    <div className="brand"><span className="brand-mark">s</span><span>stride<span className="brand-dot">.</span></span></div>
    <div className="workspace-label">WORKSPACE</div>
    <div className="role-switch" aria-label="Cambiar de rol">
      <button className={role === 'atleta' ? 'selected' : ''} onClick={() => onRoleChange('atleta', 'Dashboard')}>Atleta</button>
      <button className={role === 'entrenador' ? 'selected' : ''} onClick={() => onRoleChange('entrenador', 'Dashboard')}>Entrenador</button>
    </div>
    <nav className="sidebar-groups" aria-label="Navegación principal">
      {role === 'entrenador' ? <>
        <section className="sidebar-group">
          <h2 className="nav-label">ATLETA</h2>
          {renderItems(athleteNavigation.filter(([name]) => name !== 'Dashboard'), 'entrenador')}
        </section>
        <section className="sidebar-group">
          <h2 className="nav-label">ENTRENADOR</h2>
          {renderItems(coachNavigation, 'entrenador')}
        </section>
        <section className="sidebar-group profile-navigation">
          <h2 className="nav-label">CUENTA</h2>
          <button className={`nav-item ${page === 'Profile' ? 'active' : ''}`} onClick={() => onNavigate('Profile')} aria-current={page === 'Profile' ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">○</span>Perfil<span className="nav-arrow" aria-hidden="true">›</span>
          </button>
        </section>
      </> : <section className="sidebar-group athlete-only-navigation">
        <h2 className="nav-label">MENÚ</h2>
        {renderItems(athleteNavigation, 'atleta')}
        <button className={`nav-item ${page === 'Profile' ? 'active' : ''}`} onClick={() => onNavigate('Profile')} aria-current={page === 'Profile' ? 'page' : undefined}>
          <span className="nav-icon" aria-hidden="true">○</span>Perfil<span className="nav-arrow" aria-hidden="true">›</span>
        </button>
      </section>}
    </nav>
    <div className="side-bottom"><div className="mini-avatar">AM</div><div><b>Alex Martín</b><small>{role === 'atleta' ? 'Atleta · Madrid' : 'Entrenador'}</small></div><button className="dots">···</button></div>
  </aside>;
}
