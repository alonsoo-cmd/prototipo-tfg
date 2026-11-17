import DatePicker from '../ui/DatePicker.jsx';
import Metric from '../ui/Metric.jsx';
import { pendingRequest } from '../../data/preparationRequest.js';
import { formatLongDate } from '../../utils/format.js';

const targetDistances = ['400 m', '800 m', '1.500 m', '3.000 m', '5 km', '10 km', 'Media maratón', 'Maratón'];

/** Atleta: formulario para solicitar una preparación a un entrenador. */
export function PreparationRequestForm({ coachName, requestDate, setRequestDate, onSubmit }) {
  return <>
    <div className="eyebrow">SOLICITUD DE PREPARACIÓN{coachName ? ` · ${coachName.toUpperCase()}` : ''}</div>
    <h2 id="app-modal-title">Cuéntanos tu objetivo</h2>
    <p className="muted">La solicitud se enviará a {coachName || 'el entrenador'} para su revisión. Solo puedes tener un entrenador: mientras esté pendiente no podrás pedir otra.</p>
    <label className="field-label">Fecha objetivo<DatePicker value={requestDate} onChange={setRequestDate} ariaLabel="Elegir fecha objetivo" /></label>
    <label className="field-label">Distancia objetivo<select defaultValue="10 km">
      {targetDistances.map((distance) => <option key={distance}>{distance}</option>)}
    </select></label>
    <label className="field-label">Comentario opcional<textarea rows="3" placeholder="Fechas, contexto o información útil" /></label>
    <button className="button primary full" onClick={onSubmit}>Enviar solicitud</button>
  </>;
}

/** Atleta: confirmación de solicitud enviada. */
export function RequestSentNotice({ coachName, onBack }) {
  return <div className="center-state">
    <div className="success-icon">✓</div>
    <div className="eyebrow">SOLICITUD ENVIADA</div>
    <h2 id="app-modal-title">Solicitud registrada</h2>
    <p>{coachName || 'El entrenador'} recibirá los datos de tu objetivo y fechas. Te avisaremos cuando responda.</p>
    <button className="button primary" onClick={onBack}>Volver a Inicio</button>
  </div>;
}

/** Entrenador: revisión de una solicitud recibida. */
export function RequestReview({ onReject, onAccept }) {
  return <>
    <div className="eyebrow">SOLICITUD RECIBIDA · {pendingRequest.receivedAgo.toUpperCase()}</div>
    <h2 id="app-modal-title">{pendingRequest.name}</h2>
    <div className="detail-metrics">
      <Metric label="Distancia" value={pendingRequest.distance} />
      <Metric label="Fecha objetivo" value={formatLongDate(pendingRequest.eventDate)} />
      <Metric label="Ubicación" value={pendingRequest.location} />
    </div>
    <p className="muted">“{pendingRequest.message}”</p>
    <div className="inline-actions">
      <button className="button secondary" onClick={onReject}>Rechazar</button>
      <button className="button primary" onClick={onAccept}>Aceptar solicitud</button>
    </div>
  </>;
}
