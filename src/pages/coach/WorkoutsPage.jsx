import { useState } from 'react';
import { workoutColor, workoutTypes } from '../../data/coachAthletes.js';
import { WorkoutEditor } from './PreparationPage.jsx';

export default function WorkoutsPage({ templates = [], setTemplates }) {
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 9;
  const filteredTemplates = templates.filter((template) => typeFilter === 'all' || template.type === typeFilter);
  const pageCount = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));
  const visiblePage = Math.min(currentPage, pageCount - 1);
  const visibleTemplates = filteredTemplates.slice(visiblePage * pageSize, (visiblePage + 1) * pageSize);

  const saveTemplate = (workout) => {
    const saved = { ...workout, day: 'Plantilla', id: editing?.id || Date.now() };
    setTemplates((all) => editing?.id
      ? all.map((item) => item.id === editing.id ? saved : item)
      : [...all, saved]);
    setNotice(editing?.id ? 'Entrenamiento actualizado.' : 'Entrenamiento creado.');
    if (editing?.id) {
      setTypeFilter('all');
      setCurrentPage(Math.floor(Math.max(0, templates.findIndex((item) => item.id === editing.id)) / pageSize));
    } else {
      setTypeFilter('all');
      setCurrentPage(Math.floor(templates.length / pageSize));
    }
    setEditing(null);
  };

  return <div className="content coach-workouts-page">
    <div className="page-heading">
      <div><div className="eyebrow">ENTRENADOR · BIBLIOTECA</div><h1>Entrenamientos</h1><p>Crea y consulta entrenamientos prefabricados para tus planificaciones.</p></div>
      <button className="button primary" onClick={() => { setNotice(''); setEditing({ day: blankTemplate(), mode: 'new' }); }}>＋ Crear entrenamiento</button>
    </div>
    {notice && <p className="workout-template-notice" role="status">{notice}</p>}
    <div className="workout-library-toolbar"><label className="field-label">Filtrar por tipo<select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(0); }}><option value="all">Todos los tipos</option>{workoutTypes.map((type) => <option key={type}>{type}</option>)}</select></label><span>{filteredTemplates.length} entrenamiento{filteredTemplates.length === 1 ? '' : 's'}</span></div>

    {templates.length && filteredTemplates.length ? <div className="workout-template-grid">{visibleTemplates.map((template) => <article className={`workout-template-card workout-color-${workoutColor(template.type)}`} key={template.id}>
      <button className="workout-template-open" type="button" onClick={() => setEditing({ ...template, mode: 'view' })}>
        <span className="workout-template-type">{template.type}</span>
        <strong>{template.type || 'Entrenamiento'}</strong>
        <span className="workout-template-description">{template.desc || template.blocks || 'Sin descripción añadida.'}</span>
        <span className="workout-template-metrics">{template.mins || 0} min · {template.km || 0} km · {template.tr || 0} TR</span>
      </button>
      <button className="workout-template-delete" type="button" aria-label={`Eliminar ${template.type}`} onClick={() => { if (visibleTemplates.length === 1 && visiblePage > 0) setCurrentPage((page) => page - 1); setTemplates((all) => all.filter((item) => item.id !== template.id)); }}>Eliminar</button>
    </article>)}</div> : <section className="panel workout-template-empty"><div className="empty-graphic small">＋</div><h2>{templates.length ? 'No hay entrenamientos de este tipo' : 'No se ha creado ningún entrenamiento todavía'}</h2><p>{templates.length ? 'Prueba a seleccionar otro tipo de entrenamiento.' : 'Cuando guardes un entrenamiento prefabricado, aparecerá aquí.'}</p></section>}
    {templates.length > 0 && pageCount > 1 && <nav className="workout-template-pagination" aria-label="Páginas de entrenamientos"><button className="button secondary" type="button" disabled={visiblePage === 0} onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}>← Anterior</button><span>Página {visiblePage + 1} de {pageCount}</span><button className="button secondary" type="button" disabled={visiblePage >= pageCount - 1} onClick={() => setCurrentPage((page) => Math.min(pageCount - 1, page + 1))}>Siguiente →</button></nav>}

    {editing && <WorkoutEditor key={`${editing.id || 'new'}-${editing.mode}`} day={editing.day || editing} mode={editing.mode === 'view' ? 'template-view' : editing.mode} onClose={() => setEditing(null)} onSave={saveTemplate} />}
  </div>;
}

function blankTemplate() {
  return { day: 'Plantilla', date: '', month: '', type: '', tone: 'rest', desc: '', mins: 0, km: 0, tr: '0', state: 'Planificado', time: '—', blocks: '', wt: 0, zones: [0, 0, 0], warmup: '', cooldown: '', details: {} };
}
