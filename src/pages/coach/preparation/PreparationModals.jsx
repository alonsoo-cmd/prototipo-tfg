import { useState } from 'react';
import DatePicker from '../../../components/ui/DatePicker.jsx';
import ModalShell from '../../../components/modals/ModalShell.jsx';
import { workoutColor } from '../../../data/coachAthletes.js';
import { format } from '../../../utils/format.js';

export function NewPreparationModal({ athlete, onClose, onCreate }) {
  const [eventDate, setEventDate] = useState('');
  const [noSpecificGoal, setNoSpecificGoal] = useState(false);
  const [preparationName, setPreparationName] = useState('');
  return <ModalShell as="form" wide className="new-preparation-modal" labelledBy="new-preparation-title" onClose={onClose} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      onCreate({ athlete, preparationName: data.get('preparationName'), duration: data.get('duration'), objectiveName: data.get('objectiveName'), distance: data.get('distance'), eventDate, noSpecificGoal: data.has('noSpecificGoal') });
    }}>
      <div className="eyebrow">NUEVA PREPARACIÓN</div><h2 id="new-preparation-title">{athlete.name}</h2>
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
  </ModalShell>;
}

export function OverviewModal({ title, onClose, children }) {
  return <ModalShell wide className="overview-modal" labelledBy="overview-title" onClose={onClose}>
    <h2 id="overview-title">{title}</h2>
    <div className="overview-list">{children}</div>
  </ModalShell>;
}

/**
 * Elegir una plantilla para un día con clic (alternativa accesible a arrastrar).
 * Funciona igual con ratón, teclado y pantallas táctiles.
 */
export function TemplatePickerModal({ day, templates, onPick, onClose }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const types = [...new Set(templates.map((template) => template.type))];
  const visible = templates.filter((template) => typeFilter === 'all' || template.type === typeFilter);

  return <ModalShell onClose={onClose} wide labelledBy="template-picker-title">
    <div className="eyebrow">PLANIFICAR · {day.day.toUpperCase()} {day.date} {(day.month || '').toUpperCase()}</div>
    <h2 id="template-picker-title">Usar una plantilla</h2>
    <p className="muted">Elige un entrenamiento predefinido para el {day.day.toLocaleLowerCase('es-ES')}. {day.type ? `Sustituirá a «${day.type}». Podrás deshacerlo.` : ''}</p>
    <label className="field-label template-picker-filter">Tipo<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
      <option value="all">Todos ({templates.length})</option>
      {types.map((type) => <option key={type} value={type}>{type}</option>)}
    </select></label>
    {visible.length ? <ul className="template-picker-list">
      {visible.map((template) => <li key={template.id}>
        <button type="button" className={`template-picker-option workout-color-${workoutColor(template.type)}`} onClick={() => onPick(template)}>
          <b>{template.type}</b>
          <span>{template.desc || template.blocks || 'Sin descripción'}</span>
          <small>{template.mins || 0} min · {format(template.km)} km</small>
        </button>
      </li>)}
    </ul> : <p className="muted">No hay plantillas de este tipo.</p>}
  </ModalShell>;
}
