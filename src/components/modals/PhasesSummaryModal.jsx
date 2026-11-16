import { getWeekStatus } from '../ui/WeekTimeline.jsx';

/** Resumen de la preparación agrupado por fases y semanas. */
export default function PhasesSummaryModal({ preparation, coachWeeks, week, onSelectWeek, onClose }) {
  const phases = Object.values(coachWeeks.reduce((groups, planWeek) => {
    const phase = planWeek.phase || 'Sin fase';
    groups[phase] ||= { name: phase, weeks: [] };
    groups[phase].weeks.push(planWeek);
    return groups;
  }, {}));

  return <>
    <div className="eyebrow">PREPARACIÓN ACTIVA · {preparation?.duration || '12 semanas'}</div>
    <h2>Semanas y fases</h2>
    <p className="muted">Objetivos: {(preparation?.objectives || []).map((objective) => `${objective.name} (${objective.distance})`).join(' · ') || 'Media Maratón Madrid'}.</p>
    <div className="phase-workout-list">{phases.map((phase) => <details className="phase-workout-group" key={phase.name} open={phase.weeks.some((planWeek) => planWeek.number === week)}>
      <summary>{phase.name}<small>{phase.weeks.length} {phase.weeks.length === 1 ? 'semana' : 'semanas'}</small></summary>
      {phase.weeks.map((planWeek) => {
        const status = getWeekStatus(planWeek.number, 8);
        return <details className={`phase-week ${planWeek.number === week ? 'current' : ''}`} key={planWeek.number} open={planWeek.number === week}>
          <summary style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Semana {planWeek.number}</span>
            <span className={`week-timeline-badge ${status}`}>
              {status === 'past' && '✓ Realizada'}
              {status === 'current' && '● Actual'}
              {status === 'future' && 'Planificada'}
            </span>
            {planWeek.number === week && <small>Semana seleccionada</small>}
            <button
              type="button"
              className="text-button"
              style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)' }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectWeek(planWeek.number);
              }}
            >
              Ir a semana →
            </button>
          </summary>
          <div className="phase-week-workouts">{planWeek.days.filter((day) => day.type).map((day) => <div className="phase-workout-item" key={day.day}>
            <div><b>{day.day} · {day.type}</b><small>{day.date} {day.month || 'oct'}</small></div>
            <p>{day.desc || day.blocks || 'Sin descripción'}</p>
            <span>{day.mins || 0} min · {day.km || 0} km{day.shoes ? ` · 👟 ${day.shoes}` : ''}</span>
          </div>)}{!planWeek.days.some((day) => day.type) && <p className="phase-no-workouts">Todavía no hay entrenamientos planificados para esta semana.</p>}</div>
        </details>;
      })}
    </details>)}</div>
    <button className="button primary" onClick={onClose}>Cerrar resumen</button>
  </>;
}
