import { useState, useMemo } from 'react';
import { createTrainingHistory } from '../../data/trainingHistory.js';
import { getWeekDateRange } from '../../components/ui/WeekTimeline.jsx';

const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const wellbeingFields = [
  ['mood', 'Irritabilidad'],
  ['fatigue', 'Fatiga'],
  ['soreness', 'Agujetas'],
  ['sleep', 'Sueño'],
  ['stress', 'Estrés'],
];

export default function DiaryAveragesModal({ onClose, trainingLogs, coachWeeks, currentWeek }) {
  const [mode, setMode] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const history = useMemo(() => createTrainingHistory(trainingLogs), [trainingLogs]);

  const availableMonths = useMemo(() => {
    return [...new Set(history.map((r) => r.date.slice(0, 7)))].sort();
  }, [history]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    const record = history.find((r) => r.preparationWeek === currentWeek);
    if (record) {
      const index = availableMonths.indexOf(record.date.slice(0, 7));
      return index >= 0 ? index : 0;
    }
    return 0;
  });

  const selectedMonth = availableMonths[selectedMonthIndex] || '';

  const records = useMemo(() => {
    if (mode === 'weekly') {
      return history.filter((r) => r.preparationWeek === selectedWeek);
    }
    return history.filter((r) => r.date.startsWith(selectedMonth));
  }, [mode, selectedWeek, selectedMonth, history]);

  const averages = useMemo(() => computeAverages(records), [records]);

  const weekPhase = coachWeeks.find((w) => w.number === selectedWeek)?.phase || '';
  const weekDateRange = getWeekDateRange(selectedWeek, 8);
  const monthLabel = selectedMonth
    ? capitalize(monthFormatter.format(new Date(`${selectedMonth}-01T00:00:00Z`)))
    : '';
  const maxWeek = coachWeeks.length;

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal diary-averages-modal" onSubmit={(e) => e.preventDefault()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="eyebrow">MEDIAS DEL DIARIO</div>
        <h2>Valores medios</h2>
        <p className="muted">Medias de todas las variables registradas en el diario.</p>

        {/* ── Mode toggle ── */}
        <div className="averages-mode-toggle" role="tablist" aria-label="Tipo de agrupación">
          <button
            role="tab"
            aria-selected={mode === 'weekly'}
            className={mode === 'weekly' ? 'active' : ''}
            onClick={() => setMode('weekly')}
          >
            Semanal
          </button>
          <button
            role="tab"
            aria-selected={mode === 'monthly'}
            className={mode === 'monthly' ? 'active' : ''}
            onClick={() => setMode('monthly')}
          >
            Mensual
          </button>
        </div>

        {/* ── Period navigation ── */}
        <div className="averages-period-nav">
          {mode === 'weekly' ? (
            <>
              <button type="button" className="bare-arrow" onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))} aria-label="Semana anterior">‹</button>
              <div>
                <strong>Semana {selectedWeek}</strong>
                <small>{weekPhase} · {weekDateRange}</small>
              </div>
              <button type="button" className="bare-arrow" onClick={() => setSelectedWeek(Math.min(maxWeek, selectedWeek + 1))} aria-label="Semana siguiente">›</button>
            </>
          ) : (
            <>
              <button type="button" className="bare-arrow" onClick={() => setSelectedMonthIndex(Math.max(0, selectedMonthIndex - 1))} aria-label="Mes anterior">‹</button>
              <div>
                <strong>{monthLabel}</strong>
              </div>
              <button type="button" className="bare-arrow" onClick={() => setSelectedMonthIndex(Math.min(availableMonths.length - 1, selectedMonthIndex + 1))} aria-label="Mes siguiente">›</button>
            </>
          )}
        </div>

        <div className="averages-days-count">
          {records.length} {records.length === 1 ? 'día con datos' : 'días con datos'}
        </div>

        {averages ? (
          <div className="averages-blocks">
            {/* ── Training ── */}
            <div className="averages-block">
              <div className="averages-block-title">Entrenamiento</div>
              <div className="averages-metrics-grid">
                <AvgMetric label="Distancia" value={fmt(averages.distanceAvg, 1)} unit="km/día" />
                <AvgMetric label="Duración" value={fmt(averages.minutesAvg, 0)} unit="min/día" />
                <AvgMetric label="FC media" value={fmt(averages.averageHr, 0)} unit="ppm" />
                <AvgMetric label="TRIMPS" value={fmt(averages.trimpsAvg, 0)} unit="/día" />
              </div>
              <div className="averages-totals">
                Totales: {fmt(averages.distanceTotal, 1)} km · {fmt(averages.minutesTotal, 0)} min · {fmt(averages.trimpsTotal, 0)} TRIMPS
              </div>
            </div>

            {/* ── Health ── */}
            <div className="averages-block">
              <div className="averages-block-title">Salud</div>
              <div className="averages-metrics-grid two-cols">
                <AvgMetric label="FC en reposo" value={fmt(averages.restingHr, 0)} unit="ppm" />
                <AvgMetric label="HRV" value={fmt(averages.hrv, 0)} unit="ms" />
              </div>
            </div>

            {/* ── Wellbeing ── */}
            <div className="averages-block">
              <div className="averages-block-title">Bienestar personal <small>Escala 1–10</small></div>
              <div className="averages-wellbeing-list">
                {wellbeingFields.map(([key, label]) => (
                  <WellbeingBar key={key} label={label} value={averages[key]} />
                ))}
              </div>
              <div className="averages-wt-total">
                Media WT total: <strong>{fmt(averages.wellbeingTotalAvg, 1)}</strong> <small>/ 50</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="averages-empty">
            <p>No hay datos registrados en este periodo.</p>
          </div>
        )}

        <div className="inline-actions">
          <button className="button primary" type="button" onClick={onClose}>Cerrar</button>
        </div>
      </form>
    </div>
  );
}

