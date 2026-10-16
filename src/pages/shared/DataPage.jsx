import { Fragment, useMemo, useState } from 'react';
import { createTrainingHistory, preparationPhases } from '../../data/trainingHistory.js';
import { getWeekDateRange } from '../../components/ui/WeekTimeline.jsx';
import { workoutColor } from '../../data/coachAthletes.js';
import './DataPage.css';

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortDateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export default function DataPage({ trainingLogs = {}, setTrainingLogs, onSession, role, coachWeeks = [] }) {
  const [section, setSection] = useState('data');
  const [period, setPeriod] = useState('last30');
  const [phase, setPhase] = useState('all');
  
  const history = useMemo(() => {
    if (role === 'grupo' && coachWeeks.length > 0) {
      return coachWeeks.flatMap((week) => week.days.map((day, index) => {
        const dateObj = new Date(Date.UTC(2026, 7, 24 + (week.number - 1) * 7 + index));
        const dateStr = dateObj.toISOString().slice(0, 10);
        const todayKey = new Date().toLocaleDateString('en-CA');
        const isPast = dateStr <= todayKey;
        let completionStatus = demoLog?.completionStatus;
        if (!completionStatus && isPast) {
          if ((week.number === 7 && index === 0) || (week.number === 8 && index === 1)) {
            completionStatus = 'partial';
          } else if (week.number === 7 && index === 2) {
            completionStatus = 'missed';
          } else {
            completionStatus = 'completed';
          }
        }
        const status = completionStatus === 'completed'
          ? 'Completado'
          : completionStatus === 'partial'
            ? 'A medias'
            : completionStatus === 'missed'
              ? 'No realizado'
              : 'Planificado';
        return {
          id: `${week.number}-${day.day}`,
          preparationWeek: week.number,
          phase: week.phase,
          day: day.day,
          date: dateStr,
          type: day.type || 'Descanso',
          description: day.desc || '',
          distance: Number(day.km) || 0,
          minutes: Number(day.mins) || 0,
          trimps: Number(day.tr) || 0,
          pace: '5:00',
          averageHr: 140, restingHr: 50, hrv: 50, wellbeingTotal: 0,
          rpe: 6,
          notes: day.desc || 'Entrenamiento de grupo',
          zones: [0, 0, 0, 0],
          status,
          completionStatus: completionStatus || 'unreported',
          isRest: !day.type
        };
      }));
    }
    return createTrainingHistory(trainingLogs);
  }, [trainingLogs, role, coachWeeks]);

  const availableMonths = [...new Set(history.map((record) => record.date.slice(0, 7)))].sort();
  const rangeFilteredRecords = history.filter((record) => matchesPeriod(record.date, period, availableMonths));
  const filteredRecords = rangeFilteredRecords.filter((record) => phase === 'all' || record.phase === phase);
  const weekGroups = groupBy(filteredRecords, (record) => record.preparationWeek);
  const weeklyRows = [...weekGroups.entries()].map(([week, records]) => summarize(records, `Semana ${week}`, week));
  const dailyRows = [...groupBy(filteredRecords, (record) => record.date).entries()]
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, records]) => summarize(records, date, date));

  const denseTrend = useMemo(() => {
    let startDate, endDate;
    if (period === 'last30') {
      endDate = new Date();
      endDate.setUTCHours(0, 0, 0, 0);
      startDate = new Date(endDate);
      startDate.setUTCDate(startDate.getUTCDate() - 29);
    } else if (period === 'all') {
      if (!dailyRows.length) return [];
      startDate = new Date(`${dailyRows.at(-1).date}T00:00:00Z`);
      endDate = new Date(`${dailyRows[0].date}T00:00:00Z`);
    } else {
      const [year, month] = period.split('-').map(Number);
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 0));
    }
    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().slice(0, 10);
      const row = dailyRows.find(r => r.key === dateStr);
      days.push(row || { key: dateStr, date: dateStr, empty: true });
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
  }, [period, dailyRows]);

  const recentSevenDays = dailyRows.slice(0, 7).reverse();
  const chartWeeks = weeklyRows;
  const typeBreakdown = summarizeTypes(filteredRecords);
  const zoneTotals = summarizeZones(filteredRecords);
  const wellnessTrend = dailyRows.slice(0, 30).reverse();
  const rollingLoad = useMemo(() => createRollingLoad(history.filter((record) => phase === 'all' || record.phase === phase), denseTrend), [history, phase, denseTrend]);

  return (
    <div className="content data-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ANÁLISIS DE LA PREPARACIÓN</div>
          <h1>Datos de entrenamiento</h1>
          <p>Consulta los entrenamientos, la carga y la evolución de tus métricas.</p>
        </div>
        <span className="example-tag">DATOS DE EJEMPLO</span>
      </div>

      <div className="data-toolbar">
        <div className="data-tabs" role="tablist" aria-label="Sección de datos">
          <button role="tab" aria-selected={section === 'data'} className={section === 'data' ? 'active' : ''} onClick={() => setSection('data')}>Datos</button>
          <button role="tab" aria-selected={section === 'charts'} className={section === 'charts' ? 'active' : ''} onClick={() => setSection('charts')}>Gráficas</button>
        </div>
        <div className="data-filters">
          <label>
            <span>Periodo</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="last30">Últimos 30 días</option>
              <option value="all">Todo el periodo</option>
              {availableMonths.map((month) => <option key={month} value={month}>{capitalize(monthFormatter.format(new Date(`${month}-01T00:00:00Z`)))}</option>)}
            </select>
          </label>
          <label>
            <span>Fase</span>
            <select value={phase} onChange={(event) => setPhase(event.target.value)}>
              <option value="all">Todas las fases</option>
              {preparationPhases.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      {section === 'data' ? (
        <DataSection
          records={filteredRecords}
          recentSevenDays={recentSevenDays}
          onSession={onSession}
          setTrainingLogs={setTrainingLogs}
        />
      ) : (
        <ChartsSection
          role={role}
          weeklyRows={chartWeeks}
          typeBreakdown={typeBreakdown}
          zoneTotals={zoneTotals}
          denseTrend={denseTrend}
          rollingLoad={rollingLoad}
          onSession={onSession}
        />
      )}
    </div>
  );
}

