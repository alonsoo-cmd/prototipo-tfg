import { useState } from 'react';
import { gymExercises, isCyclingWorkout, workoutTypes } from '../../data/coachAthletes.js';
import { format } from '../../utils/format.js';
import InfoTip from '../ui/InfoTip.jsx';

const effortZones = ['Suave · hasta LT1', 'Umbral · LT1–LT2', 'Fuerte · sobre LT2'];

const conditioningTypes = ['Core', 'Ejercicios para lesión', 'Pliometría', 'Técnica de carrera y movilidad'];

const shoeTypes = ['Rodadoras', 'Voladoras', 'Clavos'];

export function WorkoutEditor({ day, mode, onClose, onSave }) {
  const [values, setValues] = useState(() => ({ ...day, details: day.details || {}, zones: day.zones || [0, 0, 0] }));
  const [exerciseRows, setExerciseRows] = useState(values.details.exercises || []);
  const [conditioningBlocks, setConditioningBlocks] = useState(values.details.conditioningBlocks || [{ type: 'Core', exercises: '', volume: '', comment: '' }]);
  const [workoutGroups, setWorkoutGroups] = useState(() => (values.details.groups || [{ repetitions: '', interval: '', guide: 'Sin objetivo', target: '', recovery: '', comment: '', withSled: false }]).map((group) => ({ recovery: '', ...group })));
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view' || mode === 'template-view');
  const [error, setError] = useState('');
  const update = (key, value) => { setError(''); setValues((current) => ({ ...current, [key]: value })); };
  const updateDetail = (key, value) => setValues((current) => ({ ...current, details: { ...current.details, [key]: value } }));
  const type = values.type || '';
  const isCycling = isCyclingWorkout(type);
  const intervalType = ['Cambios', 'Cuestas', 'Series largas', 'Series cortas'].includes(type);
  const intervalLimit = type === 'Cambios' ? 25 : type === 'Cuestas' ? 30 : 50;

  const submit = (event) => {
    event.preventDefault();
    const missing = [];
    if (!type) missing.push('tipo de entrenamiento');
    if (type !== 'Descanso' && !(Number(values.mins) > 0)) missing.push('duración mayor que 0 min');
    if (missing.length) {
      setError(`No se puede guardar. Falta: ${missing.join(', ')}.`);
      return;
    }
    const blockSummary = conditioningBlocks.map((block) => `${block.type}${block.exercises ? `: ${block.exercises}` : ''}${block.volume ? ` (${block.volume})` : ''}`).join(' · ');
    const description = values.desc || (type === 'Acondicionamiento físico' ? blockSummary : '');
    const details = { ...values.details, exercises: exerciseRows, groups: workoutGroups, conditioningBlocks };
    if (type === 'Descanso' || type === 'Acondicionamiento físico') {
      delete details.rpeMin; delete details.rpeMax; delete details.paceFrom; delete details.paceTo; delete details.speedFrom; delete details.speedTo; delete details.hrMin; delete details.hrMax;
    }
    if (isCycling) {
      delete details.paceFrom; delete details.paceTo;
    } else {
      delete details.speedFrom; delete details.speedTo;
    }
    const trimps = calculateWorkoutTrimps(values.zones);
    onSave({ ...values, desc: description, blocks: description, details, tone: type === 'Descanso' ? 'rest' : 'blue', tr: String(trimps) });
  };

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal wide-modal workout-editor-modal" onSubmit={submit}>
    <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button><div className="eyebrow">{isReadOnly ? 'ENTRENAMIENTO · DETALLE' : mode.startsWith('template') ? 'ENTRENAMIENTOS PREFABRICADOS' : 'PLANIFICACIÓN TEÓRICA'}{!mode.startsWith('template') && ` · ${day.day.toUpperCase()}`}</div><h2>{day.type || 'Añadir entrenamiento'}{!mode.startsWith('template') && ` · ${day.day}`}</h2>
    {isReadOnly && mode.startsWith('template') && <div className="workout-practical-metrics"><b>TRIMPS {values.tr || calculateWorkoutTrimps(values.zones)}</b><b>{values.mins || 0} min</b><b>{format(values.km)} km</b></div>}
    {isReadOnly && !mode.startsWith('template') && <div className="workout-practical-metrics"><b>WT {values.wt ?? '—'}/50</b><b>FC media {values.averageHr ?? '—'} ppm</b><b>FC reposo {values.restingHr ?? '—'} ppm</b><b>HRV {values.hrv ?? '—'} ms</b></div>}
    <div className="workout-editor-grid">
      <label className="field-label">Tipo de entrenamiento<select required={!isReadOnly && mode.startsWith('template')} disabled={isReadOnly} value={type} onChange={(event) => update('type', event.target.value)}><option value="">Selecciona tipo…</option>{workoutTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field-label">Zapatillas recomendadas<select disabled={isReadOnly} value={values.shoes || ''} onChange={(event) => update('shoes', event.target.value)}><option value="">Sin indicación</option>{shoeTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="field-label">Duración · min<input disabled={isReadOnly} type="number" min="0" value={values.mins || ''} onChange={(event) => update('mins', Number(event.target.value))} /></label>
      <label className="field-label">Distancia · km<input disabled={isReadOnly} type="number" min="0" step="0.1" value={values.km || ''} onChange={(event) => update('km', Number(event.target.value))} /></label>
    </div>
    <label className="field-label">Descripción del entrenamiento<textarea disabled={isReadOnly} rows="3" value={values.desc || values.blocks || ''} onChange={(event) => { update('desc', event.target.value); update('blocks', event.target.value); }} placeholder="Estructura y detalles de la sesión" /></label>
    {['Cambios', 'Cuestas', 'Series largas', 'Series cortas', 'Competición', 'Test'].includes(type) && <div className="workout-editor-grid">
      <label className="field-label">Calentamiento<input disabled={isReadOnly} value={values.warmup || ''} onChange={(event) => update('warmup', event.target.value)} placeholder="Ej. 15 min suaves + movilidad" /></label>
      <label className="field-label">Enfriamiento<input disabled={isReadOnly} value={values.cooldown || ''} onChange={(event) => update('cooldown', event.target.value)} placeholder="Ej. 10 min suaves" /></label>
    </div>}
    {type && type !== 'Descanso' && type !== 'Acondicionamiento físico' && <fieldset className="workout-fieldset effort-target-fieldset"><legend>RPE estimado · obligatorio · escala 1–10</legend><div className="workout-editor-grid">
      <label className="field-label">RPE mínimo<input name="rpeMin" required={!isReadOnly && !mode.startsWith('template')} disabled={isReadOnly} type="number" min="1" max={values.details.rpeMax || 10} step="1" value={values.details.rpeMin ?? ''} onChange={(event) => updateDetail('rpeMin', event.target.value)} placeholder="Ej. 4" /></label>
      <label className="field-label">RPE máximo<input name="rpeMax" required={!isReadOnly && !mode.startsWith('template')} disabled={isReadOnly} type="number" min={values.details.rpeMin || 1} max="10" step="1" value={values.details.rpeMax ?? ''} onChange={(event) => updateDetail('rpeMax', event.target.value)} placeholder="Ej. 6" /></label>
    </div><p className="help-text">Añade, si quieres, el rango equivalente de {isCycling ? 'velocidad' : 'ritmo'} o de pulsaciones.</p>
    {isCycling ? (
      <div className="workout-editor-grid">
        <label className="field-label">Velocidad desde · km/h<input name="speedFrom" disabled={isReadOnly} type="number" step="0.5" min="5" max={values.details.speedTo || 80} value={values.details.speedFrom || ''} onChange={(event) => updateDetail('speedFrom', event.target.value)} placeholder="Ej. 22" /></label>
        <label className="field-label">Velocidad hasta · km/h<input name="speedTo" disabled={isReadOnly} type="number" step="0.5" min={values.details.speedFrom || 5} max="80" value={values.details.speedTo || ''} onChange={(event) => updateDetail('speedTo', event.target.value)} placeholder="Ej. 28" /></label>
      </div>
    ) : (
      <div className="workout-editor-grid">
        <label className="field-label">Ritmo desde · min/km<input name="paceFrom" disabled={isReadOnly} type="text" pattern="[0-9]{1,2}:[0-5][0-9]" value={values.details.paceFrom || ''} onChange={(event) => updateDetail('paceFrom', event.target.value)} placeholder="5:00" /></label>
        <label className="field-label">Ritmo hasta · min/km<input name="paceTo" disabled={isReadOnly} type="text" pattern="[0-9]{1,2}:[0-5][0-9]" value={values.details.paceTo || ''} onChange={(event) => updateDetail('paceTo', event.target.value)} placeholder="5:30" /></label>
      </div>
    )}
    <div className="workout-editor-grid">
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
          <label className="field-label">Guía<select disabled={isReadOnly} value={group.guide} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, guide: event.target.value } : item))}>{['Sin objetivo', 'RPE', isCycling ? 'Velocidad' : 'Ritmo', 'Pulsaciones', 'Lactato'].map((guide) => <option key={guide}>{guide}</option>)}</select></label>
          <label className="field-label">Objetivo<input disabled={isReadOnly} value={group.target} onChange={(event) => setWorkoutGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, target: event.target.value } : item))} placeholder={isCycling ? "Ej. RPE 7, 30 km/h o 165 ppm" : "Ej. RPE 7, 4:00/km o 165 ppm"} /></label>
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
    <fieldset className="workout-fieldset"><legend>Distribución por zonas <InfoTip term="umbrales" /></legend><div className="workout-editor-grid">{effortZones.map((zone, index) => <label className="field-label" key={zone}>{zone} · min<input disabled={isReadOnly} type="number" min="0" value={values.zones[index] || 0} onChange={(event) => update('zones', values.zones.map((minutes, i) => i === index ? Number(event.target.value) : minutes))} /></label>)}</div></fieldset>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="inline-actions">{isReadOnly && <button className="button secondary" type="button" onClick={() => setIsReadOnly(false)}>Editar entrenamiento</button>}<button className="button secondary" type="button" onClick={onClose}>{isReadOnly ? 'Cerrar' : 'Cancelar'}</button>{!isReadOnly && <button className="button primary" type="submit">Guardar entrenamiento</button>}</div>
  </form></div>;
}

function calculateWorkoutTrimps(zones = []) {
  return (Number(zones[0]) || 0) + 2 * (Number(zones[1]) || 0) + 3 * (Number(zones[2]) || 0);
}
