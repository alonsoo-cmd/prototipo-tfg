import { useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';
import { useAppState } from '../state/useAppState.js';
import AppRoutes from './AppRoutes.jsx';
import AppModals from './AppModals.jsx';

/** Shell de la aplicación: layout (menú lateral + barra superior), página activa y modales globales. */
export default function App() {
  const state = useAppState();
  const { role, page, go, changeRole, mobileNavOpen, setMobileNavOpen, activePlan, togglePlan } = state;

  // Al cambiar de página o de rol, la nueva vista empieza arriba.
  useEffect(() => { window.scrollTo(0, 0); }, [page, role]);

  return <div className="app-shell">
    <Sidebar
      role={role}
      page={page}
      mobileOpen={mobileNavOpen}
      onRoleChange={changeRole}
      activePlan={activePlan}
      onTogglePlan={togglePlan}
      onNavigate={(nextPage) => { go(nextPage); setMobileNavOpen(false); }}
    />
    {mobileNavOpen && <button className="mobile-nav-backdrop" aria-label="Cerrar menú" onClick={() => setMobileNavOpen(false)} />}

    <main className="main-area">
      <Topbar role={role} page={page} onMenuClick={() => setMobileNavOpen((open) => !open)} menuOpen={mobileNavOpen} />
      <AppRoutes state={state} />
    </main>

    <AppModals state={state} />
  </div>;
}
