import Metric from '../ui/Metric.jsx';
import { format } from '../../utils/format.js';

/** Detalle de una sesión planificada (contenido del modal). */
export default function SessionDetailModal({ session, onRegister, onClose }) {
  return <>
    <div className="eyebrow">{session.day} · {session.dateLabel || `${session.date} OCT`}</div>
    <h2>{session.type}</h2>
    <div className="modal-status">
      <span className={'dot-status ' + session.tone} />
      {session.state}<span className="separator">·</span>{session.time}
    </div>
    <div className="detail-metrics">
      <Metric label="Duración" value={`${session.mins} min`} />
      <Metric label="Distancia" value={`${format(session.km)} km`} />
      <Metric label="TRIMPS" value={session.tr} />
    </div>
    <div className="section-block">
      <h3>Comentario del entrenador</h3>
      <p>{session.blocks}</p>
    </div>
    {session.shoes && <div className="section-block session-shoes-note"><h3>Zapatillas recomendadas</h3><p>👟 {session.shoes}</p></div>}
    {session.details?.conditioningBlocks?.length > 0 && <div className="section-block session-conditioning-details">
      <h3>Bloques de acondicionamiento</h3>
      {session.details.conditioningBlocks.map((block, index) => <div className="session-conditioning-block" key={`${block.type}-${index}`}>
        <strong>{block.type}</strong>
        {block.volume && <span>{block.volume}</span>}
        {block.exercises && <p>{block.exercises}</p>}
        {block.comment && <small>{block.comment}</small>}
      </div>)}
    </div>}
    {session.details?.rpeMin != null && <div className="session-effort-range">
      <h3>Esfuerzo estimado</h3>
      <div className="session-range-values"><strong>RPE {session.details.rpeMin}–{session.details.rpeMax}</strong><small>Escala 1–10</small></div>
      {session.details.paceFrom && session.details.paceTo && <div className="session-range-values"><span>Ritmo</span><strong>{session.details.paceFrom}–{session.details.paceTo} min/km</strong></div>}
      {session.details.speedFrom && session.details.speedTo && <div className="session-range-values"><span>Velocidad</span><strong>{session.details.speedFrom}–{session.details.speedTo} km/h</strong></div>}
      {session.details.hrMin && session.details.hrMax && <div className="session-range-values"><span>Pulsaciones</span><strong>{session.details.hrMin}–{session.details.hrMax} ppm</strong></div>}
    </div>}
    <div className="inline-actions">
      <button className="button secondary" onClick={onRegister}>Registrar actividad</button>
      <button className="button primary" onClick={onClose}>Cerrar</button>
    </div>
  </>;
}
