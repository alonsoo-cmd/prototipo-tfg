import { useState } from 'react';
import { sessions } from '../../data/sessions.js';
import './Diary.css';

const wellbeingFields = [
  ['mood', 'Humor'],
  ['fatigue', 'Fatiga'],
  ['soreness', 'Agujetas'],
  ['sleep', 'Sueño'],
  ['stress', 'Estrés'],
];

const injuryRegions = [
  { id: 'rodilla-derecha', label: 'Rodilla derecha' },
  { id: 'rodilla-izquierda', label: 'Rodilla izquierda' },
  { id: 'cuadriceps-derecho', label: 'Cuádriceps derecho' },
  { id: 'cuadriceps-izquierdo', label: 'Cuádriceps izquierdo' },
  { id: 'tibial-anterior-derecho', label: 'Tibial anterior derecho' },
  { id: 'tibial-anterior-izquierdo', label: 'Tibial anterior izquierdo' },
  { id: 'tibial-posterior-derecho', label: 'Tibial posterior derecho' },
  { id: 'tibial-posterior-izquierdo', label: 'Tibial posterior izquierdo' },
  { id: 'isquiotibial-izquierdo', label: 'Isquiotibial izquierdo' },
  { id: 'isquiotibial-derecho', label: 'Isquiotibial derecho' },
  { id: 'gluteo', label: 'Glúteo' },
  { id: 'tobillo-izquierdo', label: 'Tobillo izquierdo' },
  { id: 'tobillo-derecho', label: 'Tobillo derecho' },
  { id: 'aductores-izquierdo', label: 'Aductores izquierdo' },
  { id: 'aductores-derecho', label: 'Aductores derecho' },
  { id: 'gemelo-izquierdo', label: 'Gemelo izquierdo' },
  { id: 'gemelo-derecho', label: 'Gemelo derecho' },
  { id: 'otro', label: 'Otro' },
];

