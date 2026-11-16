import { useEffect, useRef, useState } from 'react';
import { injuryRegions, wellbeingFields, wellbeingScales } from '../../domain/wellbeing.js';
import { NumberField, RangeField, TextField, WorkoutDetailRow } from './JournalFields.jsx';
import { calculateSpeed, calculateTrimps, getTrimpBadge, trimpCoefficient } from '../../domain/training.js';
import { createWorkoutDetailSections, hasWorkoutDetailOption } from './workoutDetailSections.js';
import './JournalModal.css';
import InfoTip from '../ui/InfoTip.jsx';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/** Indicadores de bienestar que faltan por rellenar (son obligatorios en cada registro). */
export function missingWellbeingFields(values) {
  return wellbeingFields.filter(([key]) => values?.[key] === '' || values?.[key] === undefined || values?.[key] === null);
}

/**
 * Registro diario. El bienestar es obligatorio y es el eje del diario junto con el entrenamiento;
 * el resto (series, salud, molestias) es opcional y va plegado.
 * `hidePersonalFields` oculta solo salud y molestias (el Dashboard las recoge en su propio panel).
 */
export function JournalModal({ session, initialValues, onClose, onSave, hidePersonalFields = false, athleteProfile = { fcMax: 200, sex: null } }) {
  const isCycling = /bicicleta|ciclismo|\bbici\b/i.test(session.type);
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
  const [showErrors, setShowErrors] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const formRef = useRef(null);
  const [values, setValues] = useState(() => {
    const mins = initialValues?.minutes ?? (session.mins || '');
    const avgHr = initialValues?.averageHr ?? '';
    const restHr = initialValues?.restingHr ?? '';
    const initialTrimp = initialValues?.trimps || (mins && avgHr ? calculateTrimps(mins, avgHr, restHr, athleteProfile) : '');
    const initialSpeed = initialValues?.speed ?? (isCycling && initialValues?.pace ? initialValues.pace : '');
    return {
      distance: initialValues?.distance ?? (session.km || ''),
      minutes: mins,
      trimps: initialTrimp,
      pace: initialValues?.pace ?? '',
      speed: initialSpeed,
      averageHr: avgHr,
      restingHr: restHr,
      hrv: initialValues?.hrv ?? '',
      mood: initialValues?.mood ?? '',
      fatigue: initialValues?.fatigue ?? '',
      soreness: initialValues?.soreness ?? '',
      sleep: initialValues?.sleep ?? '',
      stress: initialValues?.stress ?? '',
      notes: initialValues?.notes ?? '',
      description: initialValues?.description ?? '',
    };
  });

  const update = (key, value) => setValues((current) => {
    const next = { ...current, [key]: value };
    next.trimps = calculateTrimps(next.minutes, next.averageHr, next.restingHr, athleteProfile);
    return next;
  });
  const supportsIntervals = /series|umbral|cuesta|interval|repeticion|repetición|fartlek|velocidad/i.test(`${session.type} ${session.blocks}`);
  const isRestDay = /descanso/i.test(session.type);
  const hasOptionalWorkoutDetails = hasWorkoutDetailOption(session);
  const isRaceOrTest = /competici[oó]n|test/i.test(session.type);
  const showWorkoutData = !isRestDay && completionStatus !== 'missed';
  const showSeriesSection = showWorkoutData && (hasOptionalWorkoutDetails || supportsIntervals);

  const missingWellbeing = missingWellbeingFields(values);
  const wellbeingDone = wellbeingFields.length - missingWellbeing.length;

  // Cambios sin guardar: se compara con el estado inicial del formulario.
  const snapshot = JSON.stringify({ values, injuries, completionStatus, trainingDetailsEnabled, workoutDetailSections, selectedRegion, intervalDraft });
  const initialSnapshot = useRef(snapshot);
  const isDirty = snapshot !== initialSnapshot.current;
  const requestClose = () => (isDirty ? setConfirmDiscard(true) : onClose());
  const closeRef = useRef(requestClose);
  closeRef.current = requestClose;
  const confirmRef = useRef(confirmDiscard);
  confirmRef.current = confirmDiscard;

  // Foco inicial, Escape para cerrar y devolución del foco al cerrar.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    (formRef.current?.querySelector('[data-autofocus]') || formRef.current?.querySelector('.wellbeing-range'))?.focus();
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (confirmRef.current) setConfirmDiscard(false);
      else closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, []);

  // Mantiene el tabulador dentro del modal.
  const trapFocus = (event) => {
    if (event.key !== 'Tab' || !formRef.current) return;
    const items = [...formRef.current.querySelectorAll(FOCUSABLE)].filter((element) => element.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const importStravaDemo = () => {
    setStravaConnected(true);
    setValues((current) => ({
      ...current,
      distance: isCycling ? '24.5' : '9.6',
      minutes: '58',
      speed: isCycling ? '25.3' : '',
      pace: isCycling ? '' : '6:04',
      averageHr: '154',
      trimps: calculateTrimps('58', '154', current.restingHr, athleteProfile),
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (missingWellbeing.length) {
      setShowErrors(true);
      document.getElementById(`journal-wellbeing-${missingWellbeing[0][0]}`)?.focus();
      return;
    }
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
      ...(workoutNotDone ? { distance: '', minutes: '', trimps: '', pace: '', speed: '', averageHr: '', description: '' } : {}),
      speed: workoutNotDone ? '' : (values.speed || (isCycling && values.distance && values.minutes ? calculateSpeed(values.minutes, values.distance) : '')),
      pace: workoutNotDone || isCycling ? '' : values.pace,
      injuries: savedInjuries,
      completionStatus,
      trainingDetailsEnabled: workoutNotDone ? false : trainingDetailsEnabled,
      workoutDetailSections: workoutNotDone || !trainingDetailsEnabled ? [] : workoutDetailSections,
      trimps: workoutNotDone ? '' : (values.trimps || calculateTrimps(values.minutes, values.averageHr, values.restingHr, athleteProfile)),
    });
  };

  return (
    // Hacer clic fuera NO cierra el registro: así no se pierde lo escrito por accidente.
    <div className="modal-backdrop">
      <form ref={formRef} className="modal journal-modal" role="dialog" aria-modal="true" aria-labelledby="journal-title" noValidate onSubmit={submit} onKeyDown={trapFocus}>
        <button className="modal-close" type="button" onClick={requestClose} aria-label="Cerrar">×</button>
        <div className="eyebrow">DIARIO DE ENTRENAMIENTO · {session.day.toUpperCase()} {(session.dateLabel || `${session.date} ${session.month || ''}`).trim().toUpperCase()}</div>
        <h2 id="journal-title">{session.type}</h2>
        <p className="muted">Registra cómo estás hoy y cómo ha ido el entrenamiento. Los campos con * son obligatorios.</p>

        {!isRestDay && <fieldset className="journal-fieldset workout-completion-fieldset">
          <legend>¿Has realizado el entrenamiento?</legend>
          <div className="workout-completion-options">
            {[
              ['completed', 'Completado', '✓'],
              ['partial', 'A medias', '◐'],
              ['missed', 'No realizado', '×'],
            ].map(([status, label, icon]) => <label className={`workout-completion-option ${status} ${completionStatus === status ? 'selected' : ''}`} key={status}>
              <input type="radio" name="workout-completion" value={status} checked={completionStatus === status} onChange={() => setCompletionStatus(status)} data-autofocus={completionStatus === status ? true : undefined} />
              <span className="workout-completion-icon" aria-hidden="true">{icon}</span><b>{label}</b>
            </label>)}
          </div>
        </fieldset>}

        <fieldset className={`journal-fieldset wellbeing-fieldset journal-core ${showErrors && missingWellbeing.length ? 'has-errors' : ''}`}>
          <legend>Bienestar de hoy <span className="journal-required-mark" aria-hidden="true">*</span> <InfoTip term="wt" /></legend>
          <div className="wellbeing-heading-row">
            <p className="wellbeing-help">Es la base del diario. Todas las escalas van en el mismo sentido: 1 es lo mejor (verde) y 10 lo peor (rojo).</p>
            <span className={`wellbeing-progress ${missingWellbeing.length ? '' : 'complete'}`} aria-live="polite">{wellbeingDone} de {wellbeingFields.length}</span>
          </div>
          <div className="wellbeing-ranges">
            {wellbeingScales.map(({ key, label, low, high }) => (
              <RangeField
                key={key}
                low={low}
                high={high}
                id={`journal-wellbeing-${key}`}
                label={label}
                value={values[key]}
                onChange={(value) => update(key, value)}
                required
                invalid={showErrors && missingWellbeing.some(([missingKey]) => missingKey === key)}
              />
            ))}
          </div>
        </fieldset>

        {showWorkoutData && <fieldset className="journal-fieldset journal-core">
          <legend>Datos del entrenamiento</legend>
          <div className="journal-strava-connect">
            <div><b>Strava</b><small>{stravaConnected ? 'Actividad de ejemplo importada' : 'Prototipo · importa una actividad de ejemplo'}</small></div>
            <button className="button strava-brand-button" type="button" onClick={importStravaDemo}>{stravaConnected ? 'Actualizar actividad' : 'Conectar con Strava'}</button>
          </div>
          <div className="journal-input-grid">
            <NumberField label="Distancia" unit="km" value={values.distance} onChange={(value) => update('distance', value)} step="0.1" />
            <NumberField label="Duración" unit="min" value={values.minutes} onChange={(value) => update('minutes', value)} />
            {isCycling ? (
              <NumberField label="Velocidad media" unit="km/h" value={values.speed} onChange={(value) => update('speed', value)} step="0.1" placeholder="25.0" />
            ) : (
              <TextField label="Ritmo medio" unit="min/km" value={values.pace} onChange={(value) => update('pace', value)} placeholder="5:20" />
            )}
            <NumberField label="FC media" unit="ppm" value={values.averageHr} onChange={(value) => update('averageHr', value)} />
          </div>
          <TrimpCard
            trimp={values.trimps}
            athleteProfile={athleteProfile}
            hasMinutes={Boolean(values.minutes)}
            hasHr={Boolean(values.averageHr)}
            hasRestHr={Boolean(values.restingHr)}
          />
        </fieldset>}

        <label className="field-label journal-notes">Sensaciones y notas del día<textarea rows="2" value={values.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Cómo te has sentido, contexto o comentarios" /></label>

        <div className="journal-optional-group">
          <div className="eyebrow">MÁS DETALLES · OPCIONAL</div>

          {showSeriesSection && <details className="journal-optional" open={trainingDetailsEnabled || Boolean(values.description)}>
            <summary><span>Series y bloques</span><small>{trainingDetailsEnabled ? 'Detalle activado' : 'Tiempos de cada serie o bloque'}</small></summary>
            <div className="journal-optional-body">
              {hasOptionalWorkoutDetails && <>
                {isRaceOrTest && <p className="workout-detail-note">La sección de entrenamiento detallado está destinada a la carrera exclusivamente, mientras que los valores de distancia y sensaciones normales están destinados al día en conjunto, calentamiento, carrera (o test) y enfriamiento.</p>}
                <label className="workout-detail-toggle">
                  <input type="checkbox" checked={trainingDetailsEnabled} onChange={(event) => setTrainingDetailsEnabled(event.target.checked)} />
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
              </>}
              {supportsIntervals && <div className="journal-interval-capture">
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
              </div>}
            </div>
          </details>}

          {!hidePersonalFields && <details className="journal-optional" open={Boolean(values.restingHr || values.hrv)}>
            <summary><span>Salud</span><small>{values.restingHr || values.hrv ? [values.restingHr && `FC reposo ${values.restingHr} ppm`, values.hrv && `HRV ${values.hrv} ms`].filter(Boolean).join(' · ') : 'FC en reposo y HRV'}</small></summary>
            <div className="journal-optional-body">
              <div className="journal-input-grid">
                <NumberField label="FC en reposo" unit="ppm" value={values.restingHr} onChange={(value) => update('restingHr', value)} />
                <NumberField label="HRV" unit="ms" value={values.hrv} onChange={(value) => update('hrv', value)} />
              </div>
            </div>
          </details>}

          {!hidePersonalFields && <details className="journal-optional injury-fieldset" open={injuries.length > 0}>
            <summary><span>Molestias</span><small>{injuries.length ? `${injuries.length} ${injuries.length === 1 ? 'molestia registrada' : 'molestias registradas'}` : 'Sin molestias registradas'}</small></summary>
            <div className="journal-optional-body">
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
                {selectedRegion === 'otro' && <label className="field-label">Indica la parte del cuerpo<input value={otherRegion} onChange={(event) => setOtherRegion(event.target.value)} placeholder="Ej. zona lumbar" /></label>}
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
            </div>
          </details>}
        </div>

        {showErrors && missingWellbeing.length > 0 && <div className="journal-error-summary" role="alert">
          <b>Falta completar el bienestar de hoy</b>
          <span>Indica un valor para: {missingWellbeing.map(([, label]) => label).join(', ')}.</span>
        </div>}

        {confirmDiscard ? <div className="journal-discard-bar" role="alertdialog" aria-labelledby="journal-discard-text">
          <span id="journal-discard-text">Tienes cambios sin guardar. ¿Quieres descartar este registro?</span>
          <div className="inline-actions">
            <button className="button secondary" type="button" autoFocus onClick={() => setConfirmDiscard(false)}>Seguir editando</button>
            <button className="button danger" type="button" onClick={onClose}>Descartar cambios</button>
          </div>
        </div> : <div className="inline-actions">
          <button className="button secondary" type="button" onClick={requestClose}>Cancelar</button>
          <button className="button primary" type="submit">Guardar registro</button>
        </div>}
      </form>
    </div>
  );
}

function TrimpCard({ trimp, athleteProfile, hasMinutes, hasHr, hasRestHr }) {
  const badge = getTrimpBadge(trimp);
  const fcMax = athleteProfile?.fcMax || 200;
  const coefficient = trimpCoefficient(athleteProfile?.sex);
  const k = String(coefficient.k).replace('.', ',');

  return (
    <div className={`journal-trimp-card ${trimp ? 'has-value' : 'empty'}`}>
      <div className="journal-trimp-card-header">
        <div className="journal-trimp-label-group">
          <span className="journal-trimp-icon" aria-hidden="true">⚡</span>
          <div>
            <b>Impulso de entrenamiento (TRIMP) <InfoTip term="trimp" /></b>
            <small>Fórmula Banister · FC máx: {fcMax} ppm · {coefficient.label} (k = {k}{coefficient.isDefault ? ' por defecto' : ''})</small>
          </div>
        </div>
        {badge && (
          <span className={`trimp-impact-badge ${badge.tone}`}>
            <span className="trimp-badge-dot" />
            <span>{badge.label}</span>
            <small>· {badge.category}</small>
          </span>
        )}
      </div>

      {trimp ? (
        <div className="journal-trimp-card-body">
          <div className="journal-trimp-value-display">
            <strong>{trimp}</strong>
            <span>TRIMPS</span>
          </div>
          <div className="journal-trimp-info">
            <p className="journal-trimp-category-desc">{badge?.description}</p>
            {!hasRestHr && (
              <small className="journal-trimp-tip">
                💡 Consejo: Añade tu FC en reposo en la sección de Salud para afinar la reserva cardíaca.
              </small>
            )}
          </div>
        </div>
      ) : (
        <div className="journal-trimp-empty-guide">
          <span>ℹ️</span>
          <p>
            {!hasMinutes && !hasHr
              ? 'Introduce duración y FC media para calcular el TRIMP en tiempo real.'
              : !hasMinutes
                ? 'Introduce la duración para completar el cálculo de TRIMP.'
                : 'Introduce la FC media para calcular el TRIMP exponencial.'}
          </p>
        </div>
      )}
    </div>
  );
}
