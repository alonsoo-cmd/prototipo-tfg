import { useState } from 'react';
import { sessions } from '../../data/sessions.js';
import WorkoutStatus from '../../components/ui/WorkoutStatus.jsx';
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
                <div className="diary-workout-status"><WorkoutStatus status={trainingLogs[logKey(week, session.day)]?.completionStatus || (trainingLogs[logKey(week, session.day)] ? 'completed' : null)} /></div>
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

export function JournalModal({ session, initialValues, onClose, onSave, hidePersonalFields = false }) {
  const [stravaConnected, setStravaConnected] = useState(false);
  const [intervalImage, setIntervalImage] = useState(null);
  const [intervalDraft, setIntervalDraft] = useState('');
  const [aiDraftReady, setAiDraftReady] = useState(false);
  const [injuries, setInjuries] = useState(() => initialValues?.injuries || []);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [injuryLevel, setInjuryLevel] = useState(1);
  const [otherRegion, setOtherRegion] = useState('');
  const [injuryDescription, setInjuryDescription] = useState('');
  const [workoutDetailSections, setWorkoutDetailSections] = useState(() => initialValues?.workoutDetailSections || createWorkoutDetailSections(session));
  const [trainingDetailsEnabled, setTrainingDetailsEnabled] = useState(() => Boolean(initialValues?.trainingDetailsEnabled || initialValues?.workoutDetailSections?.length));
  const [completionStatus, setCompletionStatus] = useState(() => initialValues?.completionStatus || 'completed');
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
  const hasOptionalWorkoutDetails = hasWorkoutDetailOption(session);
  const isRaceOrTest = /competici[oó]n|test/i.test(session.type);
  const showWorkoutData = completionStatus !== 'missed';
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
        const workoutNotDone = completionStatus === 'missed';
        onSave({
          ...values,
          ...(workoutNotDone ? { distance: '', minutes: '', trimps: '', pace: '', averageHr: '', description: '' } : {}),
          injuries: savedInjuries,
          completionStatus,
          trainingDetailsEnabled: workoutNotDone ? false : trainingDetailsEnabled,
          workoutDetailSections: workoutNotDone || !trainingDetailsEnabled ? [] : workoutDetailSections,
          trimps: workoutNotDone ? '' : calculateTrimps(values.minutes, values.averageHr, values.restingHr),
        });
      }}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="eyebrow">DIARIO DE ENTRENAMIENTO · {session.day.toUpperCase()} {session.dateLabel || `${session.date} OCT`}</div>
        <h2>{session.type}</h2>
        <p className="muted">Registra la actividad y tus valores personales de hoy.</p>

        {!isRestDay && <fieldset className="journal-fieldset workout-completion-fieldset">
          <legend>¿Has realizado el entrenamiento?</legend>
          <div className="workout-completion-options">
            {[
              ['completed', 'Completado', '✓'],
              ['partial', 'A medias', '◐'],
              ['missed', 'No realizado', '×'],
            ].map(([status, label, icon]) => <label className={`workout-completion-option ${status} ${completionStatus === status ? 'selected' : ''}`} key={status}>
              <input type="radio" name="workout-completion" value={status} checked={completionStatus === status} onChange={() => setCompletionStatus(status)} />
              <span className="workout-completion-icon" aria-hidden="true">{icon}</span><b>{label}</b>
            </label>)}
          </div>
        </fieldset>}

        {!isRestDay && showWorkoutData && <div className="journal-strava-connect">
          <div><b>Strava</b><small>{stravaConnected ? 'Actividad de ejemplo importada' : 'Prototipo · importa una actividad de ejemplo'}</small></div>
          <button className="button strava-brand-button" type="button" onClick={importStravaDemo}>{stravaConnected ? 'Actualizar actividad' : 'Conectar con Strava'}</button>
        </div>}

        {hasOptionalWorkoutDetails && showWorkoutData && <fieldset className="journal-fieldset workout-detail-fieldset">
          <legend>Detalle del entrenamiento</legend>
          {isRaceOrTest && <p className="workout-detail-note">La sección de entrenamiento detallado está destinada a la carrera exclusivamente, mientras que los valores de distancia y sensaciones normales están destinados al día en conjunto, calentamiento, carrera (o test) y enfriamiento.</p>}
          <label className="workout-detail-toggle">
            <input type="checkbox" checked={trainingDetailsEnabled} onChange={(event) => {
              const enabled = event.target.checked;
              setTrainingDetailsEnabled(enabled);
            }} />
            <span>Registrar series o bloques en detalle</span>
            <b>{trainingDetailsEnabled ? 'Activado' : 'Desactivado'}</b>
          </label>
          {trainingDetailsEnabled && <div className="workout-detail-list">
            <p className="wellbeing-help">Rellena los campos de cada parte planificada del entrenamiento.</p>
            {workoutDetailSections.map((section) => <div className="workout-detail-section" key={section.id}>
              <h3>{section.title}</h3>
              {section.rows.map((item, index) => <WorkoutDetailRow
                key={item.id}
                item={item}
                index={index}
                fields={section.fields}
                allowHundredths={section.allowHundredths}
                showCompletion={completionStatus === 'partial'}
                onChange={(key, value) => setWorkoutDetailSections((current) => current.map((currentSection) => currentSection.id !== section.id ? currentSection : {
                  ...currentSection,
                  rows: currentSection.rows.map((entry) => entry.id === item.id ? { ...entry, [key]: value } : entry),
                }))}
              />)}
            </div>)}
          </div>}
        </fieldset>}

        {!isRestDay && showWorkoutData && supportsIntervals && (
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

        {!isRestDay && showWorkoutData && <fieldset className="journal-fieldset">
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

        {!hidePersonalFields && <fieldset className="journal-fieldset">
          <legend>Salud</legend>
          <div className="journal-input-grid">
            <NumberField label="FC en reposo" unit="ppm" value={values.restingHr} onChange={(value) => update('restingHr', value)} />
            <NumberField label="HRV" unit="ms" value={values.hrv} onChange={(value) => update('hrv', value)} />
          </div>
        </fieldset>}

        {!hidePersonalFields && <fieldset className="journal-fieldset wellbeing-fieldset">
          <legend>Bienestar personal</legend>
          <p className="wellbeing-help">Selecciona un valor para cada indicador. 1 es verde y 10 es rojo.</p>
          <div className="wellbeing-ranges">
            {wellbeingFields.map(([key, label]) => (
              <RangeField key={key} label={label} value={values[key]} onChange={(value) => update(key, value)} />
            ))}
          </div>
        </fieldset>}

        {!hidePersonalFields && <fieldset className="journal-fieldset injury-fieldset">
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
        </fieldset>}

        <label className="field-label">Notas del día<textarea rows="2" value={values.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Sensaciones, contexto o comentarios" /></label>
        <div className="inline-actions">
          <button className="button secondary" type="button" onClick={onClose}>Cancelar</button>
          <button className="button primary" type="submit">Guardar registro</button>
        </div>
      </form>
    </div>
  );
}

function WorkoutDetailRow({ item, index, fields, allowHundredths = false, showCompletion = false, onChange }) {
  const shortDistance = allowHundredths && isSubKilometerSeries(item.label);
  const invalidTime = Boolean(item.time) && !isValidDuration(item.time, shortDistance);
  const invalidPace = Boolean(item.pace) && !/^\d{1,2}:[0-5]\d(?:[.,]\d{1,2})?$/.test(item.pace.trim());
  const invalidWeight = Boolean(item.weight) && !/^\d+(?:[.,]\d+)?%?$/.test(item.weight.trim());
  const timePattern = shortDistance
    ? '(?:[0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9](?:[.,][0-9]{1,2})?'
    : '(?:[0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]';

  return <div className={`workout-detail-row ${showCompletion && item.performed ? 'performed' : ''}`}>
    <div className="workout-detail-row-heading"><b>{item.label || `Bloque ${index + 1}`}</b><span className="workout-detail-row-status">{item.plannedSled && <small>Arrastre planificado</small>}{showCompletion && <label><input type="checkbox" checked={Boolean(item.performed)} onChange={(event) => onChange('performed', event.target.checked)} />Hecho</label>}</span></div>
    <div className={`workout-detail-fields ${fields.includes('sets') ? 'gym-detail-fields' : ''}`}>
      {fields.map((field) => {
        if (field === 'withSled') return <label className="workout-detail-check" key={field}><input type="checkbox" checked={Boolean(item.withSled)} onChange={(event) => onChange(field, event.target.checked)} />¿Usaste arrastre?</label>;
        if (field === 'comment') return <label className={`field-label workout-detail-comment ${fields.includes('sets') ? 'wide-detail-field' : ''}`} key={field}>Sensaciones / RPE / pulsaciones<textarea rows="2" value={item.comment} onChange={(event) => onChange(field, event.target.value)} placeholder="Sensaciones, RPE, pulsaciones u otros detalles" /></label>;
        if (field === 'time') return <div className="workout-detail-time-field" key={field}>
          <label className="field-label">Tiempo <small className="journal-unit">{shortDistance ? 'mm:ss,cc' : 'mm:ss'}</small><input type="text" pattern={timePattern} title={shortDistance ? 'Usa mm:ss o mm:ss,cc; por ejemplo 1:32,45' : 'Introduce un tiempo con formato mm:ss o hh:mm:ss, por ejemplo 1:32'} aria-invalid={invalidTime} value={item.time} onChange={(event) => onChange(field, event.target.value)} placeholder={shortDistance ? 'Ej. 1:32,45' : 'Ej. 12:05'} /></label>
          {invalidTime && <div className="workout-detail-time-error" role="alert"><span aria-hidden="true">!</span><small>Formato: {shortDistance ? '1:32,45' : '12:05'}</small></div>}
        </div>;
        if (field === 'pace') return <label className="field-label" key={field}>Ritmo <small className="journal-unit">min/km</small><input type="text" inputMode="decimal" pattern="[0-9]{1,2}:[0-5][0-9](?:[.,][0-9]{1,2})?" title="Usa min/km, por ejemplo 4:35" aria-invalid={invalidPace} value={item.pace} onChange={(event) => onChange(field, event.target.value)} placeholder="Ej. 4:35" />{invalidPace && <small className="workout-detail-field-error">Formato de ritmo: min:seg/km</small>}</label>;
        if (field === 'sets' || field === 'reps') return <label className="field-label" key={field}>{field === 'sets' ? 'Series' : 'Repeticiones'}<input type="number" min="0" step="1" value={item[field]} onChange={(event) => onChange(field, event.target.value)} placeholder="—" /></label>;
        if (field === 'weight') return <label className="field-label" key={field}>Peso <small className="journal-unit">kg / %</small><input type="text" pattern="[0-9]+([.,][0-9]+)?%?" title="Introduce un número o un porcentaje, por ejemplo 40 o 80%" aria-invalid={invalidWeight} value={item.weight} onChange={(event) => onChange(field, event.target.value)} placeholder="Ej. 40 o 80%" />{invalidWeight && <small className="workout-detail-field-error">Usa un número o un número seguido de %</small>}</label>;
        return null;
      })}
    </div>
  </div>;
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

function hasWorkoutDetailOption(session) {
  const type = session.type.trim().toLocaleLowerCase('es-ES');
  if (/descanso|acondicionamiento físico/.test(type) || /^rodaje$/.test(type)) return false;
  if (/long run|tirada larga/.test(type)) return Number(session.details?.changes) > 0;
  return true;
}

function createWorkoutDetailSections(session) {
  const type = session.type.trim().toLocaleLowerCase('es-ES');
  const details = session.details || {};
  if (!hasWorkoutDetailOption(session)) return [];

  if (/long run|tirada larga/.test(type)) {
    return [makeDetailSection('cambios', 'Cambios de ritmo', ['pace', 'comment'], Array.from({ length: Number(details.changes) || 0 }, (_, index) => `Cambio ${index + 1}`))];
  }

  if (/gimnasio|\bgym\b/.test(type)) {
    const sections = [];
    const before = details.beforeGym;
    const after = details.afterGym;
    if (before) sections.push(...createRunningDetailSections(before, session, 'Trabajo antes del gimnasio', false));
    const exercises = details.exercises?.length ? details.exercises : [{ name: 'Ejercicio 1' }];
    const exerciseLabels = exercises.map((exercise) => {
      const name = exercise.name === 'Personalizado' ? details.customExercise || exercise.name : exercise.name;
      return `${name || 'Ejercicio'}${exercise.sets ? ` · Plan: ${exercise.sets}` : ''}`;
    });
    if (details.customExercise && !exerciseLabels.some((label) => label.startsWith(details.customExercise))) exerciseLabels.push(details.customExercise);
    sections.push(makeDetailSection('gimnasio', 'Gimnasio', ['sets', 'reps', 'weight', 'comment'], exerciseLabels));
    if (after) sections.push(...createRunningDetailSections(after, session, 'Trabajo después del gimnasio', false));
    if (!before && !after && /rodaje/.test(type)) sections.push(makeDetailSection('gym-running', 'Rodaje', ['pace', 'comment'], ['Rodaje']));
    return sections;
  }

  if (/series largas|series cortas|^series$/.test(type)) {
    const rows = plannedWorkoutRows(session, 'Serie', 'm');
    const isShort = /series cortas/.test(type) || (/^series$/.test(type) && rows.every((row) => isSubKilometerSeries(typeof row === 'string' ? row : row.label)));
    return [makeDetailSection('series', 'Series', ['time', 'comment', ...(isShort ? ['withSled'] : [])], rows, { allowHundredths: isShort })];
  }

  if (/cambios/.test(type)) {
    return [makeDetailSection('cambios', 'Cambios de ritmo', ['pace', 'comment'], plannedWorkoutRows(session, 'Cambio'))];
  }

  if (/cuestas/.test(type)) {
    const hillGroups = (details.groups || []).filter((group) => !/umbral|serie/i.test(`${group.guide || ''} ${group.target || ''} ${group.comment || ''}`));
    const hillPlan = { ...session, details: { ...details, groups: hillGroups } };
    const sections = [makeDetailSection('cuestas', 'Cuestas', ['pace', 'comment'], plannedWorkoutRows(hillPlan, 'Cuesta'))];
    const description = `${session.type} ${session.desc || ''} ${session.blocks || ''} ${(details.groups || []).map((group) => `${group.guide || ''} ${group.target || ''} ${group.comment || ''}`).join(' ')}`;
    if (/umbral/i.test(description)) sections.push(makeDetailSection('umbral', 'Bloque de umbral', ['pace', 'comment'], plannedRowsForOptionalBlock(session, 'Umbral', 'umbral')));
    if (/series/i.test(description)) {
      const shortSeries = /series cortas/i.test(description);
      sections.push(makeDetailSection('series', 'Series', ['time', 'comment', ...(shortSeries ? ['withSled'] : [])], plannedRowsForOptionalBlock(session, 'Serie', 'serie', 'm'), { allowHundredths: true }));
    }
    return sections;
  }

  if (/competici[oó]n/.test(type)) {
    const sections = [makeDetailSection('competicion', 'Competición', ['time', 'comment'], ['Resultado de carrera'])];
    if (Number(details.preRaceReps) > 0) sections.push(makeDetailSection('pre-race', 'Series previas', ['time', 'comment'], Array.from({ length: Math.min(10, Number(details.preRaceReps)) }, (_, index) => `Serie previa ${index + 1}`)));
    if (Number(details.thresholdReps) > 0) sections.push(makeDetailSection('pre-threshold', 'Bloques de umbral', ['time', 'comment'], Array.from({ length: Math.min(5, Number(details.thresholdReps)) }, (_, index) => `Umbral ${index + 1}`)));
    return sections;
  }

  if (/test/.test(type)) return [makeDetailSection('test', 'Resultado del test', ['time', 'comment'], [details.testExplanation || 'Test'])];
  if (/umbral/.test(type)) return [makeDetailSection('umbral', 'Umbral', ['pace', 'comment'], plannedWorkoutRows(session, 'Bloque'))];
  return [makeDetailSection('bloques', 'Bloques del entrenamiento', ['time', 'comment'], plannedWorkoutRows(session, 'Bloque'))];
}

function createRunningDetailSections(workoutType, session, title, useGroups = true) {
  const type = workoutType.toLocaleLowerCase('es-ES');
  const isSeries = /series/.test(type);
  const rows = useGroups ? plannedWorkoutRows({ ...session, type: workoutType }, title, isSeries ? 'm' : '') : [title];
  const isShort = /cortas/.test(type) || (isSeries && rows.every((row) => isSubKilometerSeries(typeof row === 'string' ? row : row.label)));
  const fields = isSeries ? ['time', 'comment', ...(isShort ? ['withSled'] : [])] : ['pace', 'comment'];
  return [makeDetailSection(`gym-${title}`, title, fields, rows, { allowHundredths: isShort })];
}

function plannedWorkoutRows(session, rowName, defaultUnit = '') {
  const groups = (session.details?.groups || []).filter((group) => Number(group.repetitions) > 0);
  if (groups.length) {
    let rowNumber = 0;
    return groups.flatMap((group) => Array.from({ length: Math.min(50, Number(group.repetitions)) }, () => {
      rowNumber += 1;
      const interval = group.interval ? ` · ${group.interval}${defaultUnit && /^\d+(?:[.,]\d+)?$/.test(String(group.interval)) ? ` ${defaultUnit}` : ''}` : '';
      return { label: `${rowName} ${rowNumber}${interval}`, plannedSled: Boolean(group.withSled) };
    }));
  }

  const matches = [...`${session.type} ${session.desc || ''}`.matchAll(/(\d+)\s*[×x]\s*(\d+(?:[.,]\d+)?)\s*(km|m|min|s|′|″)?/gi)];
  let rowNumber = 0;
  const rows = matches.flatMap((match) => Array.from({ length: Math.min(50, Number(match[1])) }, () => {
    rowNumber += 1;
    const interval = `${match[2].replace(',', '.')}${match[3] ? ` ${match[3]}` : defaultUnit ? ` ${defaultUnit}` : ''}`;
    return { label: `${rowName} ${rowNumber} · ${interval}`, plannedSled: false };
  }));
  return rows.length ? rows : [rowName];
}

function plannedRowsForOptionalBlock(session, rowName, keyword, defaultUnit = '') {
  const matchingGroups = (session.details?.groups || []).filter((group) => `${group.guide || ''} ${group.target || ''} ${group.comment || ''}`.toLocaleLowerCase('es-ES').includes(keyword));
  const descriptionParts = `${session.desc || ''} · ${session.blocks || ''}`.split(/[·\n;]/).filter((part) => part.toLocaleLowerCase('es-ES').includes(keyword));
  const source = matchingGroups.length
    ? { ...session, details: { ...session.details, groups: matchingGroups } }
    : { ...session, type: rowName, desc: descriptionParts.join(' · ') || rowName, details: { ...session.details, groups: [] } };
  return plannedWorkoutRows(source, rowName, defaultUnit);
}

function makeDetailSection(id, title, fields, rowLabels, options = {}) {
  return {
    id,
    title,
    fields,
    allowHundredths: Boolean(options.allowHundredths),
    rows: rowLabels.map((row, index) => {
      const item = typeof row === 'string' ? { label: row } : row;
      return { id: createDetailId(), ...item, time: '', pace: '', comment: '', sets: '', reps: '', weight: '', withSled: false, performed: false };
    }),
  };
}

function createDetailId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidDuration(value, allowHundredths = false) {
  const decimalPart = allowHundredths ? '(?:[.,]\\d{1,2})?' : '';
  return new RegExp(`^(?:\\d{1,2}:)?[0-5]?\\d:[0-5]\\d${decimalPart}$`).test(value.trim());
}

function isSubKilometerSeries(label) {
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*(m|km)\b/i);
  if (!match) return false;
  const distance = Number(match[1].replace(',', '.')) * (match[2].toLowerCase() === 'km' ? 1000 : 1);
  return distance < 1000;
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