export default function Diary({
  week,
  setWeek,
  activePlan,
  setActivePlan,
  preparation = null,
  onSession,
  onPlan,
  onPhases,
  coachWeeks,
  trainingLogs,
  setTrainingLogs,
}) {
  const [journalDay, setJournalDay] = useState(null);
  const visibleWeek = coachWeeks.find((item) => item.number === week);
  const weekSessions = visibleWeek?.days || sessions;
  const objectives = preparation?.objectives || [];
  const primaryObjective = objectives[0];
  const savedLogs = weekSessions
    .map((session) => trainingLogs[logKey(week, session.day)])
    .filter(Boolean);

  const totals = savedLogs.reduce((result, log) => ({
    kilometers: result.kilometers + numberFrom(log.distance),
    minutes: result.minutes + numberFrom(log.minutes),
    trimps: result.trimps + numberFrom(log.trimps),
  }), { kilometers: 0, minutes: 0, trimps: 0 });

  const wellbeingLogs = savedLogs.filter((log) => wellbeingFields.some(([key]) => log[key] !== '' && log[key] !== undefined));
  const averageWt = wellbeingLogs.length
    ? wellbeingLogs.reduce((total, log) => total + wellbeingFields.reduce((sum, [key]) => sum + numberFrom(log[key]), 0), 0) / wellbeingLogs.length
    : null;
  const stats = { ...totals, averageWt, daysLogged: savedLogs.length };

  const saveJournal = (day, values) => {
    setTrainingLogs((current) => ({ ...current, [logKey(week, day)]: values }));
    setJournalDay(null);
  };

  if (!activePlan) {
    return (
      <div className="content empty-page">
        <div className="empty-card">
          <div className="empty-graphic">↗</div>
          <div className="eyebrow">PREPARACIÓN</div>
          <h1>Empieza una preparación</h1>
          <p>Encuentra un entrenador y define un objetivo para organizar tu calendario de entrenamiento.</p>
          <button className="button primary large" onClick={onPlan}>Start Preparation <span>→</span></button>
          <button className="text-button" onClick={() => setActivePlan(true)}>Ver vista de ejemplo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content diary-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PREPARACIÓN ACTIVA <span className="bullet">•</span> EJEMPLO</div>
          <h1>{primaryObjective?.name || 'Media Maratón Madrid'} <span className="phase-badge">BII / Acumulación</span></h1>
          <p>{objectives.length > 1 ? `Objetivos · ${objectives.map((objective) => `${objective.name} (${objective.distance})`).join(' · ')}` : `Objetivo · ${primaryObjective?.distance || 'Media maratón'} · ${primaryObjective?.eventDate ? formatGoalDate(primaryObjective.eventDate) : '6 diciembre 2026'}`}</p>
        </div>
        <button className="button secondary week-select" onClick={onPhases}>Semana {week} <span>⌄</span></button>
      </div>

      <section className="diary-stats" aria-label="Estadísticas de los últimos siete días">
        <div className="diary-stats-heading">
          <div className="eyebrow">ÚLTIMOS 7 DÍAS</div>
          <small>{stats.daysLogged} {stats.daysLogged === 1 ? 'día registrado' : 'días registrados'}</small>
        </div>
        <Stat label="Kilómetros" value={formatNumber(stats.kilometers)} unit="km" />
        <Stat label="Minutos" value={formatNumber(stats.minutes)} unit="min" />
        <Stat label="TRIMPS" value={formatNumber(stats.trimps)} />
        <Stat label="Media WT diaria" value={stats.averageWt === null ? '—' : formatNumber(stats.averageWt, 1)} unit="/ 50" />
      </section>

      <div className="week-control">
        <div>
          <button className="bare-arrow" onClick={() => setWeek(Math.max(1, week - 1))}>‹</button>
          <strong>Semana {week} · 21 — 27</strong>
          <button className="bare-arrow" onClick={() => setWeek(Math.min(coachWeeks.length, week + 1))}>›</button>
        </div>
        <button className="text-button" onClick={onPhases}>Ver todas las semanas y fases ↗</button>
      </div>

      <section className="week-layout">
        <div className="week-board">
          <div className="week-grid">
            {weekSessions.map((session) => (
              <article className="day-column" key={session.day}>
                <div className="day-heading"><span>{session.day}</span><b>{session.date}</b></div>
                <button className={`session-card ${session.tone}`} onClick={() => onSession(session)}>
                  <div className="card-title">{session.type}<span>⌄</span></div>
                  <div className="card-desc">{session.desc}</div>
                  {session.shoes && <div className="session-shoes-note">👟 {session.shoes}</div>}
                  <div className="card-meta">
                    <span>{session.mins ? `${session.mins} min` : '—'}</span>
                    <span>{session.km ? `${session.km} km` : '—'}</span>
                  </div>
                  <div className="card-state"><i />{session.state}</div>
                </button>
                <button
                  className={`journal-button ${trainingLogs[logKey(week, session.day)] ? 'has-entry' : ''}`}
                  onClick={() => setJournalDay(session)}
                  aria-label={`Abrir diario de entrenamiento del ${session.day}`}
                  title="Registrar entrenamiento y bienestar"
                >
                  <span aria-hidden="true">📓</span>
                  <span>{trainingLogs[logKey(week, session.day)] ? 'Editado' : 'Registrar'}</span>
                </button>
                <div className="day-load"><span>{session.km ? session.km.toFixed(1).replace('.', ',') : '0,0'} km</span><span>{session.tr} TR</span></div>
              </article>
            ))}
          </div>
        </div>
        <WeeklyLoad week={week} />
      </section>

      {journalDay && (
        <JournalModal
          session={journalDay}
          initialValues={trainingLogs[logKey(week, journalDay.day)]}
          onClose={() => setJournalDay(null)}
          onSave={(values) => saveJournal(journalDay.day, values)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="diary-stat">
      <span>{label}</span>
      <strong>{value}<small>{unit ? ` ${unit}` : ''}</small></strong>
    </div>
  );
}

function WeeklyLoad({ week }) {
  const rows = [
    ['Kilómetros', '35', '4', '8', '46'],
    ['Minutos', '182', '16', '34', '232'],
    ['TRIMPS', '182', '32', '102', '316'],
  ];

  return (
    <aside className="weekly-summary">
      <div className="summary-top"><div><div className="eyebrow">RESUMEN</div><h2>Semana {week}</h2></div><span className="summary-calendar">▦</span></div>
      <div className="summary-labels"><span /><span>BAJA</span><span>MEDIA</span><span>ALTA</span><span>TOTAL</span></div>
      {rows.map(([label, ...values]) => (
        <div className="summary-row" key={label}>
          <b>{label}</b>
          {values.map((value, index) => <span className={index === values.length - 1 ? 'total' : ''} key={index}>{value}</span>)}
        </div>
      ))}
      <div className="summary-foot"><span>Distribución registrada</span><span className="legend"><i className="low" /><i className="mid" /><i className="high" /></span></div>
    </aside>
  );
}

function JournalModal({ session, initialValues, onClose, onSave }) {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [intervalImage, setIntervalImage] = useState(null);
  const [intervalDraft, setIntervalDraft] = useState('');
  const [aiDraftReady, setAiDraftReady] = useState(false);
  const [injuries, setInjuries] = useState(() => initialValues?.injuries || []);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [injuryLevel, setInjuryLevel] = useState(1);
  const [otherRegion, setOtherRegion] = useState('');
  const [injuryDescription, setInjuryDescription] = useState('');
  const [values, setValues] = useState(() => ({
    distance: initialValues?.distance ?? (session.km || ''),
    minutes: initialValues?.minutes ?? (session.mins || ''),
    trimps: '',
    pace: initialValues?.pace ?? '',
    averageHr: initialValues?.averageHr ?? '',
    restingHr: initialValues?.restingHr ?? '',
    hrv: initialValues?.hrv ?? '',
    mood: initialValues?.mood ?? '',
    fatigue: initialValues?.fatigue ?? '',
    soreness: initialValues?.soreness ?? '',
    sleep: initialValues?.sleep ?? '',
    stress: initialValues?.stress ?? '',
    notes: initialValues?.notes ?? '',
    description: initialValues?.description ?? '',
  }));

  const update = (key, value) => setValues((current) => {
    const next = { ...current, [key]: value };
    next.trimps = calculateTrimps(next.minutes, next.averageHr, next.restingHr);
    return next;
  });
  const supportsIntervals = /series|umbral|cuesta|interval|repeticion|repetición|fartlek|velocidad/i.test(`${session.type} ${session.blocks}`);
  const isRestDay = /descanso/i.test(session.type);
  const importStravaDemo = () => {
    setStravaConnected(true);
    setValues((current) => ({
      ...current,
      distance: '9.6', minutes: '58', pace: '6:04', averageHr: '154',
      trimps: calculateTrimps('58', '154', current.restingHr),
    }));
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal journal-modal" onSubmit={(event) => {
        event.preventDefault();
        const savedInjuries = selectedRegion ? [...injuries.filter((item) => (item.regionId || item.region) !== selectedRegion), {
          region: selectedRegion === 'otro' ? `otro:${otherRegion.trim().toLocaleLowerCase('es-ES')}` : selectedRegion,
          regionId: selectedRegion,
          regionLabel: selectedRegion === 'otro' ? otherRegion.trim() : injuryRegions.find((region) => region.id === selectedRegion)?.label,
          otherRegion: selectedRegion === 'otro' ? otherRegion.trim() : '',
          level: injuryLevel,
          description: injuryDescription.trim(),
        }] : injuries;
        onSave({ ...values, injuries: savedInjuries, trimps: calculateTrimps(values.minutes, values.averageHr, values.restingHr) });
      }}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="eyebrow">DIARIO DE ENTRENAMIENTO · {session.day.toUpperCase()} {session.date} OCT</div>
        <h2>{session.type}</h2>
        <p className="muted">Registra la actividad y tus valores personales de hoy.</p>

        {!isRestDay && <div className="journal-strava-connect">
          <div><b>Strava</b><small>{stravaConnected ? 'Actividad de ejemplo importada' : 'Prototipo · importa una actividad de ejemplo'}</small></div>
          <button className="button secondary" type="button" onClick={importStravaDemo}>{stravaConnected ? 'Actualizar actividad' : 'Conectar con Strava'}</button>
        </div>}

        {!isRestDay && supportsIntervals && (
          <fieldset className="journal-fieldset">
            <legend>Series, umbral y repeticiones</legend>
            <p className="wellbeing-help">Sube una captura de los tiempos para generar un borrador editable para la descripción.</p>
            <label className="button secondary journal-image-button">{intervalImage ? 'Cambiar captura' : '↑ Subir captura'}
              <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setIntervalImage(file); setAiDraftReady(false); } }} />
            </label>
            {intervalImage && <div className="journal-ai-row">
              <span>{intervalImage.name}</span>
              <button className="button secondary" type="button" onClick={() => { setIntervalDraft('Series: 1.000 m en 4:12, 4:10 y 4:14. Recuperación: 2:00 entre series.'); setAiDraftReady(true); }}>Extraer con IA</button>
            </div>}
            {aiDraftReady && <p className="help-text">Borrador de demostración: la integración con un servicio de IA no está conectada.</p>}
            <label className="field-label">Descripción del entrenamiento<textarea rows="3" value={values.description || intervalDraft} onChange={(event) => { setIntervalDraft(event.target.value); update('description', event.target.value); }} placeholder="Describe las series, tiempos y recuperaciones" /></label>
          </fieldset>
        )}

        {!isRestDay && <fieldset className="journal-fieldset">
          <legend>Datos del entrenamiento</legend>
          <p className="wellbeing-help">TRIMPS se estima automáticamente con duración y FC media (FC máx. de referencia: 190 ppm).</p>
          <div className="journal-input-grid">
            <NumberField label="Distancia" unit="km" value={values.distance} onChange={(value) => update('distance', value)} step="0.1" />
            <NumberField label="Duración" unit="min" value={values.minutes} onChange={(value) => update('minutes', value)} />
            <label className="field-label">TRIMPS <small className="journal-unit">calculado</small><input type="number" value={calculateTrimps(values.minutes, values.averageHr, values.restingHr)} readOnly placeholder="Completa duración y FC media" /></label>
            <TextField label="Ritmo medio" unit="min/km" value={values.pace} onChange={(value) => update('pace', value)} placeholder="5:20" />
            <NumberField label="FC media" unit="ppm" value={values.averageHr} onChange={(value) => update('averageHr', value)} />
          </div>
        </fieldset>}

        <fieldset className="journal-fieldset">
          <legend>Salud</legend>
          <div className="journal-input-grid">
            <NumberField label="FC en reposo" unit="ppm" value={values.restingHr} onChange={(value) => update('restingHr', value)} />
            <NumberField label="HRV" unit="ms" value={values.hrv} onChange={(value) => update('hrv', value)} />
          </div>
        </fieldset>

        <fieldset className="journal-fieldset wellbeing-fieldset">
          <legend>Bienestar personal</legend>
          <p className="wellbeing-help">Selecciona un valor para cada indicador. 1 es verde y 10 es rojo.</p>
          <div className="wellbeing-ranges">
            {wellbeingFields.map(([key, label]) => (
              <RangeField key={key} label={label} value={values[key]} onChange={(value) => update(key, value)} />
            ))}
          </div>
        </fieldset>

        <fieldset className="journal-fieldset injury-fieldset">
          <legend>Molestias</legend>
          <p className="wellbeing-help">Añade cada molestia de hoy, indica cuánto duele y describe qué ha pasado si lo necesitas.</p>
          <label className="field-label">Parte del cuerpo<select value={selectedRegion} onChange={(event) => {
            const region = event.target.value;
            const existing = injuries.find((item) => (item.regionId || item.region) === region);
            setSelectedRegion(region);
            setInjuryLevel(Number(existing?.level) || 1);
            setOtherRegion(existing?.otherRegion || '');
            setInjuryDescription(existing?.description || '');
          }}><option value="">Selecciona una zona…</option>{injuryRegions.map((region) => <option value={region.id} key={region.id}>{region.label}</option>)}</select></label>
          {selectedRegion && <div className="injury-editor injury-editor-form">
            <div className="injury-level-heading"><b>{selectedRegion === 'otro' ? 'Otra parte del cuerpo' : injuryRegions.find((region) => region.id === selectedRegion)?.label}</b><span>Dolor · {injuryLevel}/10</span></div>
            {selectedRegion === 'otro' && <label className="field-label">Indica la parte del cuerpo<input value={otherRegion} onChange={(event) => setOtherRegion(event.target.value)} placeholder="Ej. zona lumbar" required /></label>}
            <label className="injury-level-field">Intensidad<input aria-label="Nivel de molestia del 1 al 10" type="range" min="1" max="10" value={injuryLevel} onChange={(event) => setInjuryLevel(Number(event.target.value))} /></label>
            <label className="field-label injury-description-field">Descripción<textarea rows="2" value={injuryDescription} onChange={(event) => setInjuryDescription(event.target.value)} placeholder="Ej. Pisé mal en un bordillo y me caí" /></label>
            <button className="button secondary" type="button" disabled={selectedRegion === 'otro' && !otherRegion.trim()} onClick={() => {
              const regionLabel = selectedRegion === 'otro' ? otherRegion.trim() : injuryRegions.find((region) => region.id === selectedRegion)?.label;
              const regionKey = selectedRegion === 'otro' ? `otro:${otherRegion.trim().toLocaleLowerCase('es-ES')}` : selectedRegion;
              setInjuries((current) => [...current.filter((item) => (item.regionId || item.region) !== selectedRegion), { region: regionKey, regionId: selectedRegion, regionLabel, otherRegion: selectedRegion === 'otro' ? otherRegion.trim() : '', level: injuryLevel, description: injuryDescription.trim() }]);
              setSelectedRegion(''); setOtherRegion(''); setInjuryDescription('');
            }}>Añadir molestia</button>
          </div>}
          {injuries.length > 0 && <ul className="injury-marked-list">{injuries.map((injury) => <li key={injury.region}><span><b>{injury.regionLabel || injuryRegions.find((region) => region.id === injury.region)?.label || injury.otherRegion || 'Otra zona'} · {injury.level}/10</b>{injury.description && <small>{injury.description}</small>}</span><button type="button" aria-label={`Quitar ${injury.regionLabel || injury.otherRegion || injury.region}`} onClick={() => setInjuries((current) => current.filter((item) => item.region !== injury.region))}>Quitar</button></li>)}</ul>}
        </fieldset>

        <label className="field-label">Notas del día<textarea rows="2" value={values.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Sensaciones, contexto o comentarios" /></label>
        <div className="inline-actions">
          <button className="button secondary" type="button" onClick={onClose}>Cancelar</button>
          <button className="button primary" type="submit">Guardar registro</button>
        </div>
      </form>
    </div>
  );
}

