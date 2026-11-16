import { PAGES, ROLE_SUBTITLES, athleteNavigation, coachNavigation } from '../../routes/navigation.js';
import { currentUser } from '../../data/initialState.js';

export default function Sidebar({ role, page, onRoleChange, onNavigate, activePlan = true, onTogglePlan, mobileOpen = false }) {
  const navigate = (nextRole, nextPage) => onRoleChange(nextRole, nextPage);
  const renderItems = (items, itemRole) => items.map((name) => (
    <button
      key={name}
      className={`nav-item ${page === name ? 'active' : ''}`}
      onClick={() => navigate(itemRole, name)}
      aria-current={page === name ? 'page' : undefined}
    >
      <span className="nav-icon" aria-hidden="true">{PAGES[name].icon}</span>
      {PAGES[name].label}
      <span className="nav-arrow" aria-hidden="true">›</span>
    </button>
  ));

  return <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
    <div className="brand"><span className="brand-mark">e</span><span>edurance<span className="brand-dot">.</span></span></div>
    <div className="demo-mode" role="group" aria-labelledby="demo-mode-label">
      <div className="workspace-label" id="demo-mode-label">MODO DEMOSTRACIÓN</div>
      <div className="role-switch">
        <button type="button" aria-pressed={role === 'atleta'} className={role === 'atleta' ? 'selected' : ''} onClick={() => onRoleChange('atleta', 'Dashboard')}>Atleta</button>
        <button type="button" aria-pressed={role === 'grupo'} className={role === 'grupo' ? 'selected' : ''} onClick={() => onRoleChange('grupo', 'Dashboard')}>Grupo</button>
        <button type="button" aria-pressed={role === 'entrenador'} className={role === 'entrenador' ? 'selected' : ''} onClick={() => onRoleChange('entrenador', 'Dashboard')}>Entrenador</button>
      </div>
      {role !== 'grupo' && <label className="demo-plan-toggle">
        <input type="checkbox" checked={!activePlan} onChange={(event) => onTogglePlan(!event.target.checked)} />
        Sin preparación
      </label>}
      <small className="demo-mode-help">Cambia de vista para probar el prototipo. En la versión real dependerá de tu cuenta.</small>
    </div>
    <nav className="sidebar-groups" aria-label="Navegación principal">
      {role === 'entrenador' ? <>
        <section className="sidebar-group">
          <h2 className="nav-label">MI ENTRENAMIENTO</h2>
          {renderItems(activePlan ? athleteNavigation : [...athleteNavigation, 'Find coach'], 'entrenador')}
        </section>
        <section className="sidebar-group">
          <h2 className="nav-label">ENTRENADOR</h2>
          {renderItems(coachNavigation, 'entrenador')}
        </section>
        <section className="sidebar-group profile-navigation">
          <h2 className="nav-label">CUENTA</h2>
          <button className={`nav-item ${page === 'Profile' ? 'active' : ''}`} onClick={() => onNavigate('Profile')} aria-current={page === 'Profile' ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden="true">{PAGES.Profile.icon}</span>{PAGES.Profile.label}<span className="nav-arrow" aria-hidden="true">›</span>
          </button>
        </section>
      </> : <section className="sidebar-group athlete-only-navigation">
        <h2 className="nav-label">MENÚ</h2>
        {/* «Buscar entrenador» solo existe para quien aún no tiene preparación (y, por tanto, entrenador). */}
        {renderItems(role === 'atleta' && !activePlan ? [...athleteNavigation, 'Find coach'] : athleteNavigation, role)}
        <button className={`nav-item ${page === 'Profile' ? 'active' : ''}`} onClick={() => onNavigate('Profile')} aria-current={page === 'Profile' ? 'page' : undefined}>
          <span className="nav-icon" aria-hidden="true">{PAGES.Profile.icon}</span>{PAGES.Profile.label}<span className="nav-arrow" aria-hidden="true">›</span>
        </button>
      </section>}
    </nav>
    <div className="side-bottom"><div className="mini-avatar">{currentUser.initials}</div><div><b>{currentUser.name}</b><small>{ROLE_SUBTITLES[role]}</small></div></div>
  </aside>;
}
