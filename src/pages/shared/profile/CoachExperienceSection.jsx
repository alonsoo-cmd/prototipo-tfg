import { useState } from 'react';

export const MAX_COACH_TITLES = 5;
export const MAX_COACH_DESCRIPTION = 500;
const MAX_TITLE_NAME = 80;
const MIN_TITLE_YEAR = 1950;
const emptyTitle = { name: '', year: '' };

const onlyYearDigits = (value) => value.replace(/\D/g, '').slice(0, 4);
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Mensaje de error del año, o '' si todavía se está escribiendo o es correcto. */
function yearError(year, currentYear) {
  if (year.length < 4) return '';
  const value = Number(year);
  return value < MIN_TITLE_YEAR || value > currentYear ? `El año debe estar entre ${MIN_TITLE_YEAR} y ${currentYear}.` : '';
}

/**
 * Sección del perfil exclusiva del entrenador: descripción de su estilo y títulos (nombre + año).
 * Trabaja sobre un borrador (`value`); los cambios solo se conservan al guardar el perfil.
 */
export default function CoachExperienceSection({ value, onChange, unsaved = false }) {
  const [newTitle, setNewTitle] = useState(emptyTitle);
  const [editing, setEditing] = useState(null);
  const currentYear = new Date().getFullYear();
  const { description, titles } = value;
  const limitReached = titles.length >= MAX_COACH_TITLES;
  const isValid = (title) => Boolean(title.name.trim()) && title.year.length === 4 && !yearError(title.year, currentYear);
  const addError = yearError(newTitle.year, currentYear);
  const editError = editing ? yearError(editing.year, currentYear) : '';

  const addTitle = () => {
    if (limitReached || !isValid(newTitle)) return;
    onChange({ ...value, titles: [...titles, { id: createId(), name: newTitle.name.trim(), year: Number(newTitle.year) }] });
    setNewTitle(emptyTitle);
  };
  const acceptEdit = () => {
    if (!editing || !isValid(editing)) return;
    onChange({ ...value, titles: titles.map((title) => (title.id === editing.id ? { ...title, name: editing.name.trim(), year: Number(editing.year) } : title)) });
    setEditing(null);
  };
  const removeTitle = (id) => {
    onChange({ ...value, titles: titles.filter((title) => title.id !== id) });
    if (editing?.id === id) setEditing(null);
  };
  // El perfil entero es un <form>: Intro en estos campos añade o confirma el título en vez de guardar la página.
  const onKeys = (onEnter, onEscape) => (event) => {
    if (event.key === 'Enter') { event.preventDefault(); onEnter(); }
    else if (event.key === 'Escape' && onEscape) { event.preventDefault(); onEscape(); }
  };

  return <section className="panel profile-coach-panel" aria-labelledby="coach-experience-title">
    <div className="panel-title">
      <div><h2 id="coach-experience-title">Experiencia como entrenador</h2></div>
      {unsaved && <span className="unsaved-tag" role="status">Cambios sin guardar</span>}
    </div>

    <div className="coach-experience-grid">
      <div className="coach-experience-block">
        <div className="coach-experience-head">
          <label htmlFor="coach-style">Estilo de entrenamiento</label>
          <span id="coach-style-counter" className={`limit-badge ${description.length >= MAX_COACH_DESCRIPTION ? 'is-full' : ''}`} aria-label={`${description.length} de ${MAX_COACH_DESCRIPTION} caracteres`}>{description.length}/{MAX_COACH_DESCRIPTION}</span>
        </div>
        <textarea
          id="coach-style"
          className="coach-style-input"
          rows="6"
          maxLength={MAX_COACH_DESCRIPTION}
          aria-describedby="coach-style-counter"
          value={description}
          onChange={(event) => onChange({ ...value, description: event.target.value.slice(0, MAX_COACH_DESCRIPTION) })}
          placeholder="Describe cómo planificas y con qué tipo de atletas trabajas"
        />
      </div>

      <div className="coach-experience-block" role="group" aria-labelledby="coach-titles-label">
        <div className="coach-experience-head">
          <span id="coach-titles-label">Títulos</span>
          <span className={`limit-badge ${limitReached ? 'is-full' : ''}`} aria-label={`${titles.length} de ${MAX_COACH_TITLES} títulos`}>{titles.length}/{MAX_COACH_TITLES}</span>
        </div>
        {titles.length ? <ul className="coach-title-list">{titles.map((title) => (editing?.id === title.id
          ? <li className="coach-title is-editing" key={title.id}>
            <input autoFocus aria-label="Nombre del título" maxLength={MAX_TITLE_NAME} value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} onKeyDown={onKeys(acceptEdit, () => setEditing(null))} />
            <input className="coach-title-year-input" aria-label="Año del título" inputMode="numeric" value={editing.year} onChange={(event) => setEditing({ ...editing, year: onlyYearDigits(event.target.value) })} onKeyDown={onKeys(acceptEdit, () => setEditing(null))} />
            <div className="coach-title-actions">
              <button type="button" className="button primary" disabled={!isValid(editing)} onClick={acceptEdit}>Aceptar</button>
              <button type="button" className="ghost-action" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
            {editError && <p className="coach-title-error" role="alert">{editError}</p>}
          </li>
          : <li className="coach-title" key={title.id}>
            <span className="coach-title-year">{title.year}</span>
            <strong className="coach-title-name">{title.name}</strong>
            <div className="coach-title-actions">
              <button type="button" className="ghost-action" aria-label={`Editar título ${title.name}`} onClick={() => setEditing({ id: title.id, name: title.name, year: String(title.year) })}><PencilIcon />Editar</button>
              <button type="button" className="ghost-action is-danger" aria-label={`Eliminar título ${title.name}`} onClick={() => removeTitle(title.id)}><TrashIcon />Eliminar</button>
            </div>
          </li>))}</ul> : <p className="coach-titles-empty">Todavía no has añadido ningún título.</p>}

        <div className={`coach-title-add ${limitReached ? 'is-disabled' : ''}`}>
          <label className="field-label">Nombre del título<input maxLength={MAX_TITLE_NAME} disabled={limitReached} value={newTitle.name} onChange={(event) => setNewTitle({ ...newTitle, name: event.target.value })} onKeyDown={onKeys(addTitle)} placeholder="Ej. Entrenador Nacional de Atletismo" /></label>
          <label className="field-label">Año<input inputMode="numeric" disabled={limitReached} value={newTitle.year} onChange={(event) => setNewTitle({ ...newTitle, year: onlyYearDigits(event.target.value) })} onKeyDown={onKeys(addTitle)} placeholder={String(currentYear)} /></label>
          <button type="button" className="button" disabled={limitReached || !isValid(newTitle)} onClick={addTitle}>＋ Añadir título</button>
        </div>
        {addError && !limitReached && <p className="coach-title-error" role="alert">{addError}</p>}
        {limitReached && <p className="coach-titles-limit" role="status"><span aria-hidden="true">!</span>Has alcanzado el máximo de {MAX_COACH_TITLES} títulos. Elimina uno para poder añadir otro.</p>}
      </div>
    </div>
  </section>;
}

function PencilIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11.3 2.3a1.4 1.4 0 0 1 2 2L5.5 12.2 2.7 13l.8-2.8z" /><path d="M10 3.6l2.4 2.4" /></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.8 4.3h10.4" /><path d="M6.2 4.3V3a.7.7 0 0 1 .7-.7h2.2a.7.7 0 0 1 .7.7v1.3" /><path d="M4.1 4.3l.6 8.1a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9l.6-8.1" /><path d="M6.7 7v3.6M9.3 7v3.6" /></svg>;
}
