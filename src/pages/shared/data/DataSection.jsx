import { Fragment, useMemo, useState } from 'react';
import { getWeekDateRange } from '../../../components/ui/WeekTimeline.jsx';
import { workoutColor } from '../../../data/coachAthletes.js';
import { capitalize, formatDate, formatNumber, groupBy, monthFormatter, sessionFromRecord, toDateKey } from './dataStats.js';
import { PanelHeading, SummaryTable } from './DataPanels.jsx';
import InfoTip from '../../../components/ui/InfoTip.jsx';
import { format } from '../../../utils/format.js';

export function DataSection({ records, recentSevenDays, onSession, setTrainingLogs }) {
  const [viewMode, setViewMode] = useState('table');
  const monthGroups = [...groupBy(records, (record) => record.date.slice(0, 7)).entries()]
    .sort(([monthA], [monthB]) => monthB.localeCompare(monthA));

  return (
    <div className="data-section">
      <section className="panel data-table-panel">
        <div className="panel-header-with-actions">
          <PanelHeading title="Detalle de entrenamientos" description={`${records.length} sesiones dentro del periodo y fase seleccionados`} />
          <div className="view-mode-toggle" role="tablist" aria-label="Modo de visualización de entrenamientos">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'table'}
              className={`view-mode-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span aria-hidden="true">▤</span> Tabla detallada
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'calendar'}
              className={`view-mode-button ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <span aria-hidden="true">▦</span> Calendario
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <DetailedTrainingTable
            records={records}
            onSession={onSession}
            setTrainingLogs={setTrainingLogs}
          />
        ) : (
          <div className="training-calendar">
            {!monthGroups.length && <p className="empty-chart">No hay sesiones para mostrar.</p>}
            {monthGroups.map(([month, monthRecords]) => (
              <TrainingCalendarMonth
                key={month}
                month={month}
                records={monthRecords}
                allRecords={records}
                onSession={onSession}
                setTrainingLogs={setTrainingLogs}
              />
            ))}
          </div>
        )}
      </section>

      <section className="panel data-table-panel recent-seven-panel">
        <PanelHeading title="Últimos 7 días" description="Kilómetros, minutos y TRIMPS consolidados de los siete días más recientes del periodo" />
        <SummaryTable rows={recentSevenDays} firstColumn="Día" />
      </section>
    </div>
  );
}

function StatusSemaphor({ status, label, onClick }) {
  return (
    <button
      type="button"
      className={`status-semaphor-pill status-${status}`}
      onClick={onClick}
      title={onClick ? `${label} (clic para alternar estado)` : label}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      aria-label={`Estado: ${label}`}
    >
      <span className={`calendar-status-dot status-${status}`} aria-hidden="true" />
      <span className="status-semaphor-text">{label}</span>
    </button>
  );
}

function RpeBadge({ rpe }) {
  if (!rpe) return <span className="muted">—</span>;
  const tone = rpe <= 4 ? 'low' : rpe <= 7 ? 'mid' : 'high';
  return (
    <span className={`rpe-badge rpe-${tone}`} title={`RPE ${rpe}/10 (escala de esfuerzo percibido)`}>
      <b>{rpe}</b><small>/10</small>
    </span>
  );
}

