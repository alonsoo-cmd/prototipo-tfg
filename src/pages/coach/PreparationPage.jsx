import { useMemo, useState } from 'react';
import { coachAthletes, gymExercises, workoutTypes } from '../../data/coachAthletes.js';
import { athleteDirectory } from '../../data/athleteDirectory.js';
import DatePicker from '../../components/ui/DatePicker.jsx';
import WorkoutStatus from '../../components/ui/WorkoutStatus.jsx';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const phaseOptions = ['BI · Base', 'BII · Acumulación', 'BII · Transformación', 'BIII · Realización', 'Competición', 'Descarga'];
const effortZones = ['Suave · hasta LT1', 'Umbral · LT1–LT2', 'Fuerte · sobre LT2'];
const conditioningTypes = ['Core', 'Ejercicios para lesión', 'Pliometría', 'Técnica de carrera y movilidad'];
const shoeTypes = ['Rodadoras', 'Voladoras', 'Clavos'];

function blankWeek(number) {
  const firstDate = new Date(Date.UTC(2026, 9, 21 + (number - 8) * 7));
  return {
    number,
    phase: 'BII · Acumulación',
    days: daysOfWeek.map((day, index) => {
      const date = new Date(firstDate);
      date.setUTCDate(firstDate.getUTCDate() + index);
      return {
      day, date: date.getUTCDate(), month: new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' }).format(date).replace('.', ''), type: '', tone: 'rest', desc: '', mins: 0, km: 0,
      tr: '0', state: 'Planificado', time: '—', blocks: '', wt: [38, 35, 41, 36, 42, 39, 40][index],
      zones: [0, 0, 0], warmup: '', cooldown: '', details: {},
      };
    }),
  };
}

function copyWeeks(weeks = []) {
  return weeks.map((week) => ({ ...week, days: week.days.map((day) => ({ ...day })) }));
}

