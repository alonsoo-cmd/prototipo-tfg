import { useMemo, useState } from 'react';
import { coaches, coachLocations, coachSpecialties } from '../../data/coaches.js';
import ModalShell from '../../components/modals/ModalShell.jsx';
import Metric from '../../components/ui/Metric.jsx';

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('es-ES');

/**
 * Directorio de entrenadores para un atleta sin preparación.
 * Un atleta solo puede tener un entrenador: con una solicitud enviada no se puede pedir otra.
 */
export default function FindCoach({ onRequest, requestCoach = null }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [profile, setProfile] = useState(null);

  const results = useMemo(() => coaches.filter((coach) =>
    normalize(coach.name).includes(normalize(query.trim()))
    && (!location || coach.location === location)
    && (!specialty || coach.specialty === specialty)), [query, location, specialty]);
  const hasFilters = Boolean(query || location || specialty);
  const clearFilters = () => { setQuery(''); setLocation(''); setSpecialty(''); };

  const requestButton = (coach, className = 'primary') => {
    if (requestCoach) {
      const isRequested = requestCoach === coach.name;
      return <button className={`button ${isRequested ? 'primary' : 'secondary'}`} disabled>{isRequested ? 'Solicitud enviada' : 'Solicitar preparación'}</button>;
    }
    return <button className={`button ${className}`} onClick={() => { setProfile(null); onRequest(coach.name); }}>Solicitar preparación</button>;
  };

  return <div className="content">
    <div className="page-heading">
      <div>
        <div className="eyebrow">DIRECTORIO</div>
        <h1>Encuentra un entrenador</h1>
        <p>Consulta perfiles y solicita una preparación. Solo puedes tener un entrenador.</p>
      </div>
    </div>
    {requestCoach && <p className="find-coach-pending" role="status">Has enviado una solicitud a <b>{requestCoach}</b>. Mientras esté pendiente no puedes solicitar otra preparación.</p>}

    <div className="search-row find-coach-filters">
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <input type="search" placeholder="Buscar por nombre" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar entrenador por nombre" />
      </label>
      <select className="find-coach-select" value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filtrar por ubicación">
        <option value="">Ubicación: todas</option>
        {coachLocations.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select className="find-coach-select" value={specialty} onChange={(event) => setSpecialty(event.target.value)} aria-label="Filtrar por especialidad">
        <option value="">Especialidad: todas</option>
        {coachSpecialties.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </div>
    <p className="find-coach-count" aria-live="polite">
      {results.length} {results.length === 1 ? 'entrenador' : 'entrenadores'}
      {hasFilters && <button type="button" className="text-button" onClick={clearFilters}>Quitar filtros</button>}
    </p>

    <div className="coach-results">
      {results.map((coach) => <article className="coach-card" key={coach.id}>
        <div className="coach-avatar">{coach.initials}</div>
        <div className="coach-info">
          <div className="coach-card-heading">
            <div>
              <h2>{coach.name}</h2>
              <p>{coach.location} <span>·</span> {coach.title}</p>
            </div>
            {coach.verified && <span className="verified">✓ Verificado</span>}
          </div>
          <p>{coach.bio}</p>
          <div className="tag-row">
            <span>{coach.specialty}</span>
            <span>{coach.modality}</span>
            <span>{coach.experience} años de experiencia</span>
          </div>
        </div>
        <div className="coach-card-actions">
          <button className="button secondary" onClick={() => setProfile(coach)}>Ver perfil</button>
          {requestButton(coach)}
        </div>
      </article>)}
      {!results.length && <div className="empty-inline">
        <b>Ningún entrenador coincide con la búsqueda</b>
        <p>Prueba con otra ubicación o especialidad.</p>
        <button type="button" className="button secondary" onClick={clearFilters}>Quitar filtros</button>
      </div>}
    </div>

    {profile && <ModalShell onClose={() => setProfile(null)} labelledBy="coach-profile-title">
      <div className="eyebrow">PERFIL DEL ENTRENADOR{profile.verified ? ' · VERIFICADO' : ''}</div>
      <h2 id="coach-profile-title">{profile.name}</h2>
      <p className="muted">{profile.title} · {profile.location} · {profile.modality}</p>
      <div className="detail-metrics">
        <Metric label="Especialidad" value={profile.specialty} />
        <Metric label="Experiencia" value={`${profile.experience} años`} />
        <Metric label="Atletas" value={profile.athletes} />
      </div>
      <div className="section-block"><h3>Sobre su trabajo</h3><p>{profile.bio}</p></div>
      <div className="section-block"><h3>Cómo planifica</h3><p>{profile.approach}</p></div>
      <div className="section-block"><h3>Formación y logros</h3><ul className="coach-profile-list">{profile.achievements.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="inline-actions">
        <button className="button secondary" onClick={() => setProfile(null)}>Cerrar</button>
        {requestButton(profile)}
      </div>
    </ModalShell>}
  </div>;
}
