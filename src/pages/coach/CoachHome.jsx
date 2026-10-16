import { useState } from 'react';
import { coachAthletes } from '../../data/coachAthletes.js';
import { createInjuryAlerts } from '../../data/injuryAlerts.js';

export default function CoachHome({go,openRequest,requestStatus,weeks,trainingLogs={}}){
  const injuryAlerts = createInjuryAlerts(weeks, trainingLogs, 'Alex Martín');
  const [selectedWeek, setSelectedWeek] = useState(8);
  const currentWeek = weeks.find((w) => w.number === selectedWeek) || weeks.find((w) => w.number === 8) || weeks[0];

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

    <GroupAttendancePanel
      currentWeek={currentWeek}
      trainingLogs={trainingLogs}
      selectedWeek={selectedWeek}
      setSelectedWeek={setSelectedWeek}
      totalWeeks={weeks.length}
    />
  </div>;
}

function GroupAttendancePanel({ currentWeek, trainingLogs, selectedWeek, setSelectedWeek, totalWeeks = 12 }) {
  const members = [
    { id: 'yo', name: 'Tú (Simulación)' },
    { id: 'm1', name: 'Carlos Díaz' },
    { id: 'm2', name: 'Ana Gómez' },
    { id: 'm3', name: 'Luis Herrero' },
    { id: 'm4', name: 'Marta Ruiz' },
  ];

  const daysWithWorkouts = currentWeek?.days ? currentWeek.days.filter((day) => day.type) : [];

  const getStatus = (memberId, day) => {
    if (memberId === 'yo') {
      const status = trainingLogs[`${currentWeek.number}-${day.day}`]?.completionStatus;
      return status === 'completed' ? 'green' : status === 'partial' ? 'yellow' : status === 'missed' ? 'red' : 'gray';
    }
    const hash = memberId.charCodeAt(1) + day.day.charCodeAt(0) + currentWeek.number + day.day.length;
    return hash % 4 === 0 ? 'yellow' : hash % 3 !== 0 ? 'green' : 'red';
  };

  return (
    <section className="panel" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="eyebrow">CONTROL GRUPAL</div>
          <h2 style={{ margin: '4px 0 0' }}>Asistencia de la Semana {currentWeek?.number || 8}</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--muted-color)' }}>Verde: completado · Amarillo: a medias · Rojo: no realizado.</p>
        </div>
        {setSelectedWeek && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="button secondary"
              style={{ padding: '6px 12px', minWidth: '36px' }}
              onClick={() => setSelectedWeek((prev) => Math.max(1, prev - 1))}
              disabled={selectedWeek <= 1}
              aria-label="Semana anterior"
            >
              ‹
            </button>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Semana {selectedWeek}</span>
            <button
              type="button"
              className="button secondary"
              style={{ padding: '6px 12px', minWidth: '36px' }}
              onClick={() => setSelectedWeek((prev) => Math.min(totalWeeks, prev + 1))}
              disabled={selectedWeek >= totalWeeks}
              aria-label="Semana siguiente"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--border-color)', width: '200px' }}>Entrenamiento</th>
              {members.map(m => <th key={m.id} style={{ padding: '12px 8px', borderBottom: '1px solid var(--border-color)', fontSize: '13px', fontWeight: '600' }}>{m.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {daysWithWorkouts.length === 0 && <tr><td colSpan={members.length + 1} style={{ padding: '16px', textAlign: 'center', color: 'var(--muted-color)' }}>No hay entrenamientos planificados esta semana.</td></tr>}
            {daysWithWorkouts.map(day => (
              <tr key={day.day}>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}><b>{day.day}</b><br/><small style={{ color: 'var(--muted-color)' }}>{day.type}</small></td>
                {members.map(m => {
                  const status = getStatus(m.id, day);
                  return (
                    <td key={m.id} style={{ padding: '12px 8px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '4px',
                        background: status === 'green' ? '#22c55e' : status === 'yellow' ? '#eab308' : status === 'red' ? '#ef4444' : '#e5e7eb',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }} title={status === 'green' ? 'Completado' : status === 'yellow' ? 'A medias' : status === 'red' ? 'No completado' : 'Pendiente'} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
