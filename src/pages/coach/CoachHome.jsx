import { coachAthletes } from '../../data/coachAthletes.js';
import { createInjuryAlerts } from '../../data/injuryAlerts.js';

export default function CoachHome({go,openRequest,requestStatus,weeks,trainingLogs={}}){
  const injuryAlerts = createInjuryAlerts(weeks, trainingLogs, 'Alex Martín');
  return <div className="content">
    <div className="page-heading">
    <div>
    <div className="eyebrow">VISTA ENTRENADOR <span className="bullet">•</span> PREPARACIÓN DE EJEMPLO</div>
    <h1>Panel de entrenador</h1>
    <p>Gestiona atletas, preparaciones y solicitudes.</p>
    </div>
    <button className="button primary" onClick={()=>go('Preparations')}>Abrir preparación</button>
    </div>
    {injuryAlerts.length > 0 && <section className="injury-alert-panel" role="alert">
      <div className="injury-alert-heading"><span aria-hidden="true">!</span><div><b>Alertas de molestias</b><small>{injuryAlerts.length} zona{injuryAlerts.length === 1 ? '' : 's'} requiere{injuryAlerts.length === 1 ? '' : 'n'} atención</small></div></div>
      <div className="injury-alert-list">{injuryAlerts.map((alert) => <article className="injury-alert-item" key={alert.region}>
        <div><b>{alert.regionLabel || alert.region.replaceAll('-', ' ')}</b><span>{alert.athleteName} · semana {alert.week} · {alert.day}</span></div>
        <strong>{alert.level}/10</strong>
        <small>{alert.reasons.join(' · ')}{alert.description ? ` · ${alert.description}` : ''}</small>
      </article>)}</div>
      <button className="text-button" onClick={()=>go('Preparations')}>Revisar preparación →</button>
    </section>}
    <div className="coach-stats">
    <div className="stat-card">
    <small>Atletas activos</small>
    <b>{coachAthletes.length}</b>
    <span>Con preparación activa</span>
    </div>
    <div className="stat-card">
    <small>Preparaciones</small>
    <b>{coachAthletes.length}</b>
    <span>En curso</span>
    </div>
    <div className="stat-card">
    <small>Solicitudes nuevas</small>
    <b>1</b>
    <span>Requiere revisión</span>
    </div>
    </div>
    <section className="active-prep-card">
    <div className="active-prep-icon">↗</div>
    <div className="active-prep-info">
    <div className="eyebrow">PREPARACIÓN ACTIVA · {weeks.length} DE 12 SEMANAS</div>
    <h2>Media Maratón Madrid</h2>
    <p>Lucía Fernández · Objetivo: media maratón · 6 dic 2026</p>
    </div>
    <button className="button secondary" onClick={()=>go('Preparations')}>Ver semanas →</button>
    </section>
    <div className="coach-columns">
    <section className="panel">
    <div className="panel-title">
    <div>
    <h2>Atletas</h2>
    <p>Personas vinculadas a tus preparaciones</p>
    </div>
    <span className="count-badge">{coachAthletes.length}</span>
    </div>
    <div className="coach-athlete-list">{coachAthletes.map((athlete)=><button className="request-row" key={athlete.id} onClick={()=>go('Preparations')}>
      <div className="mini-avatar">{athlete.initials}</div>
      <div className="request-person"><b>{athlete.name}</b><small>Preparación activa · {athlete.goal} · {athlete.eventDate}</small></div>
      <span className="row-chevron">›</span>
    </button>)}</div>
    </section>
    <section className="panel inbox-panel">
    <div className="panel-title">
    <div>
    <h2>Solicitudes de preparación</h2>
    </div>
    <span className="count-badge">1</span>
    </div>
    <button className="request-row" onClick={openRequest}>
    <div className="mini-avatar pink-avatar">LF</div>
    <div className="request-person">
    <b>Lucía Fernández</b>
    <small>Media maratón · 6 dic 2026</small>
    </div>
    <span className="request-new">Nueva</span>
    <span className="row-chevron">›</span>
    </button>
    <div className="request-footer">
    <span>Madrid · Recibida hoy</span>
    <button className="text-button" onClick={openRequest}>Revisar solicitud →</button>
    </div>
    <small className="demo-caption">Estado de ejemplo: {requestStatus}</small>
    </section>
    </div>
    </div>}
