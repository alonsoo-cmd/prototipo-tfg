import ModalShell from '../components/modals/ModalShell.jsx';
import SessionDetailModal from '../components/modals/SessionDetailModal.jsx';
import ActivityForm from '../components/modals/ActivityForm.jsx';
import PhasesSummaryModal from '../components/modals/PhasesSummaryModal.jsx';
import { PreparationRequestForm, RequestReview, RequestSentNotice } from '../components/modals/PreparationRequestModals.jsx';

/** Modales globales: decide cuál mostrar según `state.modal` y los conecta al estado. */
export default function AppModals({ state }) {
  const { modal, setModal, closeModal, go } = state;
  if (!modal) return null;

  return <ModalShell onClose={closeModal} wide={modal === 'phases'}>
    {modal === 'session' && <SessionDetailModal session={state.activeSession} onRegister={() => setModal('activity')} onClose={closeModal} />}
    {modal === 'activity' && <ActivityForm connected={state.connected} setConnected={state.setConnected} uploaded={state.uploaded} setUploaded={state.setUploaded} comments={state.comments} comment={state.comment} setComment={state.setComment} addComment={state.addComment} />}
    {modal === 'request' && <PreparationRequestForm requestDate={state.requestDate} setRequestDate={state.setRequestDate} onSubmit={() => { state.setRequestSent(true); setModal('request-done'); }} />}
    {modal === 'request-done' && <RequestSentNotice onBack={() => go('Diary')} />}
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
