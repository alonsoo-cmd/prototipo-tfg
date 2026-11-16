import { useState } from 'react';
import { sessions } from '../../data/sessions.js';
import WorkoutStatus from '../../components/ui/WorkoutStatus.jsx';
import WeekTimeline, { getWeekDateRange } from '../../components/ui/WeekTimeline.jsx';
import DiaryAveragesModal from '../../components/modals/DiaryAveragesModal.jsx';
import { wellbeingFields } from '../../domain/wellbeing.js';
import { JournalModal } from '../../components/journal/JournalModal.jsx';
import { logKey, numberFrom } from '../../domain/training.js';
import { weekPhase } from '../../data/phases.js';
import Toast from '../../components/ui/Toast.jsx';
import './Diary.css';
import InfoTip, { TermLabel } from '../../components/ui/InfoTip.jsx';
import { format } from '../../utils/format.js';
import { CURRENT_WEEK, sessionDate, today } from '../../domain/calendar.js';



export default function Diary({
  role,
  week,
  setWeek,
  preparation = null,
  onSession,
  onPhases,
  coachWeeks,
  trainingLogs,
  setTrainingLogs,
  athleteProfile = { fcMax: 200, sex: 'male' },
}) {
  const [journalDay, setJournalDay] = useState(null);
  const [showAverages, setShowAverages] = useState(false);
  const [toast, setToast] = useState('');
  const visibleWeek = coachWeeks.find((item) => item.number === week);
  const weekSessions = visibleWeek?.days || sessions;
  const objectives = preparation?.objectives || [];
  const primaryObjective = objectives[0];
  const savedLogs = weekSessions
    .map((session) => trainingLogs[logKey(week, session.day)])
    .filter(Boolean);

  const totals = savedLogs.reduce((result, log) => ({
    kilometers: result.kilometers + numberFrom(log.distance),
    minutes: result.minutes + numberFrom(log.minutes),
    trimps: result.trimps + numberFrom(log.trimps),
  }), { kilometers: 0, minutes: 0, trimps: 0 });

  const wellbeingLogs = savedLogs.filter((log) => wellbeingFields.some(([key]) => log[key] !== '' && log[key] !== undefined));
  const averageWt = wellbeingLogs.length
    ? wellbeingLogs.reduce((total, log) => total + wellbeingFields.reduce((sum, [key]) => sum + numberFrom(log[key]), 0), 0) / wellbeingLogs.length
    : null;
  const stats = { ...totals, averageWt, daysLogged: savedLogs.length };

  const saveJournal = (day, values) => {
    setTrainingLogs((current) => ({ ...current, [logKey(week, day)]: values }));
    setJournalDay(null);
    setToast(`Registro del ${day.toLocaleLowerCase('es-ES')} guardado`);
  };

  return (
    <div className="content diary-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PREPARACIÓN ACTIVA <span className="bullet">•</span> EJEMPLO</div>
          <h1>{primaryObjective?.name || 'Media Maratón Madrid'} <span className="phase-badge">{weekPhase(coachWeeks, week)}</span><InfoTip term="fases" /></h1>
          <p>{objectives.length > 1 ? `Objetivos · ${objectives.map((objective) => `${objective.name} (${objective.distance})`).join(' · ')}` : `Objetivo · ${primaryObjective?.distance || 'Media maratón'} · ${primaryObjective?.eventDate ? formatGoalDate(primaryObjective.eventDate) : '6 diciembre 2026'}`}</p>
        </div>
      </div>

      <WeekTimeline
        weeks={coachWeeks}
        selectedWeek={week}
        onSelectWeek={setWeek}
        currentWeek={CURRENT_WEEK}
      />

      <section className="diary-stats" aria-label="Estadísticas de los últimos siete días">
        <div className="diary-stats-heading">
          <div>
            <div className="eyebrow">ÚLTIMOS 7 DÍAS</div>
            <small>{stats.daysLogged} {stats.daysLogged === 1 ? 'día registrado' : 'días registrados'}</small>
          </div>
          <button className="text-button averages-trigger" onClick={() => setShowAverages(true)} aria-label="Ver medias semanales y mensuales">📊 Ver medias</button>
        </div>
        <Stat label="Kilómetros" value={formatNumber(stats.kilometers)} unit="km" />
        <Stat label="Minutos" value={formatNumber(stats.minutes)} unit="min" />
        <Stat label="TRIMPS" value={formatNumber(stats.trimps)} />
        <Stat label="Media WT diaria" value={stats.averageWt === null ? '—' : formatNumber(stats.averageWt, 1)} unit="/ 50" />
      </section>

      <div className="week-control">
        <div>
          <strong>Semana {week} · {getWeekDateRange(week)}</strong>
        </div>
        <button className="text-button" onClick={onPhases}>Resumen de fases ↗</button>
      </div>

      <section className="week-layout">
        <div className="week-board">
          <div className="week-grid">
            {weekSessions.map((session) => {
              const isFuture = sessionDate(week, session.day) > today();

              const logEntry = trainingLogs[logKey(week, session.day)];
              const status = logEntry?.completionStatus;
              
              const isCompleted = status === 'completed';
              const isPartial = status === 'partial';
              const isMissed = status === 'missed';

              let nextStatus;
              if (!status) nextStatus = 'completed';
              else if (isCompleted) nextStatus = 'partial';
              else if (isPartial) nextStatus = 'missed';
              else if (isMissed) nextStatus = 'completed';

              const icon = isCompleted ? '✅' : isPartial ? '⚠️' : isMissed ? '❌' : '⬜';
              const label = isCompleted ? 'Hecho' : isPartial ? 'A medias' : isMissed ? 'No hecho' : 'Marcar';

              return (
                <article className="day-column" key={session.day}>
                  <div className="day-heading"><span>{session.day}</span><b>{sessionDate(week, session.day).getUTCDate()}</b></div>
                  <button className={`session-card ${session.tone}`} onClick={() => onSession(session, week)}>
                    <div className="card-title">{session.type}<span>⌄</span></div>
                    <div className="card-desc">{session.desc}</div>
                    {session.shoes && <div className="session-shoes-note">👟 {session.shoes}</div>}
                    <div className="card-meta">
                      <span>{session.mins ? `${session.mins} min` : '—'}</span>
                      <span>{session.km ? `${format(session.km)} km` : '—'}</span>
                    </div>
                    <div className="card-state"><i />{session.state}</div>
                  </button>
                  <div className="diary-workout-status"><WorkoutStatus status={status || null} /></div>
                  {role !== 'grupo' ? (
                    <button
                      className={`journal-button ${logEntry ? 'has-entry' : ''}`}
                      onClick={() => setJournalDay(session)}
                      aria-label={`Abrir diario de entrenamiento del ${session.day}`}
                      title={isFuture ? "No puedes registrar días futuros" : "Registrar entrenamiento y bienestar"}
                      disabled={isFuture}
                      style={{ opacity: isFuture ? 0.5 : 1, cursor: isFuture ? 'not-allowed' : 'pointer' }}
                    >
                      <span aria-hidden="true">📓</span>
                      <span>{logEntry ? 'Editado' : 'Registrar'}</span>
                    </button>
                  ) : (
                    <button
                      className={`journal-button ${isCompleted || isPartial ? 'has-entry' : ''}`}
                      onClick={() => {
                        const key = logKey(week, session.day);
                        setTrainingLogs((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            completionStatus: nextStatus,
                          }
                        }));
                      }}
                      title={isFuture ? "No puedes registrar asistencia de días futuros" : "Marcar asistencia"}
                      disabled={isFuture}
                      style={{ opacity: isFuture ? 0.5 : 1, cursor: isFuture ? 'not-allowed' : 'pointer' }}
                    >
                      <span aria-hidden="true">{icon}</span>
                      <span>{label}</span>
                    </button>
                  )}
                  <div className="day-load">
                    <span>{format(logEntry?.distance || session.km || 0, 1)} km</span>
                    <span className={logEntry?.trimps ? 'logged-trimp' : ''} title={logEntry?.trimps ? `TRIMP registrado: ${logEntry.trimps}` : `TRIMP planificado: ${session.tr}`}>
                      {logEntry?.trimps ? `${logEntry.trimps} TR` : `${session.tr} TR`}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <WeeklyLoad week={week} />
      </section>

      {journalDay && (
        <JournalModal
          session={journalDay}
          initialValues={trainingLogs[logKey(week, journalDay.day)]}
          onClose={() => setJournalDay(null)}
          onSave={(values) => saveJournal(journalDay.day, values)}
          athleteProfile={athleteProfile}
        />
      )}

      {showAverages && (
        <DiaryAveragesModal
          onClose={() => setShowAverages(false)}
          trainingLogs={trainingLogs}
          coachWeeks={coachWeeks}
          currentWeek={week}
        />
      )}
      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="diary-stat">
      <span><TermLabel>{label}</TermLabel></span>
      <strong>{value}<small>{unit ? ` ${unit}` : ''}</small></strong>
    </div>
  );
}

function WeeklyLoad({ week }) {
  const rows = [
    ['Kilómetros', '35', '4', '8', '46'],
    ['Minutos', '182', '16', '34', '232'],
    ['TRIMPS', '182', '32', '102', '316'],
  ];

  return (
    <aside className="weekly-summary">
      <div className="summary-top"><div><div className="eyebrow">RESUMEN</div><h2>Semana {week}</h2></div><span className="summary-calendar">▦</span></div>
      <div className="summary-labels"><span /><span>BAJA</span><span>MEDIA</span><span>ALTA</span><span>TOTAL</span></div>
      {rows.map(([label, ...values]) => (
        <div className="summary-row" key={label}>
          <b>{label}</b>
          {values.map((value, index) => <span className={index === values.length - 1 ? 'total' : ''} key={index}>{value}</span>)}
        </div>
      ))}
      <div className="summary-foot"><span>Distribución registrada</span><span className="legend"><i className="low" /><i className="mid" /><i className="high" /></span></div>
    </aside>
  );
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value);
}

function formatGoalDate(value) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
