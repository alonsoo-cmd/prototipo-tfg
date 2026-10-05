export default function FindCoach({onRequest,sent,setSent}){return <div className="content">
    <div className="page-heading">
    <div>
    <div className="eyebrow">DIRECTORIO</div>
    <h1>Encuentra un entrenador</h1>
    <p>Consulta perfiles y solicita una preparación.</p>
    </div>
    </div>
    <div className="search-row">
    <div className="search-field">
    <span>⌕</span>
    <input placeholder="Buscar por nombre" defaultValue=""/>
    
    </div>
    <button className="button secondary">Ubicación: Todas⌄</button>
    <button className="button secondary">Especialidad⌄</button>
    </div>
    <div className="coach-results">
    <article className="coach-card">
    <div className="coach-avatar">CR</div>
    <div className="coach-info">
    <div className="coach-card-heading">
    <div>
    <h2>Carlos Ruiz</h2>
    <p>Madrid, España <span>·</span> Entrenador de atletismo</p>
    </div>
    <span className="verified">✓ Verificado</span>
    </div>
    <p>Especialista en medio fondo y fondo. Planificación individual y seguimiento semanal de carga y sesiones.</p>
    <div className="tag-row">
    <span>Carrera de fondo</span>
    <span>Atletismo</span>
    <span>Presencial y online</span>
    </div>
    </div>
    <button className="button primary" onClick={onRequest}>{sent?'Solicitud enviada':'Request Preparation'}</button>
    </article>
    <article className="coach-card">
    <div className="coach-avatar alt">LM</div>
    <div className="coach-info">
    <div className="coach-card-heading">
    <div>
    <h2>Lucía Morales</h2>
    <p>Alcalá de Henares <span>·</span> Entrenadora de running</p>
    </div>
    </div>
    <p>Preparación de pruebas populares y planificación de temporada para atletas de distintos niveles.</p>
    <div className="tag-row">
    <span>10K y media maratón</span>
    <span>Online</span>
    </div>
    </div>
    <button className="button secondary" onClick={onRequest}>Ver perfil</button>
    </article>
    </div>
    </div>}
