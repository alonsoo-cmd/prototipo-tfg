import { isSubKilometerSeries, isValidDuration } from './workoutDetailSections.js';
import { TermLabel } from '../ui/InfoTip.jsx';

export function WorkoutDetailRow({ item, index, fields, allowHundredths = false, showCompletion = false, onChange }) {
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
        if (field === 'speed') return <label className="field-label" key={field}>Velocidad <small className="journal-unit">km/h</small><input type="number" step="0.1" min="0" value={item.speed || ''} onChange={(event) => onChange(field, event.target.value)} placeholder="Ej. 25.5" /></label>;
        if (field === 'sets' || field === 'reps') return <label className="field-label" key={field}>{field === 'sets' ? 'Series' : 'Repeticiones'}<input type="number" min="0" step="1" value={item[field]} onChange={(event) => onChange(field, event.target.value)} placeholder="—" /></label>;
        if (field === 'weight') return <label className="field-label" key={field}>Peso <small className="journal-unit">kg / %</small><input type="text" pattern="[0-9]+([.,][0-9]+)?%?" title="Introduce un número o un porcentaje, por ejemplo 40 o 80%" aria-invalid={invalidWeight} value={item.weight} onChange={(event) => onChange(field, event.target.value)} placeholder="Ej. 40 o 80%" />{invalidWeight && <small className="workout-detail-field-error">Usa un número o un número seguido de %</small>}</label>;
        return null;
      })}
    </div>
  </div>;
}

export function NumberField({ label, unit, value, onChange, step = '1' }) {
  return (
    <label className="field-label">
      <TermLabel>{label}</TermLabel>{unit && <small className="journal-unit">{unit}</small>}
      <input aria-label={unit ? `${label} (${unit})` : label} type="number" min="0" step={step} value={value} onChange={(event) => onChange(event.target.value)} placeholder="—" />
    </label>
  );
}

export function TextField({ label, unit, value, onChange, placeholder }) {
  return (
    <label className="field-label">
      <TermLabel>{label}</TermLabel>{unit && <small className="journal-unit">{unit}</small>}
      <input aria-label={unit ? `${label} (${unit})` : label} type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

const RANGE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

export function RangeField({ id, label, value, onChange, required = false, invalid = false, low = 'Verde', high = 'Rojo' }) {
  const selectedValue = value === '' || value === undefined || value === null ? null : Number(value);
  const isEmpty = selectedValue === null;
  const color = isEmpty ? '#636f7d' : `hsl(${120 - (selectedValue - 1) * (120 / 9)} 58% 38%)`;
  // Sin valor el control se dibuja en 1; al tocarlo por primera vez se registra 1
  // para que también se pueda elegir ese valor (si no, no habría evento change).
  const claimIfEmpty = () => { if (isEmpty) onChange('1'); };

  return (
    <label className={`wellbeing-range-field ${invalid ? 'is-missing' : ''}`}>
      <span className="wellbeing-range-heading">
        <b>{label}{required && <span className="journal-required-mark" aria-hidden="true"> *</span>}</b>
        <strong style={{ color }}>{selectedValue ?? '—'}<small>{isEmpty ? 'Sin registrar' : '/ 10'}</small></strong>
      </span>
      <input
        id={id}
        className={`wellbeing-range ${isEmpty ? 'is-empty' : ''}`}
        type="range"
        min="1"
        max="10"
        step="1"
        value={selectedValue ?? 1}
        aria-label={`${label}, de 1 (${low.toLocaleLowerCase('es-ES')}) a 10 (${high.toLocaleLowerCase('es-ES')})`}
        aria-valuetext={isEmpty ? 'Sin registrar' : `${selectedValue} de 10`}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        onPointerDown={claimIfEmpty}
        onKeyDown={(event) => { if (RANGE_KEYS.includes(event.key)) claimIfEmpty(); }}
        onChange={(event) => onChange(event.target.value)}
      />
      {invalid ? <span className="wellbeing-range-error" role="alert">Indica un valor del 1 al 10</span>
        : <span className="wellbeing-range-ends"><span>1 · {low}</span><span>10 · {high}</span></span>}
    </label>
  );
}
