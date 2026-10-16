import './WeekTimeline.css';

export function getWeekStatus(weekNumber, currentWeek = 8) {
  if (weekNumber < currentWeek) return 'past';
  if (weekNumber === currentWeek) return 'current';
  return 'future';
}

export function getWeekStatusLabel(status) {
  switch (status) {
    case 'past':
      return 'Realizada';
    case 'current':
      return 'Actual';
    case 'future':
      return 'Planificada';
    default:
      return '';
  }
}

export function getWeekDateRange(weekNumber, currentWeek = 8) {
  const monday = new Date(Date.UTC(2026, 9, 21 + (weekNumber - currentWeek) * 7));
  const sunday = new Date(Date.UTC(2026, 9, 27 + (weekNumber - currentWeek) * 7));

  const startDay = monday.getUTCDate();
  const endDay = sunday.getUTCDate();
  const startMonth = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' }).format(monday).replace('.', '');
  const endMonth = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' }).format(sunday).replace('.', '');

  if (startMonth === endMonth) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

export default function WeekTimeline({
  weeks = [],
  selectedWeek,
  onSelectWeek,
  currentWeek = 8,
  showReturnButton = true,
  title = 'Histórico de la preparación',
  subtitle = 'Navegar por semanas',
}) {
  const isViewingDifferentWeek = selectedWeek !== currentWeek;
  const selectedStatus = getWeekStatus(selectedWeek, currentWeek);

  return (
    <div className="week-timeline-container" aria-label="Histórico de semanas de la preparación">
      <div className="week-timeline-header">
        <div className="week-timeline-title">
          <span className="eyebrow">{title.toUpperCase()}</span>
          <strong>{subtitle}</strong>
        </div>
        {showReturnButton && isViewingDifferentWeek && (
          <button
            type="button"
            className="return-current-week-btn"
            onClick={() => onSelectWeek(currentWeek)}
            aria-label={`Volver a la semana actual, Semana ${currentWeek}`}
          >
            Volver a semana actual ({currentWeek}) →
          </button>
        )}
      </div>

      <div className="week-timeline-strip" role="tablist" aria-label="Lista de semanas">
        {weeks.map((item) => {
          const weekNum = item.number;
          const status = getWeekStatus(weekNum, currentWeek);
          const isSelected = weekNum === selectedWeek;
          const dateRange = getWeekDateRange(weekNum, currentWeek);

          return (
            <button
              key={weekNum}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`week-timeline-card ${status} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectWeek(weekNum)}
            >
              <div className="week-timeline-card-top">
                <span className="week-timeline-num">Semana {weekNum}</span>
                <span className={`week-timeline-badge ${status}`}>
                  {status === 'past' && '✓ Realizada'}
                  {status === 'current' && '● Actual'}
                  {status === 'future' && 'Planificada'}
                </span>
              </div>
              <span className="week-timeline-dates">{dateRange}</span>
              <span className="week-timeline-phase">{item.phase || 'Fase activa'}</span>
            </button>
          );
        })}
      </div>

      {isViewingDifferentWeek && (
        <div className={`week-history-alert ${selectedStatus}`} role="status">
          <span>
            {selectedStatus === 'past'
              ? `Estás consultando el histórico de la Semana ${selectedWeek} (Realizada).`
              : `Estás consultando la planificación de la Semana ${selectedWeek} (Planificada).`}
          </span>
          <button type="button" onClick={() => onSelectWeek(currentWeek)}>
            Volver a la semana actual (Semana {currentWeek}) →
          </button>
        </div>
      )}
    </div>
  );
}