export default function PreparationPage({ weeks, setWeeks, preparations = [], setPreparations = () => {}, trainingLogs = {}, onProfile }) {
  const [athlete, setAthlete] = useState(coachAthletes[0]);
  const [athleteList, setAthleteList] = useState(coachAthletes);
  const [otherPlans, setOtherPlans] = useState(() => Object.fromEntries(coachAthletes.filter((item) => item.id !== 'lucia').map((item) => [item.id, copyWeeks(weeks)])));
  const [selectedWeek, setSelectedWeek] = useState(8);
  const [editingDay, setEditingDay] = useState(null);
  const [showAllDays, setShowAllDays] = useState(false);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [notice, setNotice] = useState('');
  const [startingAthlete, setStartingAthlete] = useState(null);

  const planWeeks = athlete.id === 'lucia' ? weeks : otherPlans[athlete.id] || copyWeeks(weeks);
  const current = planWeeks.find((week) => week.number === selectedWeek) || planWeeks.at(-1) || blankWeek(1);
  const setPlanWeeks = (updater) => {
    if (athlete.id === 'lucia') setWeeks(updater);
    else setOtherPlans((all) => ({ ...all, [athlete.id]: updater(all[athlete.id] || copyWeeks(weeks)) }));
  };
  const totals = useMemo(() => sumDays(current.days), [current.days]);
  const practicalDays = current.days.map((day) => ({ ...day, log: trainingLogs[`${current.number}-${day.day}`] })).filter((day) => day.log);
  const athletePreparation = preparations.find((item) => item.athleteId === athlete.id) || null;
  const athleteObjectives = athletePreparation?.objectives || [];
  const assignedAthleteIds = new Set(athleteList.map((item) => item.id));
  const availableAthletes = athleteDirectory.filter((item) => !assignedAthleteIds.has(item.id)
    && !item.currentCoachId
    && !item.activePreparation
    && !preparations.some((preparation) => preparation.athleteId === item.id));
  const createWeek = () => {
    const duration = Number.parseInt(athlete.duration, 10) || 12;
    if (planWeeks.length >= duration) return;
    const number = Math.max(0, ...planWeeks.map((week) => week.number)) + 1;
    const newWeek = blankWeek(number);
    setPlanWeeks((all) => [...all, newWeek]);
    setSelectedWeek(number);
    setNotice(`Semana ${number} creada en blanco.`);
  };
  const saveDay = (updatedDay) => {
    setPlanWeeks((all) => all.map((week) => week.number !== current.number ? week : {
      ...week,
      days: week.days.map((day) => day.day === updatedDay.day ? updatedDay : day),
    }));
    setEditingDay(null);
    setNotice(`${updatedDay.day}: entrenamiento guardado.`);
  };
  const chooseAthlete = (next) => {
    setAthlete(next);
    setSelectedWeek(8);
    setNotice('');
  };
  const startPreparation = ({ athlete: candidate, preparationName, duration, objectiveName, distance, eventDate, noSpecificGoal }) => {
    const stillAvailable = !athleteList.some((item) => item.id === candidate.id)
      && !candidate.currentCoachId
      && !candidate.activePreparation
      && !preparations.some((preparation) => preparation.athleteId === candidate.id);
    if (!stillAvailable) {
      setNotice('Este atleta ya está asignado o tiene una preparación activa. Elige otro atleta.');
      setStartingAthlete(null);
      return;
    }
    const newAthlete = { ...candidate, eventDate: noSpecificGoal ? '' : eventDate || '', distance: noSpecificGoal ? 'Sin objetivo específico' : distance, duration };
    const preparation = {
      id: Date.now(), athleteId: candidate.id, athleteName: candidate.name,
      name: noSpecificGoal ? 'Entrenamiento para estar en forma' : preparationName, duration, coach: 'Alex Martín',
      objectives: noSpecificGoal ? [] : [{ id: Date.now() + 1, name: objectiveName, distance, eventDate }],
    };
    setPreparations((all) => [...all, preparation]);
    setAthleteList((all) => [...all, newAthlete]);
    setOtherPlans((all) => ({ ...all, [candidate.id]: copyWeeks(weeks) }));
    setAthlete(newAthlete);
    setSelectedWeek(8);
    setStartingAthlete(null);
    setNotice(`Preparación de ${candidate.name} iniciada.`);
  };

  return <div className="content coach-preparation-page">
    <div className="page-heading">
      <div><div className="eyebrow">ENTRENADOR · PREPARACIONES</div><h1>Preparaciones</h1><p>Una persona solo puede tener una preparación activa. Para iniciar otra, elige un atleta sin preparación.</p></div>
      <button className="button secondary" onClick={() => document.getElementById('available-athletes')?.scrollIntoView({ behavior: 'smooth' })}>＋ Buscar atletas</button>
    </div>

    <section className="panel coach-athlete-picker">
      <div className="panel-title"><div><h2>Atletas y preparación propia</h2><p>{Math.min(athleteList.filter((item) => !item.isCoach).length, 30)} de 30 plazas para atletas</p></div></div>
      <div className="coach-athlete-strip">{athleteList.map((item) => <button key={item.id} className={`coach-athlete-chip ${athlete.id === item.id ? 'selected' : ''}`} onClick={() => chooseAthlete(item)}>
        <span className="mini-avatar">{item.initials}</span><span><b>{item.isCoach ? 'Mi preparación' : item.name}</b><small>{item.isCoach ? `${item.name} · entrenador` : item.goal} · {item.isCoach ? 'Preparación propia' : preparations.some((preparation) => preparation.athleteId === item.id) ? 'Con preparación activa' : 'A tu cargo'}</small></span>
      </button>)}</div>
    </section>

    <div className="active-prep-card">
      <div className="active-prep-icon">↗</div><div className="active-prep-info"><div className="eyebrow">PREPARACIÓN ACTIVA · {planWeeks.length} SEMANAS · {athleteObjectives.length} OBJETIVOS</div><h2>{athletePreparation?.name || athlete.goal.split(' · ')[1] || athlete.goal}</h2><p>{athlete.name} · {athletePreparation?.duration || athlete.duration} · {athleteObjectives.map((item) => item.name).join(' · ') || 'Sin objetivos asociados'}</p></div>
      <button className="button secondary" onClick={onProfile}>Perfil ↗</button>
    </div>

    <section className="panel coach-practical-section">
      <div className="schedule-heading"><div><div className="eyebrow">PREPARACIÓN PRÁCTICA</div><h2>Registros de la semana <span className="subtle-dates">{dateRange(practicalDays)}</span></h2><p>Solo aparecen los datos que el atleta ha registrado.</p></div><button className="text-button" onClick={() => setShowAllDays(true)}>Ver todos los entrenamientos →</button></div>
      {practicalDays.length ? <div className="practical-log-list">{practicalDays.map((day) => <article className="practical-log-entry" key={day.day}>
        <header className="practical-log-header"><div><b>{day.day}</b><span>{dayDate(day)}</span></div><small>Registro del atleta</small></header>
        <div className="practical-log-activity">
          <LogValue label="Distancia" value={day.log.distance} unit="km" />
          <LogValue label="Duración" value={day.log.minutes} unit="min" />
          <LogValue label="TRIMPS" value={day.log.trimps} />
          <LogValue label="Ritmo medio" value={day.log.pace || calculatePace(day.log.minutes, day.log.distance)} unit="min/km" />
          <LogValue label="FC media" value={day.log.averageHr} unit="ppm" />
        </div>
        <div className="practical-log-wellbeing"><b>Bienestar · escala 1–10</b><div>
          <LogValue label="Fatiga" value={day.log.fatigue} />
          <LogValue label="Humor" value={day.log.mood} />
          <LogValue label="Agujetas" value={day.log.soreness} />
          <LogValue label="Sueño" value={day.log.sleep} />
          <LogValue label="Estrés" value={day.log.stress} />
        </div></div>
        {day.log.injuries?.length > 0 && <div className="practical-log-injuries"><b>Molestias registradas</b>{day.log.injuries.map((injury) => <p key={injury.region}><strong>{injury.regionLabel || injury.region.replaceAll('-', ' ')} · {injury.level}/10</strong>{injury.description && <span>{injury.description}</span>}</p>)}</div>}
        {day.log.notes && <p className="practical-log-notes"><b>Notas</b>{day.log.notes}</p>}
      </article>)}</div> : <p className="practical-empty-state">El atleta todavía no ha registrado entrenamientos esta semana.</p>}
    </section>

    <section className="panel schedule-editor coach-theory-section">
      <div className="schedule-heading"><div><div className="eyebrow">PREPARACIÓN TEÓRICA</div><h2>Plan semanal</h2><p>{athlete.duration} · {athlete.distance} · {planWeeks.length} semanas planificadas</p></div><div className="schedule-actions"><button className="button secondary" onClick={() => setShowAllWeeks(true)}>Semana {current.number} · ver todas ↗</button><button className="button primary" onClick={createWeek} disabled={planWeeks.length >= (Number.parseInt(athlete.duration, 10) || 12)}>＋ Nueva semana</button></div></div>
      <div className="week-tabs">{planWeeks.map((week) => <button key={week.number} className={selectedWeek === week.number ? 'selected' : ''} onClick={() => setSelectedWeek(week.number)}><small>SEM</small>{String(week.number).padStart(2, '0')}</button>)}</div>
      <div className="selected-week-heading"><div><div className="eyebrow">SEMANA {current.number} · {current.phase.toUpperCase()}</div><h3>Semana {current.number} · planificación</h3></div><div className="phase-select"><label>Tipo de semana<select value={current.phase} onChange={(event) => setPlanWeeks((all) => all.map((week) => week.number === current.number ? { ...week, phase: event.target.value } : week))}>{phaseOptions.map((phase) => <option key={phase}>{phase}</option>)}</select></label></div></div>
      <div className="coach-week-grid">{current.days.map((day) => <button key={day.day} className={`coach-workout-card ${day.type ? '' : 'empty'}`} onClick={() => setEditingDay({ day, mode: 'edit' })}>
        <span className="coach-workout-day">{day.day}<small>{dayDate(day)}</small></span><b>{day.type || '+ Añadir entrenamiento'}</b><span className="coach-workout-description">{day.desc || day.blocks || (day.type ? 'Sin descripción' : 'Día en blanco')}</span>{day.shoes && <span className="coach-workout-description">👟 {day.shoes}</span>}<span className="coach-workout-metrics">{day.mins || 0} min · {format(day.km)} km · {day.tr || 0} TR</span><WorkoutStatus status={trainingLogs[`${current.number}-${day.day}`]?.completionStatus || (trainingLogs[`${current.number}-${day.day}`] ? 'completed' : null)} className="coach-workout-status" />
      </button>)}</div>
      <div className="coach-total-strip weekly-totals"><Stat label={`Km · semana ${current.number}`} value={`${format(totals.km)} km`} /><Stat label="Minutos" value={`${totals.mins} min`} /><Stat label="TRIMPS" value={totals.tr} /><button className="text-button" onClick={() => setShowAllWeeks(true)}>Ver desglose BX · BI · BII →</button></div>
    </section>

    <section className="panel new-week-section"><div><div className="eyebrow">PLANIFICACIÓN</div><h2>Nueva semana</h2><p>La semana {planWeeks.length + 1} se abrirá con los siete días en blanco para planificar desde cero.</p></div><button className="button primary" onClick={createWeek} disabled={planWeeks.length >= (Number.parseInt(athlete.duration, 10) || 12)}>＋ Crear semana {planWeeks.length + 1}</button></section>
    <section className="panel available-athletes-panel" id="available-athletes">
      <div className="panel-title"><div><h2>Atletas disponibles</h2><p>Solo aparecen atletas que no están asignados a otro entrenador y no tienen una preparación activa.</p></div><span className="count-badge">{availableAthletes.length}</span></div>
      {availableAthletes.length ? <div className="available-athlete-list">{availableAthletes.map((candidate) => <article className="available-athlete-row" key={candidate.id}>
        <span className="mini-avatar">{candidate.initials}</span>
        <span className="available-athlete-info"><b>{candidate.name}</b><small>{candidate.goal} · Sin entrenador ni preparación activa</small></span>
        <button className="button primary" type="button" onClick={() => setStartingAthlete(candidate)}>Iniciar preparación</button>
      </article>)}</div> : <p className="practical-empty-state">No hay atletas disponibles que cumplan estos requisitos.</p>}
    </section>
    {notice && <p className="coach-save-notice" role="status">{notice}</p>}

    {editingDay && <WorkoutEditor key={`${athlete.id}-${current.number}-${editingDay.day.day}-${editingDay.mode}`} day={editingDay.day} mode={editingDay.mode} onClose={() => setEditingDay(null)} onSave={saveDay} />}
    {startingAthlete && <NewPreparationModal athlete={startingAthlete} onClose={() => setStartingAthlete(null)} onCreate={startPreparation} />}
    {showAllDays && <OverviewModal title={`Todos los entrenamientos · ${athlete.name}`} onClose={() => setShowAllDays(false)}>
      {planWeeks.flatMap((week) => week.days.map((day) => ({ ...day, week: week.number, log: trainingLogs[`${week.number}-${day.day}`] }))).filter((day) => day.log).map((day) => <div className="overview-row" key={`${day.week}-${day.day}`}><b>{formatWorkoutDate(day.week, day.day)} · Registro del atleta</b><span>{day.log.distance || '—'} km · {day.log.minutes || '—'} min · {day.log.trimps || '—'} TR · Ritmo {day.log.pace || calculatePace(day.log.minutes, day.log.distance) || '—'} min/km</span><span>Fatiga {day.log.fatigue || '—'} · Humor {day.log.mood || '—'} · Agujetas {day.log.soreness || '—'} · Sueño {day.log.sleep || '—'} · Estrés {day.log.stress || '—'}</span></div>)}
      {!planWeeks.some((week) => week.days.some((day) => trainingLogs[`${week.number}-${day.day}`])) && <p className="practical-empty-state">El atleta todavía no ha registrado entrenamientos.</p>}
    </OverviewModal>}
    {showAllWeeks && <OverviewModal title={`Semanas · ${athlete.name}`} onClose={() => setShowAllWeeks(false)}>{planWeeks.map((week) => { const sum = sumDays(week.days); return <button className="overview-row" key={week.number} onClick={() => { setSelectedWeek(week.number); setShowAllWeeks(false); }}><b>Semana {week.number} · {week.phase}</b><span>{format(sum.km)} km · {sum.mins} min · {sum.tr} TRIMPS</span><span>{week.days.filter((day) => day.type).length} entrenamientos</span></button>; })}</OverviewModal>}
  </div>;
}

