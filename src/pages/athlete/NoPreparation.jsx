/**
 * Inicio y Diario de un atleta o entrenador sin preparación activa.
 * El entrenador puede, además, crear su propia preparación (`onSelfPrepare`).
 * Un atleta solo puede tener un entrenador: si ya ha enviado una solicitud,
 * se muestra como pendiente en lugar de invitarle a buscar otro.
 */
export default function NoPreparation({ requestCoach, onFindCoach, onSelfPrepare = null }) {
  if (requestCoach) {
    return <div className="content empty-page">
      <div className="empty-card">
        <div className="empty-graphic">✓</div>
        <div className="eyebrow">SOLICITUD PENDIENTE</div>
        <h1>Esperando a {requestCoach}</h1>
        <p>Cuando acepte tu solicitud, aquí verás tu calendario de entrenamiento y podrás registrar tus sesiones.</p>
        <button className="text-button" onClick={onFindCoach}>Ver la solicitud enviada →</button>
      </div>
    </div>;
  }

  return <div className="content empty-page">
    <div className="empty-card">
      <div className="empty-graphic">↗</div>
      <div className="eyebrow">SIN PREPARACIÓN</div>
      <h1>Empieza una preparación</h1>
      <p>{onSelfPrepare
        ? 'Como entrenador puedes planificarte tú mismo o pedir una preparación a otro entrenador.'
        : 'Encuentra un entrenador y define un objetivo para organizar tu calendario de entrenamiento.'}</p>
      {onSelfPrepare && <button className="button primary large" onClick={onSelfPrepare}>Crear mi propia preparación <span>→</span></button>}
      <button className={`button ${onSelfPrepare ? 'secondary' : 'primary'} large`} onClick={onFindCoach}>Buscar entrenador <span>→</span></button>
    </div>
  </div>;
}
