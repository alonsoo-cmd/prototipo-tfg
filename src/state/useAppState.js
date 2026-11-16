import { useState } from 'react';
import { sessions } from '../data/sessions.js';
import { createSampleWorkoutTemplates } from '../data/workoutTemplates.js';
import { createInitialCoachWeeks, initialAthleteProfile, initialCoachExperience, initialPreparations } from '../data/initialState.js';
import { CURRENT_WEEK } from '../domain/calendar.js';

const CURRENT_ATHLETE_ID = 'alex';

/**
 * Estado global de la aplicación (solo en memoria).
 * Agrupa los datos de dominio compartidos entre atleta y entrenador,
 * la navegación y los flujos simulados (solicitud de preparación, actividad).
 */
export function useAppState() {
  // ── Dominio ──────────────────────────────────────────────
  const [trainingLogs, setTrainingLogs] = useState({});
  const [coachWeeks, setCoachWeeks] = useState(createInitialCoachWeeks);
  const [preparations, setPreparations] = useState(initialPreparations);
  const [workoutTemplates, setWorkoutTemplates] = useState(createSampleWorkoutTemplates);
  const [athleteProfile, setAthleteProfile] = useState(initialAthleteProfile);
  const [coachExperience, setCoachExperience] = useState(initialCoachExperience);

  // ── Navegación ───────────────────────────────────────────
  const [role, setRole] = useState('atleta');
  const [page, setPage] = useState('Dashboard');
  const [week, setWeek] = useState(CURRENT_WEEK);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Atleta que se abre al entrar en Preparaciones (p. ej. al pulsarlo en el panel de Atletas).
  const [focusAthleteId, setFocusAthleteId] = useState(null);

  // ── Modales globales ─────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [activeSession, setActiveSession] = useState(sessions[0]);

  // ── Diario ───────────────────────────────────────────────
  const [activePlan, setActivePlan] = useState(true);

  // ── Aviso breve global (p. ej. al guardar el diario desde el detalle de sesión)
  const [toast, setToast] = useState('');

  // ── Solicitud de preparación (simulada) ──────────────────
  const [requestDate, setRequestDate] = useState('2026-12-06');
  const [requestSent, setRequestSent] = useState(false);
  // Entrenador al que se ha enviado la solicitud (un atleta solo puede tener uno).
  const [requestCoach, setRequestCoach] = useState(null);
  const [requestStatus, setRequestStatus] = useState('Pendiente');

  const go = (nextPage) => {
    setPage(nextPage);
    setModal(null);
    setFocusAthleteId(null);
  };
  const changeRole = (nextRole, nextPage) => {
    setRole(nextRole);
    setPage(nextPage);
    setMobileNavOpen(false);
    setFocusAthleteId(null);
  };
  // Modo demostración: atleta con o sin preparación activa.
  const togglePlan = (hasPlan) => {
    setActivePlan(hasPlan);
    setModal(null);
    if (hasPlan) {
      // Con preparación ya tiene entrenador: la búsqueda y la solicitud dejan de tener sentido.
      setRequestSent(false);
      setRequestCoach(null);
      if (page === 'Find coach') setPage('Dashboard');
    }
  };
  // La sesión lleva su semana para que «Registrar» guarde el diario en la clave correcta.
  const openSession = (session, weekNumber) => {
    setActiveSession({ ...session, week: weekNumber ?? session.preparationWeek ?? week });
    setModal('session');
  };
  const closeModal = () => setModal(null);

  const athletePreparation = preparations.find((item) => item.athleteId === CURRENT_ATHLETE_ID) || null;

  return {
    trainingLogs, setTrainingLogs,
    coachWeeks, setCoachWeeks,
    preparations, setPreparations,
    workoutTemplates, setWorkoutTemplates,
    athleteProfile, setAthleteProfile,
    coachExperience, setCoachExperience,
    athletePreparation,
    role, page, week, setWeek, mobileNavOpen, setMobileNavOpen,
    go, changeRole,
    modal, setModal, closeModal, activeSession, openSession,
    activePlan, setActivePlan, togglePlan, requestCoach, setRequestCoach,
    toast, setToast,
    focusAthleteId, setFocusAthleteId,
    requestDate, setRequestDate, requestSent, setRequestSent, requestStatus, setRequestStatus,
  };
}