/* ── Sub-components ── */

function AvgMetric({ label, value, unit }) {
  return (
    <div className="avg-metric">
      <span className="avg-metric-label">{label}</span>
      <strong className="avg-metric-value">{value}<small>{unit ? ` ${unit}` : ''}</small></strong>
    </div>
  );
}

function WellbeingBar({ label, value }) {
  const numValue = value ?? 0;
  const color = numValue === 0
    ? '#8793a0'
    : `hsl(${120 - (numValue - 1) * (120 / 9)} 58% 38%)`;
  const widthPercent = numValue ? (numValue / 10) * 100 : 0;

  return (
    <div className="avg-wellbeing-row">
      <span className="avg-wellbeing-label">{label}</span>
      <div className="avg-wellbeing-track">
        <div className="avg-wellbeing-fill" style={{ width: `${widthPercent}%`, background: color }} />
      </div>
      <strong className="avg-wellbeing-value" style={{ color }}>{value !== null ? fmt(value, 1) : '—'}</strong>
    </div>
  );
}

/* ── Helpers ── */

function computeAverages(records) {
  if (!records.length) return null;

  const avg = (values) => {
    const valid = values.filter((v) => Number.isFinite(v) && v > 0);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  const sum = (values) => values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

  return {
    daysCount: records.length,
    distanceTotal: sum(records.map((r) => r.distance)),
    distanceAvg: avg(records.map((r) => r.distance)),
    minutesTotal: sum(records.map((r) => r.minutes)),
    minutesAvg: avg(records.map((r) => r.minutes)),
    trimpsTotal: sum(records.map((r) => r.trimps)),
    trimpsAvg: avg(records.map((r) => r.trimps)),
    averageHr: avg(records.map((r) => r.averageHr)),
    restingHr: avg(records.map((r) => r.restingHr)),
    hrv: avg(records.map((r) => r.hrv)),
    mood: avg(records.map((r) => r.mood)),
    fatigue: avg(records.map((r) => r.fatigue)),
    soreness: avg(records.map((r) => r.soreness)),
    sleep: avg(records.map((r) => r.sleep)),
    stress: avg(records.map((r) => r.stress)),
    wellbeingTotalAvg: avg(records.map((r) => r.wellbeingTotal)),
  };
}

function fmt(value, decimals = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value);
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase('es-ES') + value.slice(1);
}
