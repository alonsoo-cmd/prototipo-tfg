import { useMemo, useRef, useState } from 'react';
import { coachAthletes, isCyclingWorkout, workoutColor, workoutTypes } from '../../data/coachAthletes.js';
import { athleteDirectory } from '../../data/athleteDirectory.js';
import { createTrainingHistory } from '../../data/trainingHistory.js';
import WorkoutStatus from '../../components/ui/WorkoutStatus.jsx';
import WeekTimeline, { getWeekStatus } from '../../components/ui/WeekTimeline.jsx';
import { blankWeek, calculatePace, calculateSpeed, copyWeeks, dayDate, formatRecentDateRange, formatShortDate, sumDays } from './preparation/preparationUtils.js';
import { NewPreparationModal, OverviewModal, TemplatePickerModal } from './preparation/PreparationModals.jsx';
import { WorkoutEditor } from '../../components/workouts/WorkoutEditor.jsx';
import { format, formatLongDate } from '../../utils/format.js';
import InfoTip, { TermLabel } from '../../components/ui/InfoTip.jsx';
import Toast from '../../components/ui/Toast.jsx';
import DatePicker from '../../components/ui/DatePicker.jsx';
import { CURRENT_WEEK, today, todayKey } from '../../domain/calendar.js';
import HrPercent from '../../components/ui/HrPercent.jsx';

// En el prototipo, Lucía (primer atleta del entrenador) es la persona de la vista «Atleta»:
// comparten el plan semanal (`weeks`) y también la preparación con sus objetivos.
const SHARED_PREPARATION = { coachAthleteId: 'lucia', ownerId: 'alex' };
const preparationOwnerId = (athleteId) => (athleteId === SHARED_PREPARATION.coachAthleteId ? SHARED_PREPARATION.ownerId : athleteId);

const objectiveDistances = ['400 m', '800 m', '1.500 m', '3.000 m', '5 km', '10 km', 'Media maratón', 'Maratón'];
const emptyObjective = { name: '', distance: 'Media maratón', eventDate: '' };

