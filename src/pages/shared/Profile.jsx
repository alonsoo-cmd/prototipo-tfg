import { useState } from 'react';
import InfoTip from '../../components/ui/InfoTip.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { initialAthleteProfile, initialCoachExperience } from '../../data/initialState.js';
import { glossary } from '../../domain/glossary.js';
import { formatLongDate } from '../../utils/format.js';
import CoachExperienceSection from './profile/CoachExperienceSection.jsx';

const raceMarks = [
  ['400 m', '400 m'], ['800 m', '800 m'], ['1.500 m', '1.500 m'],
  ['3.000 m', '3.000 m'], ['5.000 m / 5K', '5.000 m'],
  ['10.000 m / 10K', '10.000 m'], ['Media maratón', '21,1 km'], ['Maratón', '42,2 km'],
];

const preciseRaces = new Set(['400 m', '800 m', '1.500 m']);
const longRaces = new Set(['10.000 m', '21,1 km', '42,2 km']);
const minutesSecondsPattern = '(0?[0-9]|[1-5][0-9]|60):[0-5][0-9]';
const hundredthsPattern = `${minutesSecondsPattern}([.,][0-9]{2})?`;
const hoursPattern = '([0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]';

const rmPercentages = [10, 20, 30, 40, 50, 60, 70, 80, 90];