function DetailedTrainingTable({ records, onSession, setTrainingLogs }) {
  const weekGroups = useMemo(() => {
    const groups = groupBy(records, (r) => r.preparationWeek);
    return [...groups.entries()].sort(([weekA], [weekB]) => Number(weekB) - Number(weekA));
  }, [records]);

  if (!records.length) {
    return <p className="empty-chart">No hay sesiones dentro del periodo y fase seleccionados.</p>;
  }

  return (
    <div className="table-scroll detailed-training-table-wrap">
      <table className="analytics-table detailed-analytics-table">
        <thead>
          <tr>
            <th style={{ width: '100px' }}>Fecha</th>
            <th style={{ width: '125px' }}>Estado</th>
            <th style={{ width: '135px' }}>Tipo sesión</th>
            <th style={{ width: '80px' }} className="num-col">Kms</th>
            <th style={{ width: '80px' }} className="num-col">Minutos</th>
            <th style={{ width: '80px' }} className="num-col">TRIMPS <InfoTip term="trimp" /></th>
            <th style={{ width: '75px' }} className="num-col">RPE <InfoTip term="rpe" /></th>
            <th style={{ width: '85px' }} className="num-col">FC media</th>
            <th>Sensaciones / Notas</th>
          </tr>
        </thead>
        <tbody>
          {weekGroups.map(([weekNum, weekRecords]) => {
            const weekKm = weekRecords.reduce((sum, r) => sum + (Number(r.distance) || 0), 0);
            const weekMin = weekRecords.reduce((sum, r) => sum + (Number(r.minutes) || 0), 0);
            const weekTrimp = weekRecords.reduce((sum, r) => sum + (Number(r.trimps) || 0), 0);
            const validRpe = weekRecords.map((r) => Number(r.rpe)).filter((v) => Number.isFinite(v) && v > 0);
            const avgRpe = validRpe.length ? (validRpe.reduce((a, b) => a + b, 0) / validRpe.length) : null;
            const validHr = weekRecords.map((r) => Number(r.averageHr)).filter((v) => Number.isFinite(v) && v > 0);
            const avgHr = validHr.length ? Math.round(validHr.reduce((a, b) => a + b, 0) / validHr.length) : null;
            const completedCount = weekRecords.filter((r) => (r.completionStatus || r.status) === 'completed' || r.status === 'Completado').length;
            const phaseName = weekRecords[0]?.phase || '';
            const weekRange = getWeekDateRange(Number(weekNum));

            return (
              <Fragment key={`week-group-${weekNum}`}>
                <tr className="table-week-header-row">
                  <td colSpan="9">
                    <div className="table-week-header-badge">
                      <strong>Semana {weekNum}</strong>
                      <span className="phase-chip">{phaseName}</span>
                      <span className="week-range-text">· {weekRange}</span>
                      <span className="week-completion-pill">
                        {completedCount} de {weekRecords.length} completados
                      </span>
                    </div>
                  </td>
                </tr>

                {weekRecords.map((record) => {
                  const compStatus = record.completionStatus || (record.status === 'Completado' ? 'completed' : 'unreported');
                  const statusLabel = compStatus === 'completed'
                    ? 'Completado'
                    : compStatus === 'partial'
                      ? 'A medias'
                      : compStatus === 'missed'
                        ? 'No realizado'
                        : (record.status || 'Planificado');
                  const colorKey = workoutColor(record.type);

                  const toggleStatus = (e) => {
                    if (setTrainingLogs) {
                      e.stopPropagation();
                      const next = compStatus === 'completed' ? 'partial' : compStatus === 'partial' ? 'missed' : 'completed';
                      setTrainingLogs((prev) => ({
                        ...prev,
                        [record.id]: {
                          ...prev[record.id],
                          completionStatus: next,
                        },
                      }));
                    }
                  };

                  return (
                    <tr
                      key={record.id}
                      className="training-record-row"
                      onClick={() => onSession?.(sessionFromRecord(record))}
                      tabIndex={0}
                      role="button"
                      aria-label={`Ver entrenamiento ${record.type} del ${formatDate(record.date)}`}
                    >
                      <td className="date-col">
                        <b>{record.day.slice(0, 3)}</b>
                        <small>{formatDate(record.date)}</small>
                      </td>
                      <td>
                        <StatusSemaphor
                          status={compStatus}
                          label={statusLabel}
                          onClick={setTrainingLogs ? toggleStatus : undefined}
                        />
                      </td>
                      <td>
                        <span className={`session-type-chip workout-color-${colorKey}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="num-col">
                        <b>{formatNumber(record.distance, 1)}</b>
                        <small className="unit"> km</small>
                      </td>
                      <td className="num-col">
                        <b>{record.minutes}</b>
                        <small className="unit"> min</small>
                      </td>
                      <td className="num-col">
                        <span className={`trimp-cell-badge ${record.trimps > 100 ? 'high' : ''}`}>
                          {record.trimps}
                        </span>
                      </td>
                      <td className="num-col">
                        <RpeBadge rpe={record.rpe} />
                      </td>
                      <td className="num-col">
                        {record.averageHr ? (
                          <span><b>{record.averageHr}</b><small className="unit"> ppm</small></span>
                        ) : '—'}
                      </td>
                      <td className="notes-col">
                        <span className="notes-text" title={record.notes}>
                          {record.notes || record.description || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                <tr className="table-week-summary-row">
                  <td colSpan="3">
                    <span className="weekly-summary-title">∑ Total Semana {weekNum}</span>
                    <small className="weekly-summary-subtitle">Acumulado semanal</small>
                  </td>
                  <td className="num-col">
                    <strong className="summary-val">{formatNumber(weekKm, 1)} km</strong>
                  </td>
                  <td className="num-col">
                    <strong className="summary-val">{weekMin} min</strong>
                  </td>
                  <td className="num-col">
                    <strong className="summary-val">{weekTrimp} TR</strong>
                  </td>
                  <td className="num-col">
                    {avgRpe ? <small>Media: {format(avgRpe, 1)}</small> : '—'}
                  </td>
                  <td className="num-col">
                    {avgHr ? <small>Media: {avgHr} ppm</small> : '—'}
                  </td>
                  <td>
                    <small className="muted">{completedCount}/{weekRecords.length} sesiones completadas</small>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TrainingCalendarMonth({ month, records, allRecords, onSession, setTrainingLogs }) {
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const recordsByDay = groupBy(records, (record) => Number(record.date.slice(8, 10)));
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <section className="training-calendar-month" aria-label={capitalize(monthFormatter.format(new Date(`${month}-01T00:00:00Z`)))}>
      <div className="training-calendar-month-header">
        <h3>{capitalize(monthFormatter.format(new Date(`${month}-01T00:00:00Z`)))}</h3>
        <div className="training-calendar-status-legend" aria-label="Leyenda de estados de entrenamiento">
          <span><span className="calendar-status-dot status-completed" aria-hidden="true" />Completado</span>
          <span><span className="calendar-status-dot status-partial" aria-hidden="true" />A medias</span>
          <span><span className="calendar-status-dot status-missed" aria-hidden="true" />No realizado</span>
        </div>
      </div>
      <div className="training-calendar-grid">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <b className="training-calendar-weekday" key={day}>{day}</b>)}
        <b className="training-calendar-weekday training-calendar-summary-heading">Semana</b>
        {Array.from({ length: cells.length / 7 }, (_, weekIndex) => {
          const weekCells = cells.slice(weekIndex * 7, weekIndex * 7 + 7);
          const weekStart = new Date(Date.UTC(year, monthNumber - 1, 1 - firstWeekday + weekIndex * 7));
          const weekEnd = new Date(Date.UTC(year, monthNumber - 1, 7 - firstWeekday + weekIndex * 7));
          const weekStartKey = toDateKey(weekStart);
          const weekEndKey = toDateKey(weekEnd);
          const weekRecords = allRecords.filter((record) => record.date >= weekStartKey && record.date <= weekEndKey);
          const kilometers = weekRecords.reduce((sum, record) => sum + record.distance, 0);
          const minutes = weekRecords.reduce((sum, record) => sum + record.minutes, 0);
          return <Fragment key={`${month}-${weekIndex}`}>
            {weekCells.map((day, dayIndex) => {
              const dayRecords = day ? recordsByDay.get(day) || [] : [];
              return <div className={`training-calendar-day${day ? '' : ' outside'}`} key={`${month}-${weekIndex}-${dayIndex}`}>
                {day && <><span className="training-calendar-date">{day}</span><div className="training-calendar-sessions">
                  {dayRecords.map((record) => {
                    const colorKey = workoutColor(record.type);
                    const compStatus = record.completionStatus || (record.status === 'Completado' ? 'completed' : 'unreported');
                    const statusLabel = compStatus === 'completed'
                      ? 'Completado'
                      : compStatus === 'partial'
                        ? 'A medias'
                        : compStatus === 'missed'
                          ? 'No realizado'
                          : (record.status || 'Planificado');

                    return (
                      <button
                        className={`training-calendar-session workout-color-${colorKey}`}
                        key={record.id}
                        onClick={() => onSession?.(sessionFromRecord(record))}
                        aria-label={`Ver ${record.type}, ${formatDate(record.date)} · ${statusLabel}`}
                      >
                        <div className="training-calendar-session-header">
                          <b>{record.type}</b>
                          <span
                            className={`calendar-status-dot status-${compStatus}`}
                            title={`${statusLabel}${setTrainingLogs ? ' · Clic para alternar estado' : ''}`}
                            role="img"
                            aria-label={statusLabel}
                            onClick={(event) => {
                              if (setTrainingLogs) {
                                event.stopPropagation();
                                const next = compStatus === 'completed' ? 'partial' : compStatus === 'partial' ? 'missed' : 'completed';
                                setTrainingLogs((prev) => ({
                                  ...prev,
                                  [record.id]: {
                                    ...prev[record.id],
                                    completionStatus: next,
                                  }
                                }));
                              }
                            }}
                          />
                        </div>
                        <span className="training-calendar-session-meta">
                          {formatNumber(record.distance, 1)} km · {record.minutes} min
                        </span>
                      </button>
                    );
                  })}
                </div></>}
              </div>;
            })}
            <div className="training-calendar-week-summary" key={`${month}-${weekIndex}-summary`} aria-label={`Totales semanales: ${formatNumber(kilometers, 1)} kilómetros y ${minutes} minutos`}>
              <span>Totales</span><b>{formatNumber(kilometers, 1)} km</b><b>{minutes} min</b>
            </div>
          </Fragment>;
        })}
      </div>
    </section>
  );
}