export default function PreparationPage({ initialAthleteId = null, hasOwnPlan = true, weeks, setWeeks, preparations = [], setPreparations = () => {}, trainingLogs = {}, workoutTemplates = [], onProfile }) {
  const [athlete, setAthlete] = useState(() => coachAthletes.find((item) => item.id === initialAthleteId) || coachAthletes[0]);
  const [athleteList, setAthleteList] = useState(() => coachAthletes.filter((item) => !item.isCoach || hasOwnPlan));
  const [otherPlans, setOtherPlans] = useState(() => Object.fromEntries(coachAthletes.filter((item) => item.id !== 'lucia').map((item) => [item.id, copyWeeks(weeks)])));
  const [selectedWeek, setSelectedWeek] = useState(CURRENT_WEEK);
  const [editingDay, setEditingDay] = useState(null);
  const [showAllDays, setShowAllDays] = useState(false);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [notice, setNotice] = useState('');
  const [startingAthlete, setStartingAthlete] = useState(null);
  const [dropTarget, setDropTarget] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState('all');
  const [clipboard, setClipboard] = useState(null);
  const [templatePickerDay, setTemplatePickerDay] = useState(null);
  const [toast, setToast] = useState('');
  const [history, setHistory] = useState([]);
  const [newObjective, setNewObjective] = useState(emptyObjective);
  const [objectiveToast, setObjectiveToast] = useState(null);
  const skipDayClick = useRef(false);

  const planWeeks = athlete.id === 'lucia' ? weeks : otherPlans[athlete.id] || copyWeeks(weeks);
  const plannedWeeks = Number.parseInt(athlete.duration, 10) || planWeeks.length;
  // FC máxima del atleta seleccionado (para el % de FC máxima de sus sesiones).
  const athleteFcMax = athlete.fcMax || 200;
  const current = planWeeks.find((week) => week.number === selectedWeek) || planWeeks.at(-1) || blankWeek(1);
  
  const setPlanWeeks = (updater) => {
    setHistory((prev) => [...prev, copyWeeks(planWeeks)].slice(-20));
    if (athlete.id === 'lucia') setWeeks(updater);
    else setOtherPlans((all) => ({ ...all, [athlete.id]: updater(all[athlete.id] || copyWeeks(weeks)) }));
  };

  const undo = () => {
    if (!history.length) return;
    const previous = history.at(-1);
    setHistory((prev) => prev.slice(0, -1));
    if (athlete.id === 'lucia') setWeeks(previous);
    else setOtherPlans((all) => ({ ...all, [athlete.id]: previous }));
    setNotice('Cambios revertidos.');
  };

  const copyCurrentWeek = () => {
    setClipboard({ type: 'week', days: copyWeeks([current])[0].days });
    setNotice(`Semana ${current.number} copiada al portapapeles.`);
  };

  const pasteWeek = () => {
    if (!clipboard || clipboard.type !== 'week') return;
    setPlanWeeks((all) => all.map((week) => week.number === current.number ? {
      ...week,
      days: week.days.map((targetDay, index) => {
        const copiedDay = clipboard.days[index];
        return { ...copiedDay, day: targetDay.day, date: targetDay.date, month: targetDay.month };
      })
    } : week));
    setToast(`Semana pegada en la semana ${current.number}`);
  };

  const copyDay = (day, event) => {
    event.stopPropagation();
    setClipboard({ type: 'day', day: { ...day } });
    setNotice(`${day.day} copiado al portapapeles.`);
  };

  const pasteDay = (targetDay, event) => {
    event.stopPropagation();
    if (!clipboard || clipboard.type !== 'day') return;
    const updatedDay = {
      ...clipboard.day,
      day: targetDay.day,
      date: targetDay.date,
      month: targetDay.month
    };
    saveDay(updatedDay);
    setNotice('');
    setToast(`${clipboard.day.day} pegado en ${targetDay.day}`);
  };
  const totals = useMemo(() => sumDays(current.days), [current.days]);
  const recordedHistory = useMemo(() => createTrainingHistory(trainingLogs, weeks), [trainingLogs, weeks]);
  const completedHistory = useMemo(() => {
    return recordedHistory.filter((item) => ['completed', 'partial', 'missed'].includes(item.completionStatus));
  }, [recordedHistory]);
  // Últimos 7 días naturales hasta hoy (incluido), no las 7 últimas sesiones.
  const last7Range = useMemo(() => {
    const start = today();
    start.setUTCDate(start.getUTCDate() - 6);
    return { from: start.toISOString().slice(0, 10), to: todayKey() };
  }, []);
  const last7Workouts = useMemo(() => {
    return completedHistory.filter((item) => item.date >= last7Range.from && item.date <= last7Range.to).reverse();
  }, [completedHistory, last7Range]);
  const last7Totals = useMemo(() => {
    if (!last7Workouts.length) {
      return { km: 0, mins: 0, completed: 0, partial: 0, missed: 0, avgWt: null, avgHr: null, avgPace: '' };
    }
    const km = last7Workouts.reduce((sum, w) => sum + (Number(w.distance) || 0), 0);
    const mins = last7Workouts.reduce((sum, w) => sum + (Number(w.minutes) || 0), 0);
    const completed = last7Workouts.filter((w) => w.completionStatus === 'completed').length;
    const partial = last7Workouts.filter((w) => w.completionStatus === 'partial').length;
    const missed = last7Workouts.filter((w) => w.completionStatus === 'missed').length;
    // Las medias ignoran los valores vacíos (p. ej. sesiones no realizadas, sin FC).
    const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
    const avgWt = average(last7Workouts.map((w) => Number(w.wellbeingTotal)).filter((value) => value > 0));
    const hrAverage = average(last7Workouts.map((w) => Number(w.averageHr)).filter((value) => value > 0));
    const avgHr = hrAverage === null ? null : Math.round(hrAverage);
    const avgPace = calculatePace(mins, km);
    return { km, mins, completed, partial, missed, avgWt, avgHr, avgPace };
  }, [last7Workouts]);
  const preparationOwner = preparationOwnerId(athlete.id);
  const athletePreparation = preparations.find((item) => item.athleteId === preparationOwner) || null;
  const athleteObjectives = athletePreparation?.objectives || [];
  const preparationTitle = athletePreparation?.name || athlete.goal.split(' · ')[1] || athlete.goal;
  const visibleWorkoutTemplates = workoutTemplates.filter((template) => templateTypeFilter === 'all' || template.type === templateTypeFilter);
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
  const placeTemplate = (day, event) => {
    event.preventDefault();
    event.stopPropagation();
    const templateId = event.dataTransfer.getData('application/x-edurance-template');
    const template = workoutTemplates.find((item) => String(item.id) === templateId);
    setDropTarget('');
    if (!template) return;
    skipDayClick.current = true;
    window.setTimeout(() => { skipDayClick.current = false; }, 500);
    saveDay({ ...template, day: day.day, date: day.date, month: day.month });
    setNotice('');
    setToast(`${day.day}: plantilla «${template.type}» aplicada`);
  };
  const chooseAthlete = (next) => {
    setAthlete(next);
    setSelectedWeek(CURRENT_WEEK);
    setNotice('');
    setNewObjective(emptyObjective);
  };
  // Los objetivos los gestiona el entrenador; el atleta solo los consulta en su perfil.
  const addObjective = (event) => {
    event.preventDefault();
    const name = newObjective.name.trim();
    if (!name) return;
    const objective = { ...newObjective, name, id: Date.now() };
    setPreparations((all) => (all.some((item) => item.athleteId === preparationOwner)
      ? all.map((item) => (item.athleteId === preparationOwner ? { ...item, objectives: [...item.objectives, objective] } : item))
      : [...all, { id: Date.now() + 1, athleteId: preparationOwner, athleteName: athlete.name, name: preparationTitle, duration: athlete.duration, coach: 'Alex Martín', objectives: [objective] }]));
    setNewObjective(emptyObjective);
    setToast('');
    setObjectiveToast({ message: `Objetivo «${name}» añadido a ${athlete.name}` });
  };
  const removeObjective = (objective) => {
    const owner = preparationOwner;
    const position = athleteObjectives.findIndex((entry) => entry.id === objective.id);
    setPreparations((all) => all.map((item) => (item.athleteId === owner ? { ...item, objectives: item.objectives.filter((entry) => entry.id !== objective.id) } : item)));
    setToast('');
    setObjectiveToast({
      message: `Objetivo «${objective.name}» quitado`,
      undo: () => setPreparations((all) => all.map((item) => {
        if (item.athleteId !== owner || item.objectives.some((entry) => entry.id === objective.id)) return item;
        const objectives = [...item.objectives];
        objectives.splice(position, 0, objective);
        return { ...item, objectives };
      })),
    });
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
    setSelectedWeek(CURRENT_WEEK);
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
        <span className="mini-avatar">{item.initials}</span><span><b>{item.isCoach ? 'Mi preparación' : item.name}</b><small>{item.isCoach ? `${item.name} · entrenador` : item.goal} · {item.isCoach ? 'Preparación propia' : preparations.some((preparation) => preparation.athleteId === preparationOwnerId(item.id)) ? 'Con preparación activa' : 'A tu cargo'}</small></span>
      </button>)}</div>
    </section>

    <div className="active-prep-card">
      <div className="active-prep-icon">↗</div><div className="active-prep-info"><div className="eyebrow">PREPARACIÓN ACTIVA · {planWeeks.length} SEMANAS · {athleteObjectives.length} {athleteObjectives.length === 1 ? 'OBJETIVO' : 'OBJETIVOS'}</div><h2>{preparationTitle}</h2><p>{athlete.name} · {athletePreparation?.duration || athlete.duration} · {athleteObjectives.map((item) => item.name).join(' · ') || 'Sin objetivos asociados'}</p></div>
      <button className="button secondary" onClick={onProfile}>Perfil ↗</button>
    </div>

    <section className="panel coach-objectives-panel" aria-labelledby="coach-objectives-title">
      <div className="panel-title"><div><h2 id="coach-objectives-title">Objetivos de la preparación</h2><p>{athlete.name} · {athleteObjectives.length} {athleteObjectives.length === 1 ? 'objetivo' : 'objetivos'}</p></div></div>
      {athleteObjectives.length ? <ul className="coach-objective-list">{athleteObjectives.map((objective) => <li className="coach-objective" key={objective.id}>
        <div><strong>{objective.name}</strong><small>{objective.distance}{objective.eventDate ? ` · ${formatLongDate(objective.eventDate)}` : ''}</small></div>
        <button className="remove-pill" type="button" aria-label={`Quitar objetivo ${objective.name}`} onClick={() => removeObjective(objective)}><span aria-hidden="true">×</span>Quitar</button>
      </li>)}</ul> : <p className="coach-objective-empty">Esta preparación todavía no tiene objetivos.</p>}
      <form className="coach-objective-form" onSubmit={addObjective}>
        <label className="field-label">Nombre del objetivo<input value={newObjective.name} onChange={(event) => setNewObjective((draft) => ({ ...draft, name: event.target.value }))} placeholder="Ej. 10K de otoño" /></label>
        <label className="field-label">Distancia<select value={newObjective.distance} onChange={(event) => setNewObjective((draft) => ({ ...draft, distance: event.target.value }))}>{objectiveDistances.map((distance) => <option key={distance}>{distance}</option>)}</select></label>
        <label className="field-label">Fecha objetivo<DatePicker value={newObjective.eventDate} onChange={(eventDate) => setNewObjective((draft) => ({ ...draft, eventDate }))} allowClear placeholder="Opcional" ariaLabel="Elegir fecha objetivo" /></label>
        <button className="button secondary" type="submit" disabled={!newObjective.name.trim()}>＋ Añadir objetivo</button>
      </form>
    </section>

    <section className="panel coach-practical-section">
      <div className="schedule-heading">
        <div>
          <div className="eyebrow">PREPARACIÓN PRÁCTICA</div>
          <h2>Resumen de los últimos 7 días de entrenamientos <span className="subtle-dates">{formatRecentDateRange([{ date: last7Range.to }, { date: last7Range.from }])}</span></h2>
          <p>Entrenamientos realizados y registros de {athlete.name} en los últimos 7 días.</p>
        </div>
        <button className="text-button" type="button" onClick={() => setShowAllDays(true)}>Ver todos los entrenamientos →</button>
      </div>

      <div className="coach-total-strip weekly-totals" style={{ margin: '14px 0 16px', padding: '12px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid #dce8dc' }}>
        <Stat label="Kilómetros (7d)" value={`${format(last7Totals.km)} km`} />
        <Stat label="Tiempo total" value={`${last7Totals.mins} min`} />
        <Stat label="Completados" value={`${last7Totals.completed} de ${last7Workouts.length}`} />
        <Stat label="Ritmo medio" value={last7Totals.avgPace ? `${last7Totals.avgPace} min/km` : '—'} />
        <Stat label="FC media" value={last7Totals.avgHr ? `${last7Totals.avgHr} ppm` : '—'} />
        <Stat label="% FC máx medio" value={<HrPercent averageHr={last7Totals.avgHr} fcMax={athleteFcMax} />} />
        <Stat label="Bienestar (WT)" value={last7Totals.avgWt ? `${format(last7Totals.avgWt)} / 50` : '—'} />
      </div>

      {last7Workouts.length ? <div className="practical-log-list">{last7Workouts.map((item) => {
        const isCompleted = item.completionStatus === 'completed';
        const isPartial = item.completionStatus === 'partial';
        return (
          <article className="practical-log-entry" key={item.id}>
            <header className="practical-log-header">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <b>{item.day}</b>
                <span>{formatShortDate(item.date)}</span>
                <small style={{ color: 'var(--muted-color)', fontSize: 'var(--text-sm)' }}>Semana {item.preparationWeek}</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '2px 8px', borderRadius: '10px', fontSize: 'var(--text-sm)', fontWeight: '600',
                  background: isCompleted ? '#dcfce7' : isPartial ? '#fef9c3' : '#fee2e2',
                  color: isCompleted ? '#15803d' : isPartial ? '#854d0e' : '#b91c1c'
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: isCompleted ? '#22c55e' : isPartial ? '#eab308' : '#ef4444'
                  }} />
                  {item.status}
                </span>
                <span style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: '#1f2937' }}>{item.type}</span>
              </div>
            </header>
            <div className="practical-log-activity">
              <LogValue label="Distancia" value={item.distance ? format(item.distance) : ''} unit="km" />
              <LogValue label="Duración" value={item.minutes} unit="min" />
              <div className="practical-log-value"><small><TermLabel>% FC máx</TermLabel></small><b><HrPercent averageHr={item.averageHr} fcMax={athleteFcMax} /></b></div>
              {isCyclingWorkout(item.type) ? (
                <LogValue label="Velocidad media" value={item.speed || calculateSpeed(item.minutes, item.distance)} unit="km/h" />
              ) : (
                <LogValue label="Ritmo medio" value={item.pace} unit="min/km" />
              )}
              <LogValue label="FC media" value={item.averageHr} unit="ppm" />
              <LogValue label="Esfuerzo" value={`RPE ${item.rpe}/10`} />
            </div>
            <div className="practical-log-wellbeing">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <b>Bienestar · 1 mejor – 10 peor <InfoTip term="wt" /></b>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: '700', color: '#3f7048' }}>WT {item.wellbeingTotal}/50</span>
              </div>
              <div>
                <LogValue label="Fatiga" value={item.fatigue} />
                <LogValue label="Irritabilidad" value={item.mood} />
                <LogValue label="Agujetas" value={item.soreness} />
                <LogValue label="Mal descanso" value={item.sleep} />
                <LogValue label="Estrés" value={item.stress} />
              </div>
            </div>
            {item.injuries?.length > 0 && <div className="practical-log-injuries">
              <b>Molestias registradas</b>
              {item.injuries.map((injury) => <p key={injury.region}><strong>{injury.regionLabel || injury.region.replaceAll('-', ' ')} · {injury.level}/10</strong>{injury.description && <span>{injury.description}</span>}</p>)}
            </div>}
            {item.notes && <p className="practical-log-notes"><b>Sensaciones:</b> <span>{item.notes}</span></p>}
          </article>
        );
      })}</div> : <p className="practical-empty-state">El atleta todavía no ha registrado entrenamientos en los últimos 7 días.</p>}
    </section>

    <section className="panel schedule-editor coach-theory-section">
      <div className="schedule-heading"><div><div className="eyebrow">PREPARACIÓN TEÓRICA</div><h2>Plan semanal</h2><p>{[athlete.distance, athlete.eventDate, planWeeks.length < plannedWeeks ? `${planWeeks.length} de ${plannedWeeks} semanas planificadas` : athlete.duration].filter(Boolean).join(' · ')}</p></div><div className="schedule-actions"><button className="button secondary" onClick={() => setShowAllWeeks(true)}>Semana {current.number} · ver todas ↗</button><button className="button primary" onClick={createWeek} disabled={planWeeks.length >= (Number.parseInt(athlete.duration, 10) || 12)}>＋ Nueva semana</button></div></div>
      <WeekTimeline
        weeks={planWeeks}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        currentWeek={CURRENT_WEEK}
      />
      <div className="selected-week-heading"><div><div className="eyebrow">SEMANA {current.number} · {current.phase.toUpperCase()}</div><h3>Semana {current.number} · planificación</h3></div><div className="week-actions" style={{ display: 'flex', gap: '8px' }}><button className="button secondary" type="button" onClick={undo} disabled={history.length === 0}>Deshacer</button><button className="button secondary" type="button" onClick={copyCurrentWeek}>Copiar semana</button><button className="button primary" type="button" onClick={pasteWeek} disabled={!clipboard}>Pegar semana</button></div></div>
      {workoutTemplates.length > 0 ? <section className="workout-template-library">
        <div className="workout-template-library-heading"><div><b>Entrenamientos predefinidos</b><span>Pulsa «Usar plantilla…» en un día o arrastra un bloque sobre él.</span></div><label>Tipo<select value={templateTypeFilter} onChange={(event) => setTemplateTypeFilter(event.target.value)}><option value="all">Todos</option>{workoutTypes.map((type) => <option key={type}>{type}</option>)}</select></label><span>{visibleWorkoutTemplates.length} disponibles</span></div>
        {visibleWorkoutTemplates.length ? <div className="workout-template-blocks">{visibleWorkoutTemplates.map((template) => <button type="button" draggable key={template.id} className={`workout-template-block workout-color-${workoutColor(template.type)}`} onDragStart={(event) => { event.dataTransfer.setData('application/x-edurance-template', String(template.id)); event.dataTransfer.effectAllowed = 'copy'; }} onDragEnd={() => setDropTarget('')}>
          <b>{template.type}</b><span>{template.desc || template.blocks || 'Sin descripción'}</span><small>{template.mins || 0} min · {format(template.km)} km</small>
        </button>)}</div> : <p className="workout-template-filter-empty">No hay entrenamientos predefinidos de este tipo.</p>}
      </section> : <section className="workout-template-library workout-template-library-empty"><b>Entrenamientos predefinidos</b><span>No hay entrenamientos guardados. Puedes seguir planificando cada día manualmente.</span></section>}
      <div className="coach-week-grid">{current.days.map((day) => <div
        key={day.day}
        className={`coach-day-cell ${dropTarget === day.day ? 'drop-target' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDropTarget(day.day); }}
        onDragLeave={() => setDropTarget((currentTarget) => currentTarget === day.day ? '' : currentTarget)}
        onDrop={(event) => placeTemplate(day, event)}
      >
        <button type="button" className={`coach-workout-card ${day.type ? `workout-color-${workoutColor(day.type)}` : 'empty'}`} aria-label={`${day.day}: ${day.type || 'sin entrenamiento'}. Editar`} onClick={() => { if (skipDayClick.current) return; setEditingDay({ day, mode: 'edit' }); }}>
        <span className="coach-workout-day">{day.day}<small>{dayDate(day)}</small></span><b>{day.type || '+ Añadir entrenamiento'}</b><span className="coach-workout-description">{day.desc || day.blocks || (day.type ? 'Sin descripción' : 'Día en blanco')}</span>{day.shoes && <span className="coach-workout-description">👟 {day.shoes}</span>}<span className="coach-workout-metrics">{day.mins || 0} min · {format(day.km)} km</span><WorkoutStatus status={trainingLogs[`${current.number}-${day.day}`]?.completionStatus || (trainingLogs[`${current.number}-${day.day}`] ? 'completed' : null)} className="coach-workout-status" />
        </button>
        <div className="coach-day-actions">
          {workoutTemplates.length > 0 && <button type="button" className="coach-day-action primary" onClick={() => setTemplatePickerDay(day)} aria-label={`Usar plantilla para el ${day.day}`}>Usar plantilla…</button>}
          <button type="button" className="coach-day-action" onClick={(event) => copyDay(day, event)} aria-label={`Copiar ${day.day}`}>Copiar</button>
          {clipboard?.type === 'day' && <button type="button" className="coach-day-action" onClick={(event) => pasteDay(day, event)} aria-label={`Pegar en ${day.day}`}>Pegar</button>}
        </div>
      </div>)}</div>
      <div className="coach-total-strip weekly-totals"><Stat label={`Km · semana ${current.number}`} value={`${format(totals.km)} km`} /><Stat label="Minutos" value={`${totals.mins} min`} /><button className="text-button" onClick={() => setShowAllWeeks(true)}>Ver desglose BX · BI · BII →</button></div>
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
    <Toast message={objectiveToast?.message || ''} onDone={() => setObjectiveToast(null)} action={objectiveToast?.undo ? { label: 'Deshacer', onClick: objectiveToast.undo } : null} />
    <Toast message={toast} onDone={() => setToast('')} action={{ label: 'Deshacer', onClick: undo }} />

    {templatePickerDay && <TemplatePickerModal
      day={templatePickerDay}
      templates={workoutTemplates}
      onClose={() => setTemplatePickerDay(null)}
      onPick={(template) => {
        saveDay({ ...template, day: templatePickerDay.day, date: templatePickerDay.date, month: templatePickerDay.month });
        setNotice('');
        setToast(`${templatePickerDay.day}: plantilla «${template.type}» aplicada`);
        setTemplatePickerDay(null);
      }}
    />}
    {editingDay && <WorkoutEditor key={`${athlete.id}-${current.number}-${editingDay.day.day}-${editingDay.mode}`} day={editingDay.day} mode={editingDay.mode} onClose={() => setEditingDay(null)} onSave={saveDay} />}
    {startingAthlete && <NewPreparationModal athlete={startingAthlete} onClose={() => setStartingAthlete(null)} onCreate={startPreparation} />}
    {showAllDays && <OverviewModal title={`Todos los entrenamientos · ${athlete.name}`} onClose={() => setShowAllDays(false)}>
      {completedHistory.slice().reverse().map((day) => <div className="overview-row" key={day.id}>
        <b>Semana {day.preparationWeek} · {day.day} ({formatShortDate(day.date)}) · {day.type}</b>
        <span>{day.distance ? format(day.distance) : '—'} km · {day.minutes || '—'} min · {isCyclingWorkout(day.type) ? `Velocidad ${day.speed || calculateSpeed(day.minutes, day.distance) || '—'} km/h` : `Ritmo ${day.pace || '—'} min/km`} · FC {day.averageHr || '—'} ppm · {day.status}</span>
        <span>Fatiga {day.fatigue || '—'} · Irritabilidad {day.mood || '—'} · Agujetas {day.soreness || '—'} · Mal descanso {day.sleep || '—'} · Estrés {day.stress || '—'} · WT {day.wellbeingTotal || '—'}/50</span>
        {day.notes && <span style={{ color: 'var(--muted-color)', fontStyle: 'italic' }}>“{day.notes}”</span>}
      </div>)}
      {!completedHistory.length && <p className="practical-empty-state">El atleta todavía no ha registrado entrenamientos.</p>}
    </OverviewModal>}
    {showAllWeeks && <OverviewModal title={`Semanas · ${athlete.name}`} onClose={() => setShowAllWeeks(false)}>{planWeeks.map((week) => {
      const status = getWeekStatus(week.number);
      const sum = sumDays(week.days);
      return <button className="overview-row" key={week.number} onClick={() => { setSelectedWeek(week.number); setShowAllWeeks(false); }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <b>Semana {week.number} · {week.phase}</b>
          <span className={`week-timeline-badge ${status}`}>
            {status === 'past' && '✓ Realizada'}
            {status === 'current' && '● Actual'}
            {status === 'future' && 'Planificada'}
          </span>
        </div>
        <span>{format(sum.km)} km · {sum.mins} min</span>
        <span>{week.days.filter((day) => day.type).length} entrenamientos</span>
      </button>;
    })}</OverviewModal>}
  </div>;
}

function Stat({ label, value }) { return <div className="coach-total"><small><TermLabel>{label}</TermLabel></small><b>{value}</b></div>; }

function LogValue({ label, value, unit = '' }) {
  return <div className="practical-log-value"><small><TermLabel>{label}</TermLabel></small><b>{value ? `${value}${unit ? ` ${unit}` : ''}` : '—'}</b></div>;
}
