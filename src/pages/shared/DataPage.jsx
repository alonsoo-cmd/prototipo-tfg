import { Fragment, useMemo, useState } from 'react';
import { createTrainingHistory, preparationPhases } from '../../data/trainingHistory.js';
import './DataPage.css';

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortDateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export default function DataPage({ trainingLogs = {}, onSession }) {
  const [section, setSection] = useState('data');
  const [period, setPeriod] = useState('last30');
  const [phase, setPhase] = useState('all');
  const history = useMemo(() => createTrainingHistory(trainingLogs), [trainingLogs]);
  const availableMonths = [...new Set(history.map((record) => record.date.slice(0, 7)))].sort();
  const rangeFilteredRecords = history.filter((record) => matchesPeriod(record.date, period, availableMonths));
  const filteredRecords = rangeFilteredRecords.filter((record) => phase === 'all' || record.phase === phase);
  const weekGroups = groupBy(filteredRecords, (record) => record.preparationWeek);
  const weeklyRows = [...weekGroups.entries()].map(([week, records]) => summarize(records, `Semana ${week}`, week));
  const dailyRows = [...groupBy(filteredRecords, (record) => record.date).entries()]
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, records]) => summarize(records, date, date));
  const recentSevenDays = dailyRows.slice(0, 7).reverse();
  const chartWeeks = weeklyRows;
  const typeBreakdown = summarizeTypes(filteredRecords);
  const zoneTotals = summarizeZones(filteredRecords);
  const wellnessTrend = dailyRows.slice(0, 30).reverse();
  const rollingMileage = createRollingMileage(history.filter((record) => phase === 'all' || record.phase === phase), filteredRecords);

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
        />
      ) : (
        <ChartsSection
          weeklyRows={chartWeeks}
          typeBreakdown={typeBreakdown}
          zoneTotals={zoneTotals}
          wellnessTrend={wellnessTrend}
          rollingMileage={rollingMileage}
        />
      )}
    </div>
  );
}

function DataSection({ records, recentSevenDays, onSession }) {
  const monthGroups = [...groupBy(records, (record) => record.date.slice(0, 7)).entries()]
    .sort(([monthA], [monthB]) => monthB.localeCompare(monthA));
  return (
    <div className="data-section">
      <section className="panel data-table-panel">
        <PanelHeading title="Detalle de entrenamientos" description={`${records.length} sesiones dentro del periodo y fase seleccionados`} />
        <div className="training-calendar">
          {!monthGroups.length && <p className="empty-chart">No hay sesiones para mostrar.</p>}
          {monthGroups.map(([month, monthRecords]) => <TrainingCalendarMonth key={month} month={month} records={monthRecords} allRecords={records} onSession={onSession} />)}
        </div>
      </section>

      <section className="panel data-table-panel recent-seven-panel">
        <PanelHeading title="Últimos 7 días" description="Kilómetros, minutos y TRIMPS de los siete días más recientes del periodo" />
        <SummaryTable rows={recentSevenDays} firstColumn="Día" />
      </section>
    </div>
  );
}

function TrainingCalendarMonth({ month, records, allRecords, onSession }) {
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const recordsByDay = groupBy(records, (record) => Number(record.date.slice(8, 10)));
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <section className="training-calendar-month" aria-label={capitalize(monthFormatter.format(new Date(`${month}-01T00:00:00Z`)))}>
      <h3>{capitalize(monthFormatter.format(new Date(`${month}-01T00:00:00Z`)))}</h3>
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
                  {dayRecords.map((record) => <button className="training-calendar-session" key={record.id} onClick={() => onSession?.(sessionFromRecord(record))} aria-label={`Ver ${record.type}, ${formatDate(record.date)}`}>
                    <b>{record.type}</b><span>{formatNumber(record.distance, 1)} km · {record.minutes} min</span>
                  </button>)}
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
  const tone = /series|umbral|competición/i.test(record.type) ? 'blue' : 'navy';
  return {
    ...record,
    date: date.getUTCDate(),
    dateLabel,
    time: '—',
    mins: record.minutes,
    km: record.distance,
    tr: String(record.trimps),
    blocks: record.description,
    state: record.status,
    tone,
  };
}

function ChartsSection({ weeklyRows, typeBreakdown, zoneTotals, wellnessTrend, rollingMileage }) {
  return (
    <div className="data-section charts-section">
      <div className="chart-grid three-charts">
        <LineChart title="Kilómetros por semana" unit="km" values={weeklyRows.map((row) => row.kilometers)} labels={weeklyRows.map((row) => `S${row.week}`)} color="#4c88ad" />
        <LineChart title="Minutos por semana" unit="min" values={weeklyRows.map((row) => row.minutes)} labels={weeklyRows.map((row) => `S${row.week}`)} color="#70a582" />
        <LineChart title="TRIMPS por semana" unit="TRIMPS" values={weeklyRows.map((row) => row.trimps)} labels={weeklyRows.map((row) => `S${row.week}`)} color="#bd8b56" />
      </div>

      <div className="chart-grid two-charts">
        <TypeBreakdown data={typeBreakdown} />
        <ZoneBreakdown totals={zoneTotals} />
      </div>

      <div className="chart-grid two-charts">
        <LineChart
          title="WT"
          unit="Bienestar total · /50"
          values={wellnessTrend.map((row) => row.wellbeingTotal)}
          labels={wellnessTrend.map((row) => shortDateFormatter.format(new Date(`${row.date}T00:00:00Z`)))}
          color="#bb7f99"
        />
        <LineChart
          title="HRV"
          unit="Milisegundos"
          values={wellnessTrend.map((row) => row.hrv)}
          labels={wellnessTrend.map((row) => shortDateFormatter.format(new Date(`${row.date}T00:00:00Z`)))}
          color="#618eb1"
        />
        <LineChart
          title="FC en reposo"
          unit="Pulsaciones por minuto"
          values={wellnessTrend.map((row) => row.restingHr)}
          labels={wellnessTrend.map((row) => shortDateFormatter.format(new Date(`${row.date}T00:00:00Z`)))}
          color="#d1786d"
        />
        <LineChart
          title="Kilómetros acumulados en ventana móvil de 7 días"
          unit="Cada punto suma el día y los seis anteriores"
          values={rollingMileage.map((point) => point.distance)}
          labels={rollingMileage.map((point) => shortDateFormatter.format(new Date(`${point.date}T00:00:00Z`)))}
          color="#568e78"
        />
      </div>
    </div>
  );
}

function PanelHeading({ title, description }) {
  return <div className="panel-title data-panel-title"><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function SummaryTable({ rows, firstColumn }) {
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

function createRollingMileage(allPhaseRecords, visibleRecords) {
  const visibleDates = new Set(visibleRecords.map((record) => record.date));
  const byDate = new Map([...groupBy(allPhaseRecords, (record) => record.date)].map(([date, records]) => [date, records.reduce((sum, record) => sum + record.distance, 0)]));
  return [...visibleDates].sort().map((date) => {
    const end = new Date(`${date}T00:00:00Z`);
    let distance = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(end);
      day.setUTCDate(day.getUTCDate() - offset);
      distance += byDate.get(day.toISOString().slice(0, 10)) || 0;
    }
    return { date, distance: round(distance) };
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
