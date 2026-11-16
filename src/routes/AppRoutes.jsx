import Diary from '../pages/athlete/Diary.jsx';
import FindCoach from '../pages/athlete/FindCoach.jsx';
import NoPreparation from '../pages/athlete/NoPreparation.jsx';
import CoachHome from '../pages/coach/CoachHome.jsx';
import PreparationPage from '../pages/coach/PreparationPage.jsx';
import WorkoutsPage from '../pages/coach/WorkoutsPage.jsx';
import DataPage from '../pages/shared/DataPage.jsx';
import Profile from '../pages/shared/Profile.jsx';
import Dashboard from '../pages/shared/Dashboard.jsx';

/** Muestra la página activa (navegación por estado, sin URL). */
export default function AppRoutes({ state }) {
  const {
    role, page, week, setWeek, go, openSession, setModal, focusAthleteId, setFocusAthleteId, setRequestCoach,
    trainingLogs, setTrainingLogs, coachWeeks, setCoachWeeks,
    preparations, setPreparations, athletePreparation,
    workoutTemplates, setWorkoutTemplates, athleteProfile,
    coachExperience, setCoachExperience,
    activePlan, startSelfPreparation, requestSent, requestCoach, requestStatus,
  } = state;

  // Sin preparación (atleta o entrenador): Inicio y Diario no tienen calendario que mostrar.
  // El entrenador puede, además, preparársela él mismo.
  const withoutPlan = role !== 'grupo' && !activePlan;
  const selfPrepare = role === 'entrenador' ? startSelfPreparation : null;
  if (withoutPlan && (page === 'Dashboard' || page === 'Diary')) {
    return <NoPreparation requestCoach={requestSent ? requestCoach : null} onFindCoach={() => go('Find coach')} onSelfPrepare={selfPrepare} />;
  }

  switch (page) {
    case 'Dashboard':
      return <Dashboard role={role} weekNumber={week} weeks={coachWeeks} onNavigate={go} onSession={openSession} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs} />;
    case 'Diary':
      return <Diary role={role} week={week} setWeek={setWeek} preparation={athletePreparation} onSession={openSession} onPhases={() => setModal('phases')} coachWeeks={coachWeeks} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs} athleteProfile={athleteProfile} />;
    case 'Data':
      return <DataPage role={role} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs} onSession={openSession} coachWeeks={coachWeeks} />;
    case 'Profile':
      return <Profile role={role} preparation={athletePreparation} athleteProfile={athleteProfile} coachExperience={coachExperience} onSaveCoachExperience={setCoachExperience} />;
    case 'Find coach':
      // Solo para atletas sin preparación; en cualquier otro caso, la página no existe.
      if (!withoutPlan) return null;
      return <FindCoach onSelfPrepare={selfPrepare} requestCoach={requestSent ? requestCoach : null} onRequest={(coachName) => { setRequestCoach(coachName); setModal('request'); }} />;
    case 'Athletes':
      return <CoachHome hasOwnPlan={activePlan} go={go} openAthlete={(athleteId) => { go('Preparations'); setFocusAthleteId(athleteId); }} openRequest={() => setModal('request-review')} requestStatus={requestStatus} weeks={coachWeeks} trainingLogs={trainingLogs} />;
    case 'Preparations':
      return <PreparationPage key={focusAthleteId || 'default'} initialAthleteId={focusAthleteId} hasOwnPlan={activePlan} weeks={coachWeeks} setWeeks={setCoachWeeks} preparations={preparations} setPreparations={setPreparations} trainingLogs={trainingLogs} workoutTemplates={workoutTemplates} onProfile={() => go('Profile')} />;
    case 'Workouts':
      return role === 'entrenador' ? <WorkoutsPage templates={workoutTemplates} setTemplates={setWorkoutTemplates} /> : null;
    default:
      return null;
  }
}