function calculateTrimps(minutes, averageHr, restingHr) {
  const duration = Number(minutes);
  const avg = Number(averageHr);
  const rest = Number(restingHr);
  if (!duration || !avg) return '';
  const maxHr = 190;
  const reserve = Math.max(0, Math.min(1, (avg - (rest || 60)) / (maxHr - (rest || 60))));
  return Math.round(duration * reserve * 0.64 * Math.exp(1.92 * reserve));
}

function NumberField({ label, unit, value, onChange, step = '1' }) {
  return (
    <label className="field-label">
      {label}{unit && <small className="journal-unit">{unit}</small>}
      <input type="number" min="0" step={step} value={value} onChange={(event) => onChange(event.target.value)} placeholder="—" />
    </label>
  );
}

function TextField({ label, unit, value, onChange, placeholder }) {
  return (
    <label className="field-label">
      {label}{unit && <small className="journal-unit">{unit}</small>}
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function RangeField({ label, value, onChange }) {
  const selectedValue = value === '' ? null : Number(value);
  const color = selectedValue === null ? '#8793a0' : `hsl(${120 - (selectedValue - 1) * (120 / 9)} 58% 38%)`;

  return (
    <label className="wellbeing-range-field">
      <span className="wellbeing-range-heading">
        <b>{label}</b>
        <strong style={{ color }}>{selectedValue ?? '—'}<small>{selectedValue === null ? 'Sin registrar' : '/ 10'}</small></strong>
      </span>
      <input
        className="wellbeing-range"
        type="range"
        min="1"
        max="10"
        step="1"
        value={selectedValue ?? 1}
        aria-label={`${label}, de 1 a 10`}
        aria-valuetext={selectedValue === null ? 'Sin registrar' : `${selectedValue} de 10`}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="wellbeing-range-ends"><span>1 · Verde</span><span>10 · Rojo</span></span>
    </label>
  );
}

function numberFrom(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value);
}

function formatGoalDate(value) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function logKey(week, day) {
  return `${week}-${day}`;
}
