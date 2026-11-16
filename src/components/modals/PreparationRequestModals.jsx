import DatePicker from '../ui/DatePicker.jsx';
import Metric from '../ui/Metric.jsx';

const targetDistances = ['400 m', '800 m', '1.500 m', '3.000 m', '5 km', '10 km', 'Media maratón', 'Maratón'];

/** Atleta: formulario para solicitar una preparación a un entrenador. */
export function PreparationRequestForm({ requestDate, setRequestDate, onSubmit }) {
  return <>
    <div className="eyebrow">SOLICITUD DE PREPARACIÓN</div>
    <h2>Cuéntanos tu objetivo</h2>
    <p className="muted">La solicitud se enviará al entrenador para su revisión.</p>
    <label className="field-label">Fecha objetivo<DatePicker value={requestDate} onChange={setRequestDate} ariaLabel="Elegir fecha objetivo" /></label>
    <label className="field-label">Distancia objetivo<select defaultValue="10 km">
      {targetDistances.map((distance) => <option key={distance}>{distance}</option>)}
    </select></label>
    <label className="field-label">Comentario opcional<textarea rows="3" placeholder="Fechas, contexto o información útil" /></label>
    <button className="button primary full" onClick={onSubmit}>Enviar solicitud</button>
  </>;
}

/** Atleta: confirmación de solicitud enviada. */
export function RequestSentNotice({ onBack }) {
  return <div className="center-state">
    <div className="success-icon">✓</div>
    <div className="eyebrow">SOLICITUD ENVIADA</div>
    <h2>Solicitud registrada</h2>
    <p>El entrenador recibirá los datos de tu objetivo y fechas.</p>
    <button className="button primary" onClick={onBack}>Volver al diario</button>
  </div>;
}

/** Entrenador: revisión de una solicitud recibida. */
export function RequestReview({ onReject, onAccept }) {
  return <>
    <div className="eyebrow">SOLICITUD RECIBIDA · HACE 2 H</div>
    <h2>Lucía Fernández</h2>
    <div className="detail-metrics">
      <Metric label="Distancia" value="Media maratón" />
      <Metric label="Fecha objetivo" value="6 dic 2026" />
      <Metric label="Ubicación" value="Madrid" />
    </div>
    <p className="muted">“Estoy preparando mi primera media maratón. Me gustaría empezar en septiembre.”</p>
    <div className="inline-actions">
      <button className="button secondary" onClick={onReject}>Rechazar</button>
      <button className="button primary" onClick={onAccept}>Aceptar solicitud</button>
    </div>
  </>;
}
