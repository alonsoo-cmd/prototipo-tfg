import { useState } from 'react';
import DatePicker from '../../components/ui/DatePicker.jsx';

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

export default function Profile({ preparation = null, setPreparations = () => {} }) {
  const [name, setName] = useState('Alex Martín');
  const [email, setEmail] = useState('alex.martin@example.com');
  const [birthDate, setBirthDate] = useState('1998-04-12');
  const [gender, setGender] = useState('No especificado');
  const [club, setClub] = useState('');
  const [specialty, setSpecialty] = useState('Carrera de fondo');
  const [about, setAbout] = useState('Corredor amateur. Entrenamiento de fondo y pista.');
  const [photo, setPhoto] = useState('');
  const [marks, setMarks] = useState({});
  const [selectedRaces, setSelectedRaces] = useState([]);
  const [raceToAdd, setRaceToAdd] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [garminUrl, setGarminUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [newObjective, setNewObjective] = useState({ name: '', distance: 'Media maratón', eventDate: '' });
  const [preparationDuration, setPreparationDuration] = useState('12 semanas');
  const objectives = preparation?.objectives || [];
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const save = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return <form className="content" onSubmit={save}>
    <div className="page-heading">
      <div>
        <div className="eyebrow">CUENTA</div>
        <h1>Perfil del atleta</h1>
        <p>Información personal, preparación y referencias de rendimiento</p>
      </div>
      <button className="button primary" type="submit">{saved ? 'Cambios guardados ✓' : 'Guardar cambios'}</button>
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
            <div><h2>{name || 'Nombre del atleta'}</h2><p>Atleta · Madrid, España</p></div>
          </div>
          <span className="example-tag">EJEMPLO</span>
        </div>

        <div className="form-grid">
          <label className="field-label">Nombre<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="field-label">Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="field-label">Fecha de nacimiento<DatePicker value={birthDate} onChange={setBirthDate} ariaLabel="Elegir fecha de nacimiento" /></label>
          <label className="field-label">Género<select value={gender} onChange={(event) => setGender(event.target.value)}><option>No especificado</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select></label>
          <label className="field-label">Club<input value={club} onChange={(event) => setClub(event.target.value)} placeholder="Añadir club" /></label>
          <label className="field-label">Especialidad<input value={specialty} onChange={(event) => setSpecialty(event.target.value)} /></label>
        </div>
        <label className="field-label">Sobre mí<textarea rows="3" value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Escribe una breve descripción" /></label>
      </section>

      <section className="panel profile-preparation-panel">
        <div className="panel-title"><div><h2>Preparación</h2><p>{preparation ? `${objectives.length} objetivos · una preparación activa` : 'Sin preparación activa'}</p></div><span className="example-tag">{preparation ? 'ACTIVA' : 'SIN PLAN'}</span></div>
        {preparation && <div className="profile-preparation-summary"><strong>{preparation.name}</strong><span>{preparation.duration} · Entrenador: {preparation.coach || 'Por asignar'}</span></div>}
        {objectives.length ? <div className="profile-preparation-list">{objectives.map((objective) => <article className="profile-preparation-item" key={objective.id}>
          <div className="profile-preparation-item-heading"><strong>{objective.name}</strong><span>{objective.distance}</span><button className="text-button" type="button" aria-label={`Quitar objetivo ${objective.name}`} onClick={() => setPreparations((all) => all.flatMap((item) => {
            if (item.athleteId !== 'alex') return [item];
            const remaining = item.objectives.filter((entry) => entry.id !== objective.id);
            return remaining.length ? [{ ...item, objectives: remaining }] : [];
          }))}>Quitar</button></div>
          {objective.eventDate && <div className="profile-objective-date">Fecha objetivo · {formatObjectiveDate(objective.eventDate)}</div>}
        </article>)}</div> : <p className="profile-no-preparation">Todavía no tienes objetivos en tu preparación.</p>}
        <div className="profile-add-preparation">
          <strong>{preparation ? 'Añadir objetivo a la preparación' : 'Crear preparación y añadir objetivo'}</strong>
          {!preparation && <label className="field-label">Duración del plan<select value={preparationDuration} onChange={(event) => setPreparationDuration(event.target.value)}><option>8 semanas</option><option>10 semanas</option><option>12 semanas</option><option>16 semanas</option></select></label>}
          <label className="field-label">Nombre del objetivo<input value={newObjective.name} onChange={(event) => setNewObjective((current) => ({ ...current, name: event.target.value }))} placeholder="Ej. 10K de otoño" /></label>
          <div className="form-grid">
            <label className="field-label">Distancia<select value={newObjective.distance} onChange={(event) => setNewObjective((current) => ({ ...current, distance: event.target.value }))}><option>400 m</option><option>800 m</option><option>1.500 m</option><option>3.000 m</option><option>5 km</option><option>10 km</option><option>Media maratón</option><option>Maratón</option></select></label>
            <label className="field-label">Fecha objetivo<DatePicker value={newObjective.eventDate} onChange={(eventDate) => setNewObjective((current) => ({ ...current, eventDate }))} allowClear placeholder="Opcional" ariaLabel="Elegir fecha objetivo" /></label>
          </div>
          <button className="button secondary" type="button" disabled={!newObjective.name.trim()} onClick={() => {
            const objective = { ...newObjective, id: Date.now() };
            setPreparations((all) => preparation
              ? all.map((item) => item.athleteId === 'alex' ? { ...item, objectives: [...item.objectives, objective] } : item)
              : [...all, { id: Date.now() + 1, athleteId: 'alex', athleteName: name, name: `Preparación de ${name}`, duration: preparationDuration, coach: 'Por asignar', objectives: [objective] }]);
            setNewObjective({ name: '', distance: 'Media maratón', eventDate: '' });
          }}>＋ Añadir objetivo</button>
        </div>
      </section>

      <section className="panel profile-marks-panel">
        <div className="panel-title"><div><h2>Marcas personales</h2><p>Elige hasta 3 pruebas y añade tus mejores tiempos</p></div></div>
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
            return <div className="profile-race-mark" key={key}>
              <label className="field-label">{label}<input type="text" inputMode="decimal" pattern={pattern} title={longRaces.has(key) ? 'Usa mm:ss o h:mm:ss, por ejemplo 45:30 o 1:35:30.' : preciseRaces.has(key) ? 'Usa mm:ss y, si quieres, hasta dos decimales. Ejemplo: 1:02.35.' : 'Usa minutos y segundos, por ejemplo 18:42.'} value={marks[key] || ''} onChange={(event) => setMarks((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} /></label>
              <button className="text-button" type="button" onClick={() => setSelectedRaces((current) => current.filter((race) => race !== key))}>Quitar</button>
            </div>;
          })}
        </div>
        {!selectedRaces.length && <p className="help-text">Añade entre una y tres pruebas: desde 400 m hasta media maratón y maratón.</p>}
      </section>

      <section className="panel profile-links-panel">
        <div className="panel-title"><div><h2>Perfiles deportivos</h2><p>Opcional · añade enlaces públicos a tus perfiles</p></div></div>
        <label className="field-label">Perfil de Strava<input type="url" value={stravaUrl} onChange={(event) => setStravaUrl(event.target.value)} placeholder="https://www.strava.com/athletes/…" />{stravaUrl && <a className="profile-external-link" href={stravaUrl} target="_blank" rel="noreferrer">Abrir perfil de Strava ↗</a>}</label>
        <label className="field-label">Perfil de Garmin<input type="url" value={garminUrl} onChange={(event) => setGarminUrl(event.target.value)} placeholder="https://connect.garmin.com/…" />{garminUrl && <a className="profile-external-link" href={garminUrl} target="_blank" rel="noreferrer">Abrir perfil de Garmin ↗</a>}</label>
      </section>
    </div>
  </form>;
}

function formatObjectiveDate(value) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