function DataSection({ records, recentSevenDays, onSession, setTrainingLogs }) {
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
            <th style={{ width: '80px' }} className="num-col">TRIMPS</th>
            <th style={{ width: '75px' }} className="num-col">RPE</th>
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
            const avgRpe = validRpe.length ? (validRpe.reduce((a, b) => a + b, 0) / validRpe.length).toFixed(1) : null;
            const validHr = weekRecords.map((r) => Number(r.averageHr)).filter((v) => Number.isFinite(v) && v > 0);
            const avgHr = validHr.length ? Math.round(validHr.reduce((a, b) => a + b, 0) / validHr.length) : null;
            const completedCount = weekRecords.filter((r) => (r.completionStatus || r.status) === 'completed' || r.status === 'Completado').length;
            const phaseName = weekRecords[0]?.phase || '';
            const weekRange = getWeekDateRange(Number(weekNum), 8);

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
                      ? 'Incompleto'
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
                    {avgRpe ? <small>Media: {avgRpe}</small> : '—'}
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

function sessionFromRecord(record) {
  const date = new Date(`${record.date}T00:00:00Z`);
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', timeZone: 'UTC',
  }).format(date);
  const compStatus = record.completionStatus || (record.status === 'Completado' ? 'completed' : 'unreported');
  const stateLabel = compStatus === 'completed'
    ? 'Completado'
    : compStatus === 'partial'
      ? 'A medias'
      : compStatus === 'missed'
        ? 'No realizado'
        : (record.status || 'Planificado');
  const tone = compStatus === 'completed' ? 'green' : compStatus === 'partial' ? 'yellow' : compStatus === 'missed' ? 'pink' : (/series|umbral|competición/i.test(record.type) ? 'blue' : 'navy');
  return {
    ...record,
    date: date.getUTCDate(),
    dateLabel,
    time: '—',
    mins: record.minutes,
    km: record.distance,
    tr: String(record.trimps),
    blocks: record.description,
    state: stateLabel,
    tone,
  };
}