function NewPreparationModal({ athlete, onClose, onCreate }) {
  const [eventDate, setEventDate] = useState('');
  const [noSpecificGoal, setNoSpecificGoal] = useState(false);
  const [preparationName, setPreparationName] = useState('');
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="modal wide-modal new-preparation-modal" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      onCreate({ athlete, preparationName: data.get('preparationName'), duration: data.get('duration'), objectiveName: data.get('objectiveName'), distance: data.get('distance'), eventDate, noSpecificGoal: data.has('noSpecificGoal') });
    }}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
      <div className="eyebrow">NUEVA PREPARACIÓN</div><h2>{athlete.name}</h2>
      <p className="muted">Este atleta está disponible: no tiene entrenador ni otra preparación activa.</p>
      <div className="workout-editor-grid">
        <label className="field-label">Nombre de preparación<input name="preparationName" required={!noSpecificGoal} disabled={noSpecificGoal} value={noSpecificGoal ? 'Entrenamiento para estar en forma' : preparationName} onChange={(event) => setPreparationName(event.target.value)} placeholder="Ej. Plan de otoño" /></label>
        <label className="field-label">Duración<select name="duration" defaultValue={athlete.duration}><option>8 semanas</option><option>10 semanas</option><option>12 semanas</option><option>16 semanas</option></select></label>
      </div>
      <label className="no-specific-goal-toggle"><input type="checkbox" name="noSpecificGoal" checked={noSpecificGoal} onChange={(event) => setNoSpecificGoal(event.target.checked)} /><span><b>Sin objetivo específico</b><small>Preparación general para entrenar y estar en forma.</small></span></label>
      <fieldset className="workout-editor-grid preparation-goal-fields" disabled={noSpecificGoal}>
        <label className="field-label">Objetivo<input name="objectiveName" required={!noSpecificGoal} placeholder="Ej. Media Maratón Madrid" /></label>
        <label className="field-label">Distancia objetivo<select name="distance" defaultValue={athlete.distance}><option>400 m</option><option>800 m</option><option>1.500 m</option><option>3.000 m</option><option>5 km</option><option>10 km</option><option>Media maratón</option><option>Maratón</option></select></label>
        <label className="field-label">Fecha objetivo<DatePicker name="eventDate" value={eventDate} onChange={setEventDate} allowClear placeholder="Opcional" ariaLabel="Elegir fecha objetivo" /></label>
      </fieldset>
      {noSpecificGoal && <p className="no-specific-goal-note">La preparación se creará para estar en forma y no tendrá objetivos ni pruebas asociadas.</p>}
      <div className="inline-actions"><button className="button secondary" type="button" onClick={onClose}>Cancelar</button><button className="button primary" type="submit">Iniciar preparación</button></div>
    </form>
  </div>;
}

