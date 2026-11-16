import Diary from '../pages/athlete/Diary.jsx';
import FindCoach from '../pages/athlete/FindCoach.jsx';
import CoachHome from '../pages/coach/CoachHome.jsx';
import PreparationPage from '../pages/coach/PreparationPage.jsx';
import WorkoutsPage from '../pages/coach/WorkoutsPage.jsx';
import DataPage from '../pages/shared/DataPage.jsx';
import Profile from '../pages/shared/Profile.jsx';
import Dashboard from '../pages/shared/Dashboard.jsx';

/** Muestra la página activa (navegación por estado, sin URL). */
export default function AppRoutes({ state }) {
  const {
    role, page, week, setWeek, go, openSession, setModal, focusAthleteId, setFocusAthleteId,
    trainingLogs, setTrainingLogs, coachWeeks, setCoachWeeks,
    preparations, setPreparations, athletePreparation,
    workoutTemplates, setWorkoutTemplates, athleteProfile,
    coachExperience, setCoachExperience,
    activePlan, setActivePlan, requestSent, setRequestSent, requestStatus,
  } = state;

  switch (page) {
    case 'Dashboard':
      return <Dashboard role={role} weekNumber={week} weeks={coachWeeks} onNavigate={go} onSession={openSession} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs} />;
    case 'Diary':
      return <Diary role={role} week={week} setWeek={setWeek} activePlan={activePlan} setActivePlan={setActivePlan} preparation={athletePreparation} onSession={openSession} onPlan={() => go('Find coach')} onPhases={() => setModal('phases')} coachWeeks={coachWeeks} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs} athleteProfile={athleteProfile} />;
    case 'Data':
      return <DataPage role={role} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs} onSession={openSession} coachWeeks={coachWeeks} />;
    case 'Profile':
      return <Profile role={role} preparation={athletePreparation} athleteProfile={athleteProfile} coachExperience={coachExperience} onSaveCoachExperience={setCoachExperience} />;
    case 'Find coach':
      return <FindCoach onRequest={() => setModal('request')} sent={requestSent} setSent={setRequestSent} />;
    case 'Athletes':
      return <CoachHome go={go} openAthlete={(athleteId) => { go('Preparations'); setFocusAthleteId(athleteId); }} openRequest={() => setModal('request-review')} requestStatus={requestStatus} weeks={coachWeeks} trainingLogs={trainingLogs} />;
    case 'Preparations':
      return <PreparationPage key={focusAthleteId || 'default'} initialAthleteId={focusAthleteId} weeks={coachWeeks} setWeeks={setCoachWeeks} preparations={preparations} setPreparations={setPreparations} trainingLogs={trainingLogs} workoutTemplates={workoutTemplates} onProfile={() => go('Profile')} />;
    case 'Workouts':
      return role === 'entrenador' ? <WorkoutsPage templates={workoutTemplates} setTemplates={setWorkoutTemplates} /> : null;
    default:
      return null;
  }
}
