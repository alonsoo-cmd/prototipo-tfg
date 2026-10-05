import { sessions as exampleSessions } from '../../data/sessions.js';
import './Dashboard.css';

const athleteShortcuts = [
  {
    page: 'Diary',
    icon: '▦',
    title: 'Diario',
    description: 'Consulta el calendario y registra cómo te ha ido.',
    action: 'Abrir diario',
    tone: 'blue',
  },
  {
    page: 'Data',
    icon: '◌',
    title: 'Datos',
    description: 'Revisa tu actividad y la evolución de tu entrenamiento.',
    action: 'Ver mis datos',
    tone: 'green',
  },
];

const coachShortcuts = [
  ...athleteShortcuts,
  {
    page: 'Athletes',
    icon: '♧',
    title: 'Atletas',
    description: 'Accede a los atletas que tienes vinculados ahora.',
    action: 'Ver atletas',
    tone: 'amber',
  },
];

export default function Dashboard({ role, weekNumber, weeks, onNavigate, onSession }) {
  const shortcuts = role === 'atleta' ? athleteShortcuts : coachShortcuts;
  const currentWeek = weeks.find((week) => week.number === weekNumber) || weeks[weeks.length - 1];
  const weekSessions = currentWeek?.days || exampleSessions;

  return (
    <div className="content dashboard">
      <section className="dashboard-heading">
        <div className="eyebrow">INICIO · {role === 'atleta' ? 'ATLETA' : 'ENTRENADOR'}</div>
        <h1>Hola, Alex</h1>
        <p>Este es el resumen de tu preparación para esta semana.</p>
      </section>

      <section className={`dashboard-shortcuts ${role === 'entrenador' ? 'coach-shortcuts' : ''}`} aria-label="Accesos rápidos">
        {shortcuts.map((shortcut) => (
          <button
            className={`dashboard-card ${shortcut.tone}`}
            key={shortcut.page}
            onClick={() => onNavigate(shortcut.page)}
          >
            <span className="dashboard-card-icon" aria-hidden="true">{shortcut.icon}</span>
            <span className="dashboard-card-copy">
              <strong>{shortcut.title}</strong>
              <span>{shortcut.description}</span>
            </span>
            <span className="dashboard-card-action">{shortcut.action} <b>→</b></span>
          </button>
        ))}
      </section>

      <section className="dashboard-week panel">
        <div className="dashboard-week-heading">
          <div>
            <div className="eyebrow">PREPARACIÓN ACTIVA</div>
            <h2>Esta semana <span>· Semana {currentWeek?.number || 8}</span></h2>
            <p>Media Maratón Madrid · BII / Acumulación</p>
          </div>
        </div>
        <div className="dashboard-week-layout">
          <div className="dashboard-week-days">
            {weekSessions.map((session) => (
              <button className={`dashboard-day ${session.tone}`} key={session.day} onClick={() => onSession(session)}>
                <span className="dashboard-day-date"><b>{session.day}</b><small>{session.date} oct</small></span>
                <span className="dashboard-day-type">{session.type}<span aria-hidden="true">⌄</span></span>
                <span className="dashboard-day-session">{session.desc.replaceAll('\n', ' · ')}</span>
                <span className="dashboard-day-metrics"><span>{session.mins ? `${session.mins} min` : '—'}</span><span>{session.km ? `${session.km} km` : '—'}</span></span>
                <span className="dashboard-day-state"><i />{session.state}</span>
              </button>
            ))}
          </div>
          <WeeklySummary weekNumber={currentWeek?.number || weekNumber} />
        </div>
      </section>
    </div>
  );
}

function WeeklySummary({ weekNumber }) {
  const rows = [
    ['Kms', '35', '4', '8', '46'],
    ['Minutos', '182', '16', '34', '232'],
    ['TRIMPS', '182', '32', '102', '316'],
    ['% mins', '78', '7', '15', '100'],
  ];

  return (
    <aside className="dashboard-summary" aria-label={`Resumen semanal, semana ${weekNumber}`}>
      <div className="dashboard-summary-title">Semana {weekNumber}</div>
      <table>
        <thead><tr><th></th><th>B</th><th>M</th><th>A</th><th>Tot</th></tr></thead>
        <tbody>
          {rows.map(([label, ...values]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {values.map((value, index) => <td className={index === values.length - 1 ? 'total' : ''} key={index}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}
