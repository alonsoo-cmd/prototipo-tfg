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

  // ── Modales globales ─────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [activeSession, setActiveSession] = useState(sessions[0]);

  // ── Diario ───────────────────────────────────────────────
  const [activePlan, setActivePlan] = useState(true);

  // ── Registro de actividad (simulado) ─────────────────────
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [connected, setConnected] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // ── Solicitud de preparación (simulada) ──────────────────
  const [requestDate, setRequestDate] = useState('2026-12-06');
  const [requestSent, setRequestSent] = useState(false);
  const [requestStatus, setRequestStatus] = useState('Pendiente');

  const go = (nextPage) => {
    setPage(nextPage);
    setModal(null);
  };
  const changeRole = (nextRole, nextPage) => {
    setRole(nextRole);
    setPage(nextPage);
    setMobileNavOpen(false);
  };
  const openSession = (session) => {
    setActiveSession(session);
    setModal('session');
  };
  const closeModal = () => setModal(null);
  const addComment = () => {
    if (!comment.trim()) return;
    setComments((current) => [...current, comment.trim()]);
    setComment('');
  };

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
    activePlan, setActivePlan,
    comment, setComment, comments, addComment, connected, setConnected, uploaded, setUploaded,
    requestDate, setRequestDate, requestSent, setRequestSent, requestStatus, setRequestStatus,
  };
}