function ChartsSection({ role, weeklyRows, typeBreakdown, zoneTotals, denseTrend, rollingLoad, onSession }) {
  return (
    <div className="data-section charts-section">
      <div className="chart-grid">
        <InternalLoadChart data={denseTrend} onSession={onSession} />
      </div>
      <div className="chart-grid two-charts">
        <TypeBreakdown data={typeBreakdown} />
        <ZoneBreakdown totals={zoneTotals} />
      </div>
      <div className="chart-grid">
        <ExternalLoadChart data={rollingLoad} />
      </div>
    </div>
  );
}

function PanelHeading({ title, description }) {
  return <div className="panel-title data-panel-title"><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function SummaryTable({ rows, firstColumn }) {
  const totalKm = rows.reduce((s, r) => s + (r.kilometers || 0), 0);
  const totalMin = rows.reduce((s, r) => s + (r.minutes || 0), 0);
  const totalTrimp = rows.reduce((s, r) => s + (r.trimps || 0), 0);

  return (
    <div className="table-scroll">
      <table className="analytics-table summary-analytics-table">
        <thead><tr><th>{firstColumn}</th><th>Kilómetros</th><th>Minutos</th><th>TRIMPS</th><th>WT medio</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{formatNumber(row.kilometers, 1)} km</td>
              <td>{row.minutes} min</td>
              <td>{row.trimps}</td>
              <td>{row.wellbeingTotal === null ? '—' : `${formatNumber(row.wellbeingTotal, 1)} / 50`}</td>
            </tr>
          ))}
          {!rows.length && <EmptyRow columns={5} />}
          {rows.length > 0 && (
            <tr className="summary-consolidated-row">
              <td><b>Consolidado (Últimos 7 días)</b></td>
              <td><b>{formatNumber(totalKm, 1)} km</b></td>
              <td><b>{totalMin} min</b></td>
              <td><b>{totalTrimp}</b></td>
              <td><small className="muted">Total acumulado</small></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyRow({ columns }) {
  return <tr><td className="empty-table-cell" colSpan={columns}>No hay sesiones en este periodo y fase.</td></tr>;
}

function LineChart({ title, unit, values, labels, color, extraSeries = [], seriesName = title }) {
  const series = [{ name: seriesName, values, color }, ...extraSeries];
  const chart = buildChartPaths(series, labels.length, { relative: series.length > 1 });
  const latestLegend = series.map((item) => ({ ...item, latest: item.values.at(-1) }));

  return (
    <section className="panel chart-card">
      <PanelHeading title={title} description={unit} />
      <div className="chart-scroll">
        <svg className="line-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={`${title}: gráfica de líneas`}>
          {chart.yTicks.map((tick, index) => (
            <g key={index}>
              <line x1={chart.plot.left} x2={chart.plot.right} y1={tick.y} y2={tick.y} className="chart-gridline" />
              <text x={chart.plot.left - 8} y={tick.y + 3} textAnchor="end" className="chart-y-label">{tick.label}</text>
            </g>
          ))}
          {series.map((item, seriesIndex) => (
            <g key={item.name}>
              <path d={chart.paths[seriesIndex]} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {chart.points[seriesIndex].map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={labels.length < 15 ? 3 : 2} fill={item.color} stroke="#fff" strokeWidth="1.5" />)}
            </g>
          ))}
          {labels.map((label, index) => labels.length < 8 || index % Math.ceil(labels.length / 6) === 0 || index === labels.length - 1
            ? <text key={`${label}-${index}`} x={chart.xPoints[index]} y={chart.height - 7} textAnchor="middle" className="chart-axis-label">{label}</text>
            : null)}
        </svg>
      </div>
      <div className="chart-legend">
        {latestLegend.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}{extraSeries.length > 0 && item.latest !== undefined ? ` · ${formatNumber(item.latest, 1)}` : ''}</span>)}
      </div>
    </section>
  );
}