function WorkoutEditor({ day, mode, onClose, onSave }) {
  const [values, setValues] = useState(() => ({ ...day, details: day.details || {}, zones: day.zones || [0, 0, 0] }));
  const [exerciseRows, setExerciseRows] = useState(values.details.exercises || []);
  const [conditioningBlocks, setConditioningBlocks] = useState(values.details.conditioningBlocks || [{ type: 'Core', exercises: '', volume: '', comment: '' }]);
  const [workoutGroups, setWorkoutGroups] = useState(() => (values.details.groups || [{ repetitions: '', interval: '', guide: 'Sin objetivo', target: '', recovery: '', comment: '', withSled: false }]).map((group) => ({ recovery: '', ...group })));
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const updateDetail = (key, value) => setValues((current) => ({ ...current, details: { ...current.details, [key]: value } }));
  const type = values.type || '';
  const intervalType = ['Cambios', 'Cuestas', 'Series largas', 'Series cortas'].includes(type);
  const intervalLimit = type === 'Cambios' ? 25 : type === 'Cuestas' ? 30 : 50;

  const submit = (event) => {
    event.preventDefault();
    const blockSummary = conditioningBlocks.map((block) => `${block.type}${block.exercises ? `: ${block.exercises}` : ''}${block.volume ? ` (${block.volume})` : ''}`).join(' · ');
    const description = values.desc || (type === 'Acondicionamiento físico' ? blockSummary : '');
    const details = { ...values.details, exercises: exerciseRows, groups: workoutGroups, conditioningBlocks };
    if (type === 'Descanso' || type === 'Acondicionamiento físico') {
      delete details.rpeMin; delete details.rpeMax; delete details.paceFrom; delete details.paceTo; delete details.hrMin; delete details.hrMax;
    }
    onSave({ ...values, desc: description, blocks: description, details, tone: type === 'Descanso' ? 'rest' : 'blue', tr: values.tr || '0' });
  };

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal wide-modal workout-editor-modal" onSubmit={submit}>
    <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button><div className="eyebrow">{isReadOnly ? 'ENTRENAMIENTO · DETALLE' : 'PLANIFICACIÓN TEÓRICA'} · {day.day.toUpperCase()}</div><h2>{day.type || 'Añadir entrenamiento'} · {day.day}</h2>
    {isReadOnly && <div className="workout-practical-metrics"><b>WT {values.wt ?? '—'}/50</b><b>FC media {values.averageHr ?? '—'} ppm</b><b>FC reposo {values.restingHr ?? '—'} ppm</b><b>HRV {values.hrv ?? '—'} ms</b></div>}
    <div className="workout-editor-grid">
      <label className="field-label">Tipo de entrenamiento<select disabled={isReadOnly} value={type} onChange={(event) => update('type', event.target.value)}><option value="">Selecciona tipo…</option>{workoutTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field-label">Zapatillas recomendadas<select disabled={isReadOnly} value={values.shoes || ''} onChange={(event) => update('shoes', event.target.value)}><option value="">Sin indicación</option>{shoeTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field-label">Duración · min<input disabled={isReadOnly} type="number" min="0" value={values.mins || ''} onChange={(event) => update('mins', Number(event.target.value))} /></label>
      <label className="field-label">Distancia · km<input disabled={isReadOnly} type="number" min="0" step="0.1" value={values.km || ''} onChange={(event) => update('km', Number(event.target.value))} /></label>
      <label className="field-label">TRIMPS<input disabled={isReadOnly} type="number" min="0" value={Number.parseFloat(values.tr) || 0} onChange={(event) => update('tr', event.target.value)} /></label>
    </div>
    <label className="field-label">Descripción del entrenamiento<textarea disabled={isReadOnly} rows="3" value={values.desc || values.blocks || ''} onChange={(event) => { update('desc', event.target.value); update('blocks', event.target.value); }} placeholder="Estructura y detalles de la sesión" /></label>
    {['Cambios', 'Cuestas', 'Series largas', 'Series cortas', 'Competición', 'Test'].includes(type) && <div className="workout-editor-grid">
      <label className="field-label">Calentamiento<input disabled={isReadOnly} value={values.warmup || ''} onChange={(event) => update('warmup', event.target.value)} placeholder="Ej. 15 min suaves + movilidad" /></label>
      <label className="field-label">Enfriamiento<input disabled={isReadOnly} value={values.cooldown || ''} onChange={(event) => update('cooldown', event.target.value)} placeholder="Ej. 10 min suaves" /></label>
    </div>}
    {type && type !== 'Descanso' && type !== 'Acondicionamiento físico' && <fieldset className="workout-fieldset effort-target-fieldset"><legend>RPE estimado · obligatorio · escala 1–10</legend><div className="workout-editor-grid">
      <label className="field-label">RPE mínimo<input name="rpeMin" required disabled={isReadOnly} type="number" min="1" max={values.details.rpeMax || 10} step="1" value={values.details.rpeMin ?? ''} onChange={(event) => updateDetail('rpeMin', event.target.value)} placeholder="Ej. 4" /></label>
      <label className="field-label">RPE máximo<input name="rpeMax" required disabled={isReadOnly} type="number" min={values.details.rpeMin || 1} max="10" step="1" value={values.details.rpeMax ?? ''} onChange={(event) => updateDetail('rpeMax', event.target.value)} placeholder="Ej. 6" /></label>
    </div><p className="help-text">Añade, si quieres, el rango equivalente de ritmo o de pulsaciones.</p><div className="workout-editor-grid">
      <label className="field-label">Ritmo desde · min/km<input name="paceFrom" disabled={isReadOnly} type="text" pattern="[0-9]{1,2}:[0-5][0-9]" value={values.details.paceFrom || ''} onChange={(event) => updateDetail('paceFrom', event.target.value)} placeholder="5:00" required={Boolean(values.details.paceFrom || values.details.paceTo)} /></label>
      <label className="field-label">Ritmo hasta · min/km<input name="paceTo" disabled={isReadOnly} type="text" pattern="[0-9]{1,2}:[0-5][0-9]" value={values.details.paceTo || ''} onChange={(event) => updateDetail('paceTo', event.target.value)} placeholder="5:30" required={Boolean(values.details.paceFrom || values.details.paceTo)} /></label>
      <label className="field-label">Pulsaciones desde · ppm<input name="hrMin" disabled={isReadOnly} type="number" min="60" max={values.details.hrMax || 220} value={values.details.hrMin || ''} onChange={(event) => updateDetail('hrMin', event.target.value)} placeholder="140" required={Boolean(values.details.hrMin || values.details.hrMax)} /></label>
      <label className="field-label">Pulsaciones hasta · ppm<input name="hrMax" disabled={isReadOnly} type="number" min={values.details.hrMin || 60} max="220" value={values.details.hrMax || ''} onChange={(event) => updateDetail('hrMax', event.target.value)} placeholder="155" required={Boolean(values.details.hrMin || values.details.hrMax)} /></label>
    </div></fieldset>}
    {type === 'Long run / tirada larga' && <label className="field-label">Número de cambios (máximo 3)<input disabled={isReadOnly} type="number" min="0" max="3" value={values.details.changes ?? 0} onChange={(event) => updateDetail('changes', Math.min(3, Number(event.target.value)))} /></label>}
    {intervalType && <fieldset className="workout-fieldset"><legend>Bloques de trabajo · hasta {intervalLimit} repeticiones</legend>
      {workoutGroups.map((group, index) => {
        const otherReps = workoutGroups.reduce((sum, item, itemIndex) => sum + (itemIndex === index ? 0 : Number(item.repetitions) || 0), 0);
        const availableReps = Math.max(1, intervalLimit - otherReps);
        const isSeries = type === 'Series largas' || type === 'Series cortas';
        const minMeters = type === 'Series largas' ? 200 : 10;
        const maxMeters = type === 'Series largas' ? 10000 : 1000;
        return <div className="interval-group-editor" key={index}><div className="interval-group-heading"><b>Bloque {index + 1}</b>{!isReadOnly && workoutGroups.length > 1 && <button type="button" className="text-button" onClick={() => setWorkoutGroups((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Quitar bloque</button>}</div><div className="workout-editor-grid">
          <label className="field-label">Repeticiones<input disabled={isReadOnly} type="number" min="1" max={availableReps} value={group.repetitions} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, repetitions: Math.min(availableReps, Number(event.target.value)) } : item))} /></label>
          {isSeries ? <label className="field-label">Distancia · metros<input disabled={isReadOnly} type="number" min={minMeters} max={maxMeters} step="10" value={group.interval} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, interval: event.target.value } : item))} placeholder={`${minMeters}–${maxMeters} m`} /></label> : <label className="field-label">Distancia o duración<input disabled={isReadOnly} value={group.interval} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, interval: event.target.value } : item))} placeholder={type === 'Cuestas' ? '20 m–2 km o 5 s–10 min' : '800 m, 2 min, 30 s'} /></label>}
          <label className="field-label">Guía<select disabled={isReadOnly} value={group.guide} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, guide: event.target.value } : item))}>{['Sin objetivo', 'RPE', 'Ritmo', 'Pulsaciones', 'Lactato'].map((guide) => <option key={guide}>{guide}</option>)}</select></label>
          <label className="field-label">Objetivo<input disabled={isReadOnly} value={group.target} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, target: event.target.value } : item))} placeholder="Ej. RPE 7, 4:00/km o 165 ppm" /></label>
        </div>{type === 'Series cortas' && <label className="short-series-sled"><input type="checkbox" disabled={isReadOnly} checked={Boolean(group.withSled)} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, withSled: event.target.checked } : item))} /> Con arrastres</label>}{isSeries ? <div className="workout-editor-grid series-notes-grid">
          <label className="field-label">Recuperación<input disabled={isReadOnly} value={group.recovery || ''} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, recovery: event.target.value } : item))} placeholder="Ej. 2 min o 200 m" /></label>
          <label className="field-label">Comentarios<textarea disabled={isReadOnly} rows="2" value={group.comment || ''} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, comment: event.target.value } : item))} placeholder="Indicaciones para el atleta" /></label>
        </div> : <label className="field-label">Recuperación / comentario<input disabled={isReadOnly} value={group.comment} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, comment: event.target.value } : item))} /></label>}</div>;
      })}
      {!isReadOnly && workoutGroups.length < intervalLimit && <button type="button" className="text-button" onClick={() => setWorkoutGroups((current) => [...current, { repetitions: '', interval: '', guide: 'Sin objetivo', target: '', recovery: '', comment: '', withSled: false }])}>+ Añadir bloque</button>}
    </fieldset>}
    {type === 'Cuestas' && <label className="field-label">Longitud de cada cuesta<input disabled={isReadOnly} value={values.details.hillLength || ''} onChange={(event) => updateDetail('hillLength', event.target.value)} placeholder="20 m – 2 km o 5 s – 10 min" /></label>}
    {type === 'Competición' && <div className="workout-editor-grid"><label className="field-label">Distancia de carrera<input disabled={isReadOnly} value={values.details.raceDistance || ''} onChange={(event) => updateDetail('raceDistance', event.target.value)} /></label><label className="field-label">Tiempo objetivo<input disabled={isReadOnly} value={values.details.goalTime || ''} onChange={(event) => updateDetail('goalTime', event.target.value)} placeholder="h:mm:ss" /></label><label className="field-label">Series previas · hasta 10 × 1 km<input disabled={isReadOnly} type="number" min="0" max="10" value={values.details.preRaceReps ?? 0} onChange={(event) => updateDetail('preRaceReps', Math.min(10, Number(event.target.value)))} /></label><label className="field-label">Bloques de umbral · hasta 5 × 10 min<input disabled={isReadOnly} type="number" min="0" max="5" value={values.details.thresholdReps ?? 0} onChange={(event) => updateDetail('thresholdReps', Math.min(5, Number(event.target.value)))} /></label></div>}
    {type === 'Test' && <><label className="field-label">Explicación del test<textarea disabled={isReadOnly} rows="2" value={values.details.testExplanation || ''} onChange={(event) => updateDetail('testExplanation', event.target.value)} /></label><label className="field-label">Resultados (VAM, LT1, LT2, etc.)<textarea disabled={isReadOnly} rows="2" value={values.details.testResults || ''} onChange={(event) => updateDetail('testResults', event.target.value)} placeholder="VAM · LT1 · LT2" /></label></>}
    {type === 'Gimnasio' && <><fieldset className="workout-fieldset"><legend>Ejercicios · máximo 10</legend>{exerciseRows.map((exercise, index) => <div className="gym-exercise-row" key={index}><select disabled={isReadOnly} value={exercise.name} onChange={(event) => setExerciseRows((current) => current.map((row, i) => i === index ? { ...row, name: event.target.value } : row))}>{gymExercises.map((name) => <option key={name}>{name}</option>)}</select><input disabled={isReadOnly} value={exercise.sets || ''} onChange={(event) => setExerciseRows((current) => current.map((row, i) => i === index ? { ...row, sets: event.target.value } : row))} placeholder="Series × repeticiones / peso" /><input disabled={isReadOnly} value={exercise.comment || ''} onChange={(event) => setExerciseRows((current) => current.map((row, i) => i === index ? { ...row, comment: event.target.value } : row))} placeholder="Comentario" /></div>)}{!isReadOnly && exerciseRows.length < 10 && <button type="button" className="text-button" onClick={() => setExerciseRows((current) => [...current, { name: gymExercises[0], sets: '', comment: '' }])}>+ Añadir ejercicio</button>}<label className="field-label">Ejercicio personalizado<input disabled={isReadOnly} value={values.details.customExercise || ''} onChange={(event) => updateDetail('customExercise', event.target.value)} placeholder="Nombre del ejercicio" /></label></fieldset><div className="workout-editor-grid"><label className="field-label">Trabajo antes del gimnasio<select disabled={isReadOnly} value={values.details.beforeGym || ''} onChange={(event) => updateDetail('beforeGym', event.target.value)}><option value="">Ninguno</option>{workoutTypes.filter((item) => !['Gimnasio', 'Competición', 'Descanso'].includes(item)).map((item) => <option key={item}>{item}</option>)}</select></label><label className="field-label">Trabajo después del gimnasio<select disabled={isReadOnly} value={values.details.afterGym || ''} onChange={(event) => updateDetail('afterGym', event.target.value)}><option value="">Ninguno</option>{workoutTypes.filter((item) => !['Gimnasio', 'Competición', 'Descanso'].includes(item)).map((item) => <option key={item}>{item}</option>)}</select></label></div></>}
    {type === 'Acondicionamiento físico' && <fieldset className="workout-fieldset conditioning-fieldset"><legend>Bloques de trabajo · hasta 4</legend>
      {conditioningBlocks.map((block, index) => <div className="conditioning-block" key={index}>
        <div className="interval-group-heading"><b>Bloque {index + 1}</b>{!isReadOnly && conditioningBlocks.length > 1 && <button type="button" className="text-button" onClick={() => setConditioningBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Quitar bloque</button>}</div>
        <div className="workout-editor-grid">
          <label className="field-label">Tipo de bloque<select disabled={isReadOnly} value={block.type} onChange={(event) => setConditioningBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value } : item))}>{conditioningTypes.filter((item) => item === block.type || !conditioningBlocks.some((selected, itemIndex) => itemIndex !== index && selected.type === item)).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field-label">Volumen / duración<input disabled={isReadOnly} value={block.volume} onChange={(event) => setConditioningBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, volume: event.target.value } : item))} placeholder="Ej. 3 × 30 s · 10 min" /></label>
        </div>
        <label className="field-label">Ejercicios / contenido<textarea disabled={isReadOnly} rows="2" value={block.exercises} onChange={(event) => setConditioningBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, exercises: event.target.value } : item))} placeholder="Indica los ejercicios y su secuencia" /></label>
        <label className="field-label">Notas<input disabled={isReadOnly} value={block.comment} onChange={(event) => setConditioningBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, comment: event.target.value } : item))} placeholder="Indicaciones o precauciones" /></label>
      </div>)}
      {!isReadOnly && conditioningBlocks.length < 4 && <button type="button" className="text-button" onClick={() => setConditioningBlocks((current) => [...current, { type: conditioningTypes.find((item) => !current.some((block) => block.type === item)), exercises: '', volume: '', comment: '' }])}>＋ Añadir bloque</button>}
    </fieldset>}
    <fieldset className="workout-fieldset"><legend>Distribución por zonas</legend><div className="workout-editor-grid">{effortZones.map((zone, index) => <label className="field-label" key={zone}>{zone} · min<input disabled={isReadOnly} type="number" min="0" value={values.zones[index] || 0} onChange={(event) => update('zones', values.zones.map((minutes, i) => i === index ? Number(event.target.value) : minutes))} /></label>)}</div></fieldset>
    <div className="inline-actions">{isReadOnly && <button className="button secondary" type="button" onClick={() => setIsReadOnly(false)}>Editar</button>}<button className="button secondary" type="button" onClick={onClose}>{isReadOnly ? 'Cerrar' : 'Cancelar'}</button>{!isReadOnly && <button className="button primary" type="submit">Guardar entrenamiento</button>}</div>
  </form></div>;
}

