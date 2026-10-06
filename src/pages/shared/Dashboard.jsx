import { sessions as exampleSessions } from '../../data/sessions.js';
import { useState } from 'react';
import { JournalModal } from '../athlete/Diary.jsx';
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

export default function Dashboard({ role, weekNumber, weeks, onNavigate, onSession, trainingLogs = {}, setTrainingLogs }) {
  const [journalOpen, setJournalOpen] = useState(false);
  const shortcuts = role === 'atleta' ? athleteShortcuts : coachShortcuts;
  const currentWeek = weeks.find((week) => week.number === weekNumber) || weeks[weeks.length - 1];
  const weekSessions = currentWeek?.days || exampleSessions;
  const today = new Date();
  const todayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(today);
  const scheduledToday = weekSessions.find((session) => session.day.toLocaleLowerCase('es-ES') === todayName);
  const todaySession = scheduledToday ? { ...scheduledToday, dateLabel: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(today).toLocaleUpperCase('es-ES') } : weekSessions[0];
  const todayLogKey = `${currentWeek?.number || weekNumber}-${todaySession?.day}`;
  const todayLog = trainingLogs[todayLogKey];
  const wellbeingLogged = ['mood', 'fatigue', 'soreness', 'sleep', 'stress'].some((key) => todayLog?.[key] !== '' && todayLog?.[key] !== undefined);
  const activityLogged = ['distance', 'minutes', 'pace', 'averageHr'].some((key) => todayLog?.[key] !== '' && todayLog?.[key] !== undefined);

  return (
    <div className="content dashboard">
      <section className="dashboard-heading">
        <div className="eyebrow">INICIO · {role === 'atleta' ? 'ATLETA' : 'ENTRENADOR'}</div>
        <h1>Hola, Alex</h1>
        <p>Este es el resumen de tu preparación para esta semana.</p>
      </section>

      {role === 'atleta' && todaySession && <section className="today-training" aria-label="Entrenamiento de hoy">
        <button className={`today-training-circle ${todaySession.tone || ''}`} onClick={() => setJournalOpen(true)} aria-label={`Registrar diario de hoy: ${todaySession.type}`}>
          <span className="today-training-kicker">{activityLogged ? 'ACTIVIDAD REGISTRADA' : wellbeingLogged ? 'BIENESTAR REGISTRADO' : 'ENTRENO DE HOY'}</span>
          <strong>{todaySession.type}</strong>
          <span className="today-training-description">{todaySession.desc.replaceAll('\n', ' · ')}</span>
          <span className="today-training-duration">{todaySession.mins ? `${todaySession.mins} min` : 'Descanso'}{todaySession.km ? ` · ${todaySession.km} km` : ''}</span>
          <span className="today-training-cta">{activityLogged ? 'Editar diario' : wellbeingLogged ? 'Completar diario' : 'Rellenar diario'} <b>↗</b></span>
        </button>
        <div className="today-wellbeing-preview">
          <div className="eyebrow">BIENESTAR DE HOY</div>
          {[['mood', 'Humor'], ['fatigue', 'Fatiga'], ['soreness', 'Agujetas'], ['sleep', 'Sueño'], ['stress', 'Estrés']].map(([key, label]) => {
            const value = todayLog?.[key];
            return <div className="today-wellbeing-row" key={key}>
              <label htmlFor={`today-${key}`}>{label}</label>
              <input
                id={`today-${key}`}
                className="today-wellbeing-slider"
                type="range"
                min="1"
                max="10"
                step="1"
                value={value || 1}
                aria-label={`${label} de hoy, de 1 a 10`}
                aria-valuetext={value ? `${value} de 10` : 'Sin registrar'}
                onChange={(event) => setTrainingLogs((current) => ({
                  ...current,
                  [todayLogKey]: { ...(current[todayLogKey] || {}), [key]: event.target.value },
                }))}
              />
              <b>{value || '—'}</b>
            </div>;
          })}
          <div className="today-wellbeing-hint">1 · Verde <span>10 · Rojo</span></div>
          <button className="today-open-link" onClick={() => setJournalOpen(true)}>{todayLog ? 'Completar o editar el diario' : 'Registrar actividad y bienestar'} <span>→</span></button>
        </div>
      </section>}

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

      {journalOpen && <JournalModal
        session={todaySession}
        initialValues={todayLog}
        onClose={() => setJournalOpen(false)}
        onSave={(values) => {
          setTrainingLogs((current) => ({ ...current, [todayLogKey]: values }));
          setJournalOpen(false);
        }}
      />}

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