function TypeBreakdown({ data }) {
  const colors = ['#6892ad', '#9d7aa9', '#78a487', '#d0a054', '#6c7fa4', '#c77883', '#8e9ca5'];
  return (
    <section className="panel chart-card">
      <PanelHeading title="Tipos de entrenamiento" description="Porcentaje de sesiones en el periodo seleccionado" />
      <div className="type-breakdown">
        {data.map((item, index) => (
          <div className="type-row" key={item.name}>
            <div className="type-row-label"><span><i style={{ background: colors[index % colors.length] }} />{item.name}</span><b>{item.count} {item.count === 1 ? 'entrenamiento' : 'entrenamientos'} · {item.percent}%</b></div>
            <div className="type-track"><span style={{ width: `${item.percent}%`, background: colors[index % colors.length] }} /></div>
          </div>
        ))}
        {!data.length && <p className="empty-chart">No hay sesiones para mostrar.</p>}
      </div>
    </section>
  );
}

function ZoneBreakdown({ totals }) {
  const colors = ['#91b8ce', '#73a681', '#d5a953', '#c66f70'];
  const labels = ['Zona 1 · Suave', 'Zona 2 · Aeróbica', 'Zona 3 · Umbral', 'Zona 4 · Alta intensidad'];
  const grandTotal = totals.reduce((sum, value) => sum + value, 0);
  return (
    <section className="panel chart-card">
      <PanelHeading title="Tiempo en zonas de entrenamiento" description="Distribución estimada a partir del tipo de sesión" />
      <div className="zone-stack" aria-label="Distribución de tiempo por zonas">
        {totals.map((value, index) => <span key={index} style={{ width: `${grandTotal ? value / grandTotal * 100 : 0}%`, background: colors[index] }} title={`${labels[index]}: ${value} min`} />)}
      </div>
      <div className="zone-legend-head"><span /><span>Tiempo</span><span>Tiempo %</span></div>
      <div className="zone-legend">
        {totals.map((value, index) => {
          const percentage = grandTotal ? Math.round((value / grandTotal) * 100) : 0;
          return (
            <div key={labels[index]}>
              <span><i style={{ background: colors[index] }} />{labels[index]}</span>
              <b>{value} min</b>
              <strong>{percentage}%</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function summarize(records, label, key) {
  const days = records.map((record) => record.date);
  const wellnessValues = records.map((record) => record.wellbeingTotal).filter(Number.isFinite);
  const hrvValues = records.map((record) => record.hrv).filter(Number.isFinite);
  const restingHrValues = records.map((record) => record.restingHr).filter(Number.isFinite);
  return {
    key,
    label,
    records,
    date: records[0]?.date,
    week: records[0]?.preparationWeek,
    firstDate: days.sort()[0],
    kilometers: records.reduce((sum, record) => sum + record.distance, 0),
    minutes: records.reduce((sum, record) => sum + record.minutes, 0),
    trimps: records.reduce((sum, record) => sum + record.trimps, 0),
    wellbeingTotal: wellnessValues.length ? wellnessValues.reduce((sum, value) => sum + value, 0) / wellnessValues.length : null,
    hrv: hrvValues.length ? hrvValues.reduce((sum, value) => sum + value, 0) / hrvValues.length : null,
    restingHr: restingHrValues.length ? restingHrValues.reduce((sum, value) => sum + value, 0) / restingHrValues.length : null,
  };
}

function toDateKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function summarizeTypes(records) {
  const groups = groupBy(records, (record) => record.type);
  return [...groups.entries()].map(([name, sessions]) => ({
    name,
    count: sessions.length,
    percent: records.length ? Math.round(sessions.length / records.length * 100) : 0,
  })).sort((a, b) => b.count - a.count);
}

function summarizeZones(records) {
  return records.reduce((totals, record) => totals.map((total, index) => total + (record.zones[index] || 0)), [0, 0, 0, 0]);
}

function createRollingLoad(allPhaseRecords, denseTrend) {
  const byDate = new Map([...groupBy(allPhaseRecords, (record) => record.date)].map(([date, records]) => [
    date, 
    {
      distance: records.reduce((sum, record) => sum + record.distance, 0),
      minutes: records.reduce((sum, record) => sum + record.minutes, 0),
      trimps: records.reduce((sum, record) => sum + record.trimps, 0)
    }
  ]));

  return denseTrend.map((trendDay) => {
    const end = new Date(`${trendDay.date}T00:00:00Z`);
    let distance = 0, minutes = 0, trimps = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(end);
      day.setUTCDate(day.getUTCDate() - offset);
      const stats = byDate.get(day.toISOString().slice(0, 10)) || { distance: 0, minutes: 0, trimps: 0 };
      distance += stats.distance;
      minutes += stats.minutes;
      trimps += stats.trimps;
    }
    return { ...trendDay, rollingDistance: round(distance), rollingMinutes: round(minutes), rollingTrimps: round(trimps) };
  });
}

function buildChartPaths(series, labelCount, { relative = false } = {}) {
  const width = Math.max(360, labelCount * 42 + 65);
  const height = 220;
  const plot = { left: 57, right: width - 15, top: 18, bottom: height - 36 };
  const count = Math.max(labelCount, 1);
  const xPoints = Array.from({ length: count }, (_, index) => count === 1 ? (plot.left + plot.right) / 2 : plot.left + index * (plot.right - plot.left) / (count - 1));
  const allValues = series.flatMap(({ values }) => values.map((value) => Number(value)).filter(Number.isFinite));
  const actualMin = allValues.length ? Math.min(...allValues) : 0;
  const actualMax = allValues.length ? Math.max(...allValues) : 1;
  const spread = actualMax - actualMin;
  const padding = spread === 0 ? Math.max(actualMax * 0.12, 1) : spread * 0.12;
  let domainMin = 0;
  let domainMax = 100;
  let tickStep = 25;

  if (!relative) {
    const lowerBound = Math.max(0, actualMin - padding);
    const upperBound = actualMax + padding;
    tickStep = niceStep((upperBound - lowerBound) / 4);
    domainMin = Math.max(0, Math.floor(lowerBound / tickStep) * tickStep);
    domainMax = Math.ceil(upperBound / tickStep) * tickStep;
    if (domainMax <= domainMin) domainMax = domainMin + tickStep;
  }

  const tickValues = [];
  for (let value = domainMax; value >= domainMin - tickStep / 100; value -= tickStep) {
    tickValues.push(Math.max(domainMin, value));
  }
  const yTicks = tickValues.map((value, index) => ({
    y: plot.top + ((plot.bottom - plot.top) * index) / 4,
    label: relative ? `${Math.round(value)}%` : formatAxisValue(value),
  }));

  const points = series.map(({ values }) => values.map((value, index) => {
    const numericValue = Number(value) || 0;
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const seriesSpread = max - min;
    const pointValue = relative
      ? (seriesSpread === 0 ? 50 : ((numericValue - min) / seriesSpread) * 100)
      : numericValue;
    const y = plot.bottom - ((pointValue - domainMin) / (domainMax - domainMin)) * (plot.bottom - plot.top);
    return { x: xPoints[index], y };
  }));
  const paths = points.map((seriesPoints) => seriesPoints.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' '));

  return { width, height, xPoints, paths, points, yTicks, plot };
}

function niceStep(rawStep) {
  const safeStep = Math.max(rawStep, 0.1);
  const power = 10 ** Math.floor(Math.log10(safeStep));
  const fraction = safeStep / power;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * power;
}

function formatAxisValue(value) {
  if (Math.abs(value) >= 1000) return formatNumber(value / 1000, 1) + 'k';
  return Number.isInteger(value) ? formatNumber(value) : formatNumber(value, 1);
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

function matchesPeriod(date, period, months) {
  if (period === 'all') return true;
  if (period !== 'last30') return date.startsWith(period);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  const candidate = new Date(`${date}T00:00:00`);
  return candidate >= start && candidate <= end && months.includes(date.slice(0, 7));
}

function formatDate(date) {
  return shortDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value);
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase('es-ES') + value.slice(1);
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function getColorForType(type) {
  if (!type) return '#cbd5e1';
  const t = type.toLowerCase();
  if (t.includes('competición')) return '#9d7aa9';
  if (t.includes('test')) return '#d0a054';
  if (t.includes('rodaje')) return '#78a487';
  if (t.includes('series') || t.includes('cambio') || t.includes('cuesta')) return '#6892ad';
  if (t.includes('tirada') || t.includes('long')) return '#bd8b56';
  if (t.includes('fuerza') || t.includes('gym')) return '#6c7fa4';
  return '#8e9ca5';
}

function InternalLoadChart({ data, onSession }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const width = 1200;
  const height = 400;
  const padding = { top: 30, right: 20, bottom: 30, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const dx = plotWidth / Math.max(1, data.length);
  const barWidth = Math.max(4, dx * 0.6);

  const maxWT = 50;
  const maxLine = 120;
  const minLine = 30;

  const points = data.map((d, i) => {
    const x = padding.left + i * dx + dx / 2;
    const yWT = padding.top + plotHeight - ((d.wellbeingTotal || 0) / maxWT) * plotHeight;
    const yHrv = d.hrv ? padding.top + plotHeight - ((d.hrv - minLine) / (maxLine - minLine)) * plotHeight : null;
    const yFcr = d.restingHr ? padding.top + plotHeight - ((d.restingHr - minLine) / (maxLine - minLine)) * plotHeight : null;
    
    let barColor = '#e2e8f0';
    if (d.records?.length > 0) {
      const type = d.records.find(r => r.type && r.type !== 'Descanso')?.type;
      barColor = getColorForType(type);
    } else if (d.wellbeingTotal) {
      barColor = '#cbd5e1';
    }
    
    return { ...d, x, yWT, yHrv, yFcr, barColor };
  });

  const hrvPath = points.filter(p => p.yHrv !== null).map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yHrv}`).join(' ');
  const fcrPath = points.filter(p => p.yFcr !== null).map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yFcr}`).join(' ');

  return (
    <section className="panel chart-card internal-load-chart">
      <PanelHeading title="Carga Interna (Mensual)" description="Respuesta fisiológica y subjetiva al entrenamiento" />
      <div className="chart-scroll" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" style={{ minWidth: `${width}px` }}>
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
             const y = padding.top + plotHeight * pct;
             return <g key={pct}>
               <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-gridline" />
               <text x={padding.left - 8} y={y + 3} textAnchor="end" className="chart-y-label">{Math.round(maxWT - pct * maxWT)}</text>
             </g>
          })}
          
          {points.map((p, i) => p.wellbeingTotal ? (
            <rect key={`bar-${i}`} x={p.x - barWidth/2} y={p.yWT} width={barWidth} height={Math.max(0, padding.top + plotHeight - p.yWT)} fill={p.barColor} rx={3} opacity={0.85} />
          ) : null)}

          {hrvPath && <path d={hrvPath} fill="none" stroke="#618eb1" strokeWidth="2.5" strokeLinejoin="round" />}
          {fcrPath && <path d={fcrPath} fill="none" stroke="#73a681" strokeWidth="2.5" strokeLinejoin="round" />}
          
          {points.map((p, i) => p.yHrv !== null && <circle key={`hrv-${i}`} cx={p.x} cy={p.yHrv} r={4} fill="#618eb1" stroke="#fff" strokeWidth="1.5" />)}
          {points.map((p, i) => p.yFcr !== null && <circle key={`fcr-${i}`} cx={p.x} cy={p.yFcr} r={4} fill="#73a681" stroke="#fff" strokeWidth="1.5" />)}

          {points.map((p, i) => (
             <rect key={`interact-${i}`} x={padding.left + i * dx} y={padding.top} width={dx} height={plotHeight} fill="transparent" 
                onMouseEnter={() => setHoveredDay(p)} 
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => p.records?.[0] && onSession && onSession(sessionFromRecord(p.records[0]))}
                style={{ cursor: p.records?.length ? 'pointer' : 'default' }}
             />
          ))}
          
          {points.map((p, i) => p.records?.some(r => r.type === 'Competición' || r.type?.includes('Test')) ? (
             <text key={`label-${i}`} x={p.x} y={p.yWT - 8} textAnchor="middle" fontSize={12} fill={p.barColor} fontWeight="700">
               {p.records.find(r => r.type === 'Competición' || r.type?.includes('Test')).type}
             </text>
          ) : null)}
          
          {points.map((p, i) => i % Math.max(1, Math.floor(points.length / 10)) === 0 || i === points.length - 1 ? (
             <text key={`x-${i}`} x={p.x} y={height - 10} textAnchor="middle" className="chart-axis-label">{p.date.slice(-2)}</text>
          ) : null)}
        </svg>

        {hoveredDay && hoveredDay.records?.length > 0 && (
          <div className="chart-tooltip" style={{
            position: 'absolute',
            left: Math.min(hoveredDay.x, width - 180),
            top: 20,
            background: '#1b2c3a',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            pointerEvents: 'none',
            fontSize: 12,
            zIndex: 10,
            width: 170,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <b style={{ display: 'block', color: '#99a3ac', marginBottom: 6, fontSize: 10 }}>{hoveredDay.date}</b>
            {hoveredDay.records.map((r, i) => (
              <div key={i} style={{ marginBottom: i < hoveredDay.records.length - 1 ? 8 : 0 }}>
                <strong style={{ display: 'block', color: getColorForType(r.type), marginBottom: 2 }}>{r.type || 'Entrenamiento'}</strong>
                <span style={{ fontSize: 11, color: '#e2e8f0' }}>{r.distance ? `${r.distance} km · ` : ''}{r.minutes ? `${r.minutes} min` : ''}</span>
              </div>
            ))}
            {hoveredDay.wellbeingTotal > 0 && <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #3b4c5a', fontSize: 11, color: '#cbd5e1' }}>
              WT: <b>{Math.round(hoveredDay.wellbeingTotal)}</b> · HRV: <b>{Math.round(hoveredDay.hrv)}</b> · FCR: <b>{Math.round(hoveredDay.restingHr || 0)}</b>
            </div>}
            <div style={{ marginTop: 8, color: '#618eb1', fontSize: 10, fontWeight: 500 }}>Clic para ver detalles ↗</div>
          </div>
        )}
      </div>
      <div className="chart-legend">
        <span><i style={{ background: '#78a487' }} />Rodaje</span>
        <span><i style={{ background: '#6892ad' }} />Series/Intensidad</span>
        <span><i style={{ background: '#9d7aa9' }} />Competición</span>
        <span><i style={{ background: '#618eb1', borderRadius: '50%' }} />HRV</span>
        <span><i style={{ background: '#73a681', borderRadius: '50%' }} />FCR</span>
      </div>
    </section>
  );
}

function ExternalLoadChart({ data }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const width = 1200;
  const height = 400;
  const padding = { top: 20, right: 40, bottom: 30, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const pointsData = data;
  const dx = plotWidth / Math.max(1, pointsData.length - 1);

  // Use dynamic max for normalization to overlap lines
  const maxKm = Math.max(1, ...pointsData.map(d => d.rollingDistance || 0));
  const maxMin = Math.max(1, ...pointsData.map(d => d.rollingMinutes || 0));
  const maxTrimp = Math.max(1, ...pointsData.map(d => d.rollingTrimps || 0));

  const points = pointsData.map((d, i) => {
    const x = padding.left + i * dx;
    // Overlap them in the same area, scaling relative to their own maximums
    const yKm = padding.top + plotHeight - ((d.rollingDistance || 0) / maxKm) * plotHeight;
    const yMin = padding.top + plotHeight - ((d.rollingMinutes || 0) / maxMin) * plotHeight;
    const yTrimp = padding.top + plotHeight - ((d.rollingTrimps || 0) / maxTrimp) * plotHeight;
    return { ...d, x, yKm, yMin, yTrimp };
  });

  const kmPath = points.map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yKm}`).join(' ');
  const kmAreaPath = points.length ? `${kmPath} L ${points.at(-1).x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z` : '';
  const minPath = points.map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yMin}`).join(' ');
  const trimpPath = points.map((p, i) => `${i===0?'M':'L'} ${p.x} ${p.yTrimp}`).join(' ');

  return (
    <section className="panel chart-card external-load-chart">
      <PanelHeading title="Carga Externa Acumulada (Mensual)" description="Evolución superpuesta para ver eficiencia (divergencia entre volumen y tiempo)" />
      <div className="chart-scroll" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" style={{ minWidth: `${width}px` }}>
           <defs>
             <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#4c88ad" stopOpacity="0.25" />
               <stop offset="100%" stopColor="#4c88ad" stopOpacity="0" />
             </linearGradient>
           </defs>
           {[0, 0.25, 0.5, 0.75, 1].map(pct => {
             const y = padding.top + plotHeight * pct;
             return <g key={pct}>
               <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-gridline" />
               <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-y-label" fill="#4c88ad" fontWeight="bold">{Math.round(maxKm - pct * maxKm)}</text>
               <text x={width - padding.right + 8} y={y + 4} textAnchor="start" className="chart-y-label" fill="#70a582" fontWeight="bold">{Math.round(maxMin - pct * maxMin)}</text>
             </g>
           })}

           {kmAreaPath && <path d={kmAreaPath} fill="url(#kmGradient)" />}

           <path d={kmPath} fill="none" stroke="#4c88ad" strokeWidth="3" strokeLinejoin="round" />
           <path d={minPath} fill="none" stroke="#70a582" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" />
           <path d={trimpPath} fill="none" stroke="#bd8b56" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" />
           
           {points.map((p, i) => <circle key={`km-${i}`} cx={p.x} cy={p.yKm} r={4} fill="#4c88ad" stroke="#fff" strokeWidth="1.5" />)}
           
           {points.map((p, i) => (
             <rect key={`interact-${i}`} x={Math.max(0, p.x - dx/2)} y={padding.top} width={dx} height={plotHeight} fill="transparent" 
                onMouseEnter={() => setHoveredDay(p)} 
                onMouseLeave={() => setHoveredDay(null)}
             />
           ))}

           {points.map((p, i) => i % Math.max(1, Math.floor(points.length / 10)) === 0 || i === points.length - 1 ? (
             <text key={`x-${i}`} x={p.x} y={height - 10} textAnchor="middle" className="chart-axis-label">{p.date.slice(-2)}</text>
          ) : null)}
        </svg>

        {hoveredDay && (
          <div className="chart-tooltip" style={{
            position: 'absolute',
            left: Math.min(hoveredDay.x, width - 140),
            top: 20,
            background: '#1b2c3a',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            pointerEvents: 'none',
            fontSize: 12,
            zIndex: 10,
            width: 130,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <b style={{ display: 'block', color: '#99a3ac', marginBottom: 6, fontSize: 10 }}>{hoveredDay.date} (Últ. 7d)</b>
            <div style={{ marginBottom: 4 }}><strong style={{ color: '#4c88ad' }}>{hoveredDay.rollingDistance}</strong> km</div>
            <div style={{ marginBottom: 4 }}><strong style={{ color: '#70a582' }}>{hoveredDay.rollingMinutes}</strong> min</div>
            <div><strong style={{ color: '#bd8b56' }}>{hoveredDay.rollingTrimps}</strong> TRIMPS</div>
          </div>
        )}
      </div>
      <div className="chart-legend">
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <i style={{ background: 'linear-gradient(to bottom, rgba(76,136,173,0.5), transparent)', borderTop: '3px solid #4c88ad', height: 8, width: 12, marginRight: 6, display: 'inline-block', borderRadius: 0 }} />
          Kilómetros (max {Math.round(maxKm)})
        </span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <i style={{ borderBottom: '2.5px dashed #70a582', height: 0, width: 14, marginRight: 6, display: 'inline-block', borderRadius: 0, background: 'transparent' }} />
          Minutos (max {Math.round(maxMin)})
        </span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <i style={{ borderBottom: '2px dotted #bd8b56', height: 0, width: 14, marginRight: 6, display: 'inline-block', borderRadius: 0, background: 'transparent' }} />
          TRIMPS (max {Math.round(maxTrimp)})
        </span>
      </div>
    </section>
  );
}