function OverviewModal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal wide-modal overview-modal"><button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button><h2>{title}</h2><div className="overview-list">{children}</div></section></div>;
}

function Stat({ label, value }) { return <div className="coach-total"><small>{label}</small><b>{value}</b></div>; }

function LogValue({ label, value, unit = '' }) {
  return <div className="practical-log-value"><small>{label}</small><b>{value ? `${value}${unit ? ` ${unit}` : ''}` : '—'}</b></div>;
}

function sumDays(days) {
  return days.reduce((total, day) => ({
    km: total.km + (Number(day.km) || 0), mins: total.mins + (Number(day.mins) || 0),
    tr: total.tr + (Number.parseFloat(day.tr) || 0), wt: total.wt + (Number(day.wt) || 0),
  }), { km: 0, mins: 0, tr: 0, wt: 0 });
}

function format(value) { return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(Number(value) || 0); }

function calculatePace(minutes, distance) {
  const totalMinutes = Number(minutes);
  const kilometers = Number(distance);
  if (!totalMinutes || !kilometers) return '';
  const totalSeconds = Math.round((totalMinutes / kilometers) * 60);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function dateRange(days) {
  if (!days.length) return '';
  const first = dayDate(days[0]);
  const last = dayDate(days.at(-1));
  return `${first}–${last}`;
}

function dayDate(day) {
  return `${day.date} ${day.month || 'oct'}`;
}

function formatWorkoutDate(weekNumber, dayName) {
  const dayIndex = daysOfWeek.indexOf(dayName);
  const date = new Date(Date.UTC(2025, 8, 8 + (weekNumber - 1) * 7 + Math.max(dayIndex, 0)));
  const dateLabel = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(date);
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: 'UTC' }).format(date);
  return `${dateLabel} - ${weekday}`;
}
