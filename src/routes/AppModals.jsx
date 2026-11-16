import ModalShell from '../components/modals/ModalShell.jsx';
import SessionDetailModal from '../components/modals/SessionDetailModal.jsx';
import { JournalModal } from '../components/journal/JournalModal.jsx';
import { logKey } from '../domain/training.js';
import { sessionDate, today } from '../domain/calendar.js';
import PhasesSummaryModal from '../components/modals/PhasesSummaryModal.jsx';
import { PreparationRequestForm, RequestReview, RequestSentNotice } from '../components/modals/PreparationRequestModals.jsx';

/** Modales globales: decide cuál mostrar según `state.modal` y los conecta al estado. */
export default function AppModals({ state }) {
  const { modal, setModal, closeModal, go } = state;
  if (!modal) return null;

  const session = state.activeSession;
  // Registro único: el mismo modal del diario que se abre desde Inicio y Diario.
  if (modal === 'journal') {
    const key = logKey(session.week, session.day);
    return <JournalModal
      session={session}
      initialValues={state.trainingLogs[key]}
      athleteProfile={state.athleteProfile}
      onClose={closeModal}
      onSave={(values) => {
        state.setTrainingLogs((current) => ({ ...current, [key]: values }));
        state.setToast(`Registro del ${session.day.toLocaleLowerCase('es-ES')} guardado`);
        closeModal();
      }}
    />;
  }
  const isFutureSession = modal === 'session' && sessionDate(session.week, session.day) > today();
  const hasLog = modal === 'session' && Boolean(state.trainingLogs[logKey(session.week, session.day)]);

  return <ModalShell onClose={closeModal} wide={modal === 'phases'}>
    {modal === 'session' && <SessionDetailModal session={session} averageHr={state.trainingLogs[logKey(session.week, session.day)]?.averageHr || (session.preparationWeek ? session.averageHr : null)} fcMax={state.athleteProfile?.fcMax} canRegister={!isFutureSession} hasLog={hasLog} onRegister={() => setModal('journal')} onClose={closeModal} />}
    {modal === 'request' && <PreparationRequestForm coachName={state.requestCoach} requestDate={state.requestDate} setRequestDate={state.setRequestDate} onSubmit={() => { state.setRequestSent(true); setModal('request-done'); }} />}
    {modal === 'request-done' && <RequestSentNotice coachName={state.requestCoach} onBack={() => go('Dashboard')} />}
    {modal === 'request-review' && <RequestReview
      onReject={() => { state.setRequestStatus('Rechazada'); closeModal(); }}
      onAccept={() => { state.setRequestStatus('Aceptada'); closeModal(); }}
    />}
    {modal === 'phases' && <PhasesSummaryModal
      preparation={state.athletePreparation}
      coachWeeks={state.coachWeeks}
      week={state.week}
      onSelectWeek={(weekNumber) => { state.setWeek(weekNumber); closeModal(); }}
      onClose={closeModal}
    />}
  </ModalShell>;
}
