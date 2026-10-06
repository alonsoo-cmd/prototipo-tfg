import { useState } from 'react';
import DatePicker from '../components/ui/DatePicker.jsx';
import { sessions } from '../data/sessions.js';
import Diary from '../pages/athlete/Diary.jsx';
import FindCoach from '../pages/athlete/FindCoach.jsx';
import CoachHome from '../pages/coach/CoachHome.jsx';
import PreparationPage from '../pages/coach/PreparationPage.jsx';
import DataPage from '../pages/shared/DataPage.jsx';
import Profile from '../pages/shared/Profile.jsx';
import Dashboard from '../pages/shared/Dashboard.jsx';
import Metric from '../components/ui/Metric.jsx';
import ActivityForm from '../components/modals/ActivityForm.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Topbar from '../components/layout/Topbar.jsx';

export default function App(){
 const [trainingLogs, setTrainingLogs] = useState({});
 const [requestDate, setRequestDate] = useState('2026-12-06');
 const [preparations, setPreparations] = useState([{ id: 1, athleteId: 'alex', athleteName: 'Alex Martín', name: 'Preparación de otoño', duration: '12 semanas', coach: 'Lucía Fernández', objectives: [{ id: 11, name: 'Media Maratón Madrid', distance: 'Media maratón', eventDate: '2026-12-06' }] }]);
 const [role,setRole]=useState('atleta'), [page,setPage]=useState('Dashboard'), [week,setWeek]=useState(8), [modal,setModal]=useState(null), [activeSession,setActiveSession]=useState(sessions[0]), [activePlan,setActivePlan]=useState(true), [comment,setComment]=useState(''), [comments,setComments]=useState([]), [connected,setConnected]=useState(false), [requestSent,setRequestSent]=useState(false), [requestStatus,setRequestStatus]=useState('Pendiente'), [coachWeeks,setCoachWeeks]=useState(()=>Array.from({length:8},(_,i)=>({number:i+1,phase:i<3?'BI · Base':'BII · Acumulación',days:sessions.map(s=>({...s}))}))), [uploaded,setUploaded]=useState(false), [mobileNavOpen,setMobileNavOpen]=useState(false);
 const go=p=>{setPage(p);setModal(null)};
 const openSession=s=>{setActiveSession(s);setModal('session')};
 const addComment=()=>{if(comment.trim()){setComments([...comments,comment.trim()]);setComment('')}};
 const nav=role==='atleta'?[['Diary','▦'],['Data','◌'],['Profile','○']]:[['Athletes','♧'],['Preparations','▤'],['Profile','○']];
 const athletePreparation=preparations.find((item) => item.athleteId === 'alex') || null;
 return <div className="app-shell">
  <Sidebar role={role} page={page} mobileOpen={mobileNavOpen} onRoleChange={(nextRole,nextPage)=>{setRole(nextRole);setPage(nextPage);setMobileNavOpen(false)}} onNavigate={page=>{go(page);setMobileNavOpen(false)}}/>
    {mobileNavOpen&&<button className="mobile-nav-backdrop" aria-label="Cerrar menú" onClick={()=>setMobileNavOpen(false)}/>}
    
    <main className="main-area">
   <Topbar role={role} page={page} onMenuClick={()=>setMobileNavOpen(open=>!open)} menuOpen={mobileNavOpen}/>
   {page==='Dashboard'&&<Dashboard role={role} weekNumber={week} weeks={coachWeeks} onNavigate={go} onSession={openSession} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs}/>}
    
   {page==='Diary'&&role==='atleta'&&<Diary week={week} setWeek={setWeek} activePlan={activePlan} setActivePlan={setActivePlan} preparation={athletePreparation} onSession={openSession} onPlan={()=>go('Find coach')} onPhases={()=>setModal('phases')} coachWeeks={coachWeeks} trainingLogs={trainingLogs} setTrainingLogs={setTrainingLogs}/>
    }
   {page==='Data'&&<DataPage trainingLogs={trainingLogs} onSession={openSession}/>
    }
   {page==='Profile'&&<Profile preparation={preparations.find((item) => item.athleteId === 'alex') || null} setPreparations={setPreparations} />
    }
   {page==='Find coach'&&<FindCoach onRequest={()=>setModal('request')} sent={requestSent} setSent={setRequestSent}/>
    }
   {page==='Athletes'&&<CoachHome go={go} openRequest={()=>setModal('request-review')} requestStatus={requestStatus} weeks={coachWeeks} trainingLogs={trainingLogs}/>
    }
   {page==='Preparations'&&<PreparationPage weeks={coachWeeks} setWeeks={setCoachWeeks} preparations={preparations} setPreparations={setPreparations} trainingLogs={trainingLogs} onProfile={()=>go('Profile')}/>
    }
  </main>
  {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(null)}>
    <div className={'modal '+(modal==='phases'?'wide-modal':'')}>
    <button className="modal-close" onClick={()=>setModal(null)}>×</button>
    {modal==='session'&&<>
    <div className="eyebrow">{activeSession.day} · {activeSession.dateLabel || `${activeSession.date} OCT`}</div>
    <h2>{activeSession.type}</h2>
    <div className="modal-status">
    <span className={'dot-status '+activeSession.tone}/>
    {activeSession.state}<span className="separator">·</span>{activeSession.time}</div>
    <div className="detail-metrics">
    <Metric label="Duración" value={`${activeSession.mins} min`}/>
    
    <Metric label="Distancia" value={`${activeSession.km} km`}/>
    
    <Metric label="TRIMPS" value={activeSession.tr}/>
    
    </div>
    <div className="section-block">
    <h3>Comentario del entrenador
    </h3>
    <p>{activeSession.blocks}</p>
    </div>
    {activeSession.shoes && <div className="section-block session-shoes-note"><h3>Zapatillas recomendadas</h3><p>👟 {activeSession.shoes}</p></div>}
    {activeSession.details?.conditioningBlocks?.length > 0 && <div className="section-block session-conditioning-details">
      <h3>Bloques de acondicionamiento</h3>
      {activeSession.details.conditioningBlocks.map((block, index) => <div className="session-conditioning-block" key={`${block.type}-${index}`}>
        <strong>{block.type}</strong>
        {block.volume && <span>{block.volume}</span>}
        {block.exercises && <p>{block.exercises}</p>}
        {block.comment && <small>{block.comment}</small>}
      </div>)}
    </div>}
    {activeSession.details?.rpeMin != null && <div className="session-effort-range">
      <h3>Esfuerzo estimado</h3>
      <div className="session-range-values"><strong>RPE {activeSession.details.rpeMin}–{activeSession.details.rpeMax}</strong><small>Escala 1–10</small></div>
      {activeSession.details.paceFrom && activeSession.details.paceTo && <div className="session-range-values"><span>Ritmo</span><strong>{activeSession.details.paceFrom}–{activeSession.details.paceTo} min/km</strong></div>}
      {activeSession.details.hrMin && activeSession.details.hrMax && <div className="session-range-values"><span>Pulsaciones</span><strong>{activeSession.details.hrMin}–{activeSession.details.hrMax} ppm</strong></div>}
    </div>}
    <div className="inline-actions">
    <button className="button secondary" onClick={()=>setModal('activity')}>Registrar actividad</button>
    <button className="button primary" onClick={()=>setModal(null)}>Cerrar</button>
    </div>
    </>
    }
    {modal==='activity'&&<ActivityForm connected={connected} setConnected={setConnected} uploaded={uploaded} setUploaded={setUploaded} comments={comments} comment={comment} setComment={setComment} addComment={addComment}/>
    }
    {modal==='request'&&<>
    <div className="eyebrow">SOLICITUD DE PREPARACIÓN</div>
    <h2>Cuéntanos tu objetivo</h2>
    <p className="muted">La solicitud se enviará al entrenador para su revisión.</p>
    <label className="field-label">Fecha objetivo<DatePicker value={requestDate} onChange={setRequestDate} ariaLabel="Elegir fecha objetivo" />
    
    </label>
    <label className="field-label">Distancia objetivo<select defaultValue="10 km">
    <option>400 m</option>
    <option>800 m</option>
    <option>1.500 m</option>
    <option>3.000 m</option>
    <option>5 km</option>
    <option>10 km</option>
    <option>Media maratón</option>
    <option>Maratón</option>
    </select>
    </label>
    <label className="field-label">Comentario opcional<textarea rows="3" placeholder="Fechas, contexto o información útil"/>
    
    </label>
    <button className="button primary full" onClick={()=>{setRequestSent(true);setModal('request-done')}}>Enviar solicitud</button>
    </>
    }
    {modal==='request-done'&&<div className="center-state">
    <div className="success-icon">✓</div>
    <div className="eyebrow">SOLICITUD ENVIADA</div>
    <h2>Solicitud registrada</h2>
    <p>El entrenador recibirá los datos de tu objetivo y fechas.</p>
    <button className="button primary" onClick={()=>{setModal(null);go('Diary')}}>Volver al diario</button>
    </div>}
    {modal==='request-review'&&<>
    <div className="eyebrow">SOLICITUD RECIBIDA · HACE 2 H</div>
    <h2>Lucía Fernández</h2>
    <div className="detail-metrics">
    <Metric label="Distancia" value="Media maratón"/>
    
    <Metric label="Fecha objetivo" value="6 dic 2026"/>
    
    <Metric label="Ubicación" value="Madrid"/>
    
    </div>
    <p className="muted">“Estoy preparando mi primera media maratón. Me gustaría empezar en septiembre.”</p>
    <div className="inline-actions">
    <button className="button secondary" onClick={()=>{setRequestStatus('Rechazada');setModal(null)}}>Rechazar</button>
    <button className="button primary" onClick={()=>{setRequestStatus('Aceptada');setModal(null)}}>Aceptar solicitud</button>
    </div>
    </>
    }
    {modal==='phases'&&<>
    <div className="eyebrow">PREPARACIÓN ACTIVA · {athletePreparation?.duration || '12 semanas'}</div>
    <h2>Semanas y fases</h2>
    <p className="muted">Objetivos: {(athletePreparation?.objectives || []).map((objective) => `${objective.name} (${objective.distance})`).join(' · ') || 'Media Maratón Madrid'}.</p>
    <div className="phase-workout-list">{Object.values(coachWeeks.reduce((groups, planWeek) => {
      const phase = planWeek.phase || 'Sin fase';
      groups[phase] ||= { name: phase, weeks: [] };
      groups[phase].weeks.push(planWeek);
      return groups;
    }, {})).map((phase) => <details className="phase-workout-group" key={phase.name} open={phase.weeks.some((planWeek) => planWeek.number === week)}>
      <summary>{phase.name}<small>{phase.weeks.length} {phase.weeks.length === 1 ? 'semana' : 'semanas'}</small></summary>
      {phase.weeks.map((planWeek) => <details className={`phase-week ${planWeek.number === week ? 'current' : ''}`} key={planWeek.number} open={planWeek.number === week}>
        <summary>Semana {planWeek.number}{planWeek.number === week && <small>Semana seleccionada</small>}</summary>
        <div className="phase-week-workouts">{planWeek.days.filter((day) => day.type).map((day) => <div className="phase-workout-item" key={day.day}>
          <div><b>{day.day} · {day.type}</b><small>{day.date} {day.month || 'oct'}</small></div>
          <p>{day.desc || day.blocks || 'Sin descripción'}</p>
          <span>{day.mins || 0} min · {day.km || 0} km{day.shoes ? ` · 👟 ${day.shoes}` : ''}</span>
        </div>)}{!planWeek.days.some((day) => day.type) && <p className="phase-no-workouts">Todavía no hay entrenamientos planificados para esta semana.</p>}</div>
      </details>)}
    </details>)}</div>
    <button className="button primary" onClick={()=>setModal(null)}>Cerrar resumen</button>
    </>
    }
   </div>
    </div>}
 </div>
}