/** Perfil único para atleta, grupo y entrenador: mismas secciones para todos; el entrenador añade su experiencia. */
export default function Profile({ role = 'atleta', preparation = null, email = 'alex.martin@example.com', athleteProfile = initialAthleteProfile, coachExperience = initialCoachExperience, onSaveCoachExperience = () => {} }) {
  // Datos de la cuenta: se fijan en el registro y no se editan desde el perfil.
  const name = 'Alex Martín';
  const birthDate = '1998-04-12';
  const gender = 'No especificado';
  const [club, setClub] = useState('');
  const [specialty, setSpecialty] = useState('Carrera de fondo');
  const [about, setAbout] = useState('Corredor amateur. Entrenamiento de fondo y pista.');
  const [photo, setPhoto] = useState('');
  const [marks, setMarks] = useState({});
  const [selectedRaces, setSelectedRaces] = useState([]);
  const [raceToAdd, setRaceToAdd] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [garminUrl, setGarminUrl] = useState('');
  const [toast, setToast] = useState('');
  // Borrador de la experiencia del entrenador: solo se conserva al pulsar «Guardar cambios».
  const isCoach = role === 'entrenador';
  const [experience, setExperience] = useState(coachExperience);
  const experienceUnsaved = isCoach && JSON.stringify(experience) !== JSON.stringify(coachExperience);
  const objectives = preparation?.objectives || [];
  const fcMax = athleteProfile.fcMax;
  const maxLifts = athleteProfile.maxLifts || [];
  // La VAM se alcanza a la FC máxima, así que no guarda una FC propia.
  const thresholds = [
    { code: 'LT1', name: 'Umbral de lactato\u00a01', ...athleteProfile.lt1 },
    { code: 'LT2', name: 'Umbral de lactato\u00a02', ...athleteProfile.lt2 },
    { code: 'VAM', name: 'Velocidad aeróbica máxima', ...athleteProfile.vam, hr: fcMax },
  ].filter((item) => item.paceSeconds);
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const save = (event) => {
    event.preventDefault();
    if (isCoach) onSaveCoachExperience(experience);
    setToast('Cambios guardados');
  };

  return <form className="content" onSubmit={save}>
    <div className="page-heading">
      <div>
        <div className="eyebrow">CUENTA</div>
        <h1>{role === 'entrenador' ? 'Perfil del entrenador' : 'Perfil del atleta'}</h1>
        <p>Información personal, preparación y referencias de rendimiento</p>
      </div>
      <button className="button primary" type="submit">Guardar cambios</button>
    </div>

    <div className="profile-grid">
      <section className="panel profile-panel">
        <div className="panel-title">
          <div className="profile-identity">
            <label className="profile-photo-control" title="Cambiar foto de perfil">
              {photo ? <img className="profile-photo" src={photo} alt="Foto de perfil" /> : <span className="profile-avatar">{initials || 'AM'}</span>}
              <input type="file" accept="image/*" aria-label="Subir foto de perfil" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPhoto(URL.createObjectURL(file));
              }} />
            </label>
            <div><h2>{name || (role === 'entrenador' ? 'Nombre del entrenador' : 'Nombre del atleta')}{role === 'entrenador' && ' - Entrenador'}</h2><p>{role === 'entrenador' ? 'Madrid, España' : 'Atleta · Madrid, España'}</p></div>
          </div>
          <span className="example-tag">EJEMPLO</span>
        </div>

        <div className="form-grid">
          <ReadOnlyField label="Nombre" value={name} reason="El nombre está vinculado a tu cuenta y no se puede modificar" />
          <ReadOnlyField label="Correo electrónico" type="email" value={email} reason="El correo electrónico está vinculado a tu cuenta y no se puede modificar" />
          <ReadOnlyField label="Fecha de nacimiento" value={formatLongDate(birthDate)} reason="La fecha de nacimiento está vinculada a tu cuenta y no se puede modificar" />
          <ReadOnlyField label="Género" value={gender} reason="El género está vinculado a tu cuenta y no se puede modificar" />
          <label className="field-label">Club<input value={club} onChange={(event) => setClub(event.target.value)} placeholder="Añadir club" /></label>
          <label className="field-label">Especialidad<input value={specialty} onChange={(event) => setSpecialty(event.target.value)} /></label>
        </div>
        <label className="field-label">Sobre mí como atleta<textarea rows="3" value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Detalles sobre lesiones previas, disponibilidad material, volumen semanal máximo o experiencia deportiva" /></label>
      </section>

      <section className="panel profile-preparation-panel">
        <div className="panel-title"><div><h2>Preparación</h2><p>{preparation ? `${objectives.length} ${objectives.length === 1 ? 'objetivo' : 'objetivos'} · una preparación activa` : 'Sin preparación activa'}</p></div><span className="example-tag">{preparation ? 'ACTIVA' : 'SIN PLAN'}</span></div>
        {preparation && <div className="profile-preparation-summary"><strong>{preparation.name}</strong><span>{preparation.duration} · Entrenador: {preparation.coach || 'Por asignar'}</span></div>}
        {objectives.length ? <div className="profile-preparation-list">{objectives.map((objective) => <article className="profile-preparation-item" key={objective.id}>
          <div className="profile-preparation-item-heading"><strong>{objective.name}</strong><span>{objective.distance}</span></div>
          {objective.eventDate && <div className="profile-objective-date">Fecha objetivo · {formatLongDate(objective.eventDate)}</div>}
        </article>)}</div> : <p className="profile-no-preparation">Todavía no tienes objetivos en tu preparación.</p>}
      </section>

      {isCoach && <CoachExperienceSection value={experience} onChange={setExperience} unsaved={experienceUnsaved} />}

      <section className="panel profile-physiology-panel">
        <div className="panel-title"><div><h2>Parámetros fisiológicos</h2></div></div>
        <div className="physiology-grid">
          {thresholds.map((item) => <article className="physiology-card" key={item.code}>
            <div className="physiology-card-head"><span className="physiology-code">{item.code}</span><span className="physiology-name">{item.name}</span></div>
            <div className="physiology-value">{formatPace(item.paceSeconds)}<small>/km</small></div>
            <div className="physiology-hr"><b>{item.hr} ppm</b><span>{item.hr >= fcMax ? 'FC máxima' : `${Math.round((item.hr / fcMax) * 100)} % de la FC máx.`}</span></div>
          </article>)}
        </div>
        <h3 className="physiology-subtitle">Repetición máxima (RM)</h3>
        <div className="physiology-grid is-lifts">
          {maxLifts.map((lift) => <article className="physiology-card" key={lift.id}>
            <div className="physiology-card-head"><span className="physiology-code">RM</span><span className="physiology-name">{lift.name}</span></div>
            <div className="physiology-value">
              {formatKg(lift.kg)}<small>kg</small>
              <InfoTip
                term={`${lift.name} · RM ${formatKg(lift.kg)} kg`}
                label={`Ver los pesos del 10 % al 90 % de la RM de ${lift.name.toLowerCase()}`}
                text={<span className="rm-percent-list">{rmPercentages.map((percent) => <span key={percent}><span>{percent} %</span><b>{formatKg((lift.kg * percent) / 100)} kg</b></span>)}</span>}
              />
            </div>
          </article>)}
        </div>
      </section>

      <section className="panel profile-marks-panel">
        <div className="panel-title"><div><h2>Marcas personales</h2></div></div>
        <div className="profile-add-race">
          <label className="field-label">Prueba
            <select value={raceToAdd} onChange={(event) => setRaceToAdd(event.target.value)} disabled={selectedRaces.length >= 3}>
              <option value="">{selectedRaces.length >= 3 ? 'Máximo de 3 pruebas' : 'Selecciona una prueba'}</option>
              {raceMarks.filter(([, key]) => !selectedRaces.includes(key)).map(([label, key]) => <option value={key} key={key}>{label}</option>)}
            </select>
          </label>
          <button className="button secondary" type="button" disabled={!raceToAdd || selectedRaces.length >= 3} onClick={() => {
            setSelectedRaces((current) => [...current, raceToAdd]);
            setRaceToAdd('');
          }}>Añadir prueba</button>
        </div>
        <div className="profile-marks-grid">
          {selectedRaces.map((key) => {
            const label = raceMarks.find(([, raceKey]) => raceKey === key)?.[0] || key;
            const pattern = longRaces.has(key) ? hoursPattern : preciseRaces.has(key) ? hundredthsPattern : minutesSecondsPattern;
            const placeholder = longRaces.has(key) ? 'h:mm:ss o mm:ss' : preciseRaces.has(key) ? 'mm:ss.cc' : 'mm:ss';
            const inputId = `race-mark-${key.replace(/[^a-z0-9]+/gi, '-')}`;
            return <div className="profile-race-mark field-label" key={key}>
              <div className="profile-race-mark-head">
                <label htmlFor={inputId}>{label}</label>
                <button className="remove-pill" type="button" aria-label={`Quitar ${label}`} onClick={() => setSelectedRaces((current) => current.filter((race) => race !== key))}><span aria-hidden="true">×</span>Quitar</button>
              </div>
              <input id={inputId} type="text" inputMode="decimal" pattern={pattern} title={longRaces.has(key) ? 'Usa mm:ss o h:mm:ss, por ejemplo 45:30 o 1:35:30.' : preciseRaces.has(key) ? 'Usa mm:ss y, si quieres, hasta dos decimales. Ejemplo: 1:02.35.' : 'Usa minutos y segundos, por ejemplo 18:42.'} value={marks[key] || ''} onChange={(event) => setMarks((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} />
            </div>;
          })}
        </div>
      </section>

      <section className="panel profile-links-panel">
        <div className="panel-title"><div><h2>Perfiles deportivos</h2></div></div>
        <label className="field-label">Perfil de Strava<input type="url" value={stravaUrl} onChange={(event) => setStravaUrl(event.target.value)} placeholder="https://www.strava.com/athletes/…" />{stravaUrl && <a className="button provider-profile-button strava-brand-button" href={stravaUrl} target="_blank" rel="noreferrer">Abrir perfil de Strava ↗</a>}</label>
        <label className="field-label">Perfil de Garmin<input type="url" value={garminUrl} onChange={(event) => setGarminUrl(event.target.value)} placeholder="https://connect.garmin.com/…" />{garminUrl && <a className="button provider-profile-button garmin-brand-button" href={garminUrl} target="_blank" rel="noreferrer">Abrir perfil de Garmin ↗</a>}</label>
      </section>

      <section className="panel profile-glossary-panel" id="glosario" aria-labelledby="glossary-title">
        <div className="panel-title"><div><h2 id="glossary-title">Glosario</h2><p>Qué significa cada término que verás en la app</p></div></div>
        <dl className="glossary-list">
          {Object.entries(glossary).map(([key, entry]) => <div className="glossary-item" key={key}>
            <dt>{entry.term}</dt>
            <dd>{entry.text}</dd>
          </div>)}
        </dl>
      </section>
    </div>
    <Toast message={toast} onDone={() => setToast('')} />
  </form>;
}

function ReadOnlyField({ label, value, reason, type = 'text' }) {
  return <label className="field-label">
    <span className="profile-label-row"><span>{label}</span><span className="readonly-tag" title={reason}>No editable</span></span>
    <input type={type} value={value} readOnly disabled className="profile-readonly-input" title={reason} aria-readonly="true" />
  </label>;
}

/** Ritmo en segundos por km → 4′00″ */
function formatPace(seconds) {
  return `${Math.floor(seconds / 60)}′${String(Math.round(seconds % 60)).padStart(2, '0')}″`;
}

function formatKg(value) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value);
}
