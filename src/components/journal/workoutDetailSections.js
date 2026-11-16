export function hasWorkoutDetailOption(session) {
  const type = session.type.trim().toLocaleLowerCase('es-ES');
  if (/descanso|acondicionamiento físico/.test(type) || /^rodaje$/.test(type) || /bicicleta|ciclismo|\bbici\b/.test(type)) return false;
  if (/long run|tirada larga/.test(type)) return Number(session.details?.changes) > 0;
  return true;
}

export function createWorkoutDetailSections(session) {
  const type = session.type.trim().toLocaleLowerCase('es-ES');
  const details = session.details || {};
  if (!hasWorkoutDetailOption(session)) return [];

  if (/long run|tirada larga/.test(type)) {
    return [makeDetailSection('cambios', 'Cambios de ritmo', ['pace', 'comment'], Array.from({ length: Number(details.changes) || 0 }, (_, index) => `Cambio ${index + 1}`))];
  }

  if (/gimnasio|\bgym\b/.test(type)) {
    const sections = [];
    const before = details.beforeGym;
    const after = details.afterGym;
    if (before) sections.push(...createRunningDetailSections(before, session, 'Trabajo antes del gimnasio', false));
    const exercises = details.exercises?.length ? details.exercises : [{ name: 'Ejercicio 1' }];
    const exerciseLabels = exercises.map((exercise) => {
      const name = exercise.name === 'Personalizado' ? details.customExercise || exercise.name : exercise.name;
      return `${name || 'Ejercicio'}${exercise.sets ? ` · Plan: ${exercise.sets}` : ''}`;
    });
    if (details.customExercise && !exerciseLabels.some((label) => label.startsWith(details.customExercise))) exerciseLabels.push(details.customExercise);
    sections.push(makeDetailSection('gimnasio', 'Gimnasio', ['sets', 'reps', 'weight', 'comment'], exerciseLabels));
    if (after) sections.push(...createRunningDetailSections(after, session, 'Trabajo después del gimnasio', false));
    if (!before && !after && /rodaje|bicicleta|bici/.test(type)) {
      const isBike = /bicicleta|bici/.test(type);
      sections.push(makeDetailSection('gym-running', isBike ? 'Bicicleta' : 'Rodaje', [isBike ? 'speed' : 'pace', 'comment'], [isBike ? 'Bicicleta' : 'Rodaje']));
    }
    return sections;
  }

  if (/series largas|series cortas|^series$/.test(type)) {
    const rows = plannedWorkoutRows(session, 'Serie', 'm');
    const isShort = /series cortas/.test(type) || (/^series$/.test(type) && rows.every((row) => isSubKilometerSeries(typeof row === 'string' ? row : row.label)));
    return [makeDetailSection('series', 'Series', ['time', 'comment', ...(isShort ? ['withSled'] : [])], rows, { allowHundredths: isShort })];
  }

  if (/cambios/.test(type)) {
    return [makeDetailSection('cambios', 'Cambios de ritmo', ['pace', 'comment'], plannedWorkoutRows(session, 'Cambio'))];
  }

  if (/cuestas/.test(type)) {
    const hillGroups = (details.groups || []).filter((group) => !/umbral|serie/i.test(`${group.guide || ''} ${group.target || ''} ${group.comment || ''}`));
    const hillPlan = { ...session, details: { ...details, groups: hillGroups } };
    const sections = [makeDetailSection('cuestas', 'Cuestas', ['pace', 'comment'], plannedWorkoutRows(hillPlan, 'Cuesta'))];
    const description = `${session.type} ${session.desc || ''} ${session.blocks || ''} ${(details.groups || []).map((group) => `${group.guide || ''} ${group.target || ''} ${group.comment || ''}`).join(' ')}`;
    if (/umbral/i.test(description)) sections.push(makeDetailSection('umbral', 'Bloque de umbral', ['pace', 'comment'], plannedRowsForOptionalBlock(session, 'Umbral', 'umbral')));
    if (/series/i.test(description)) {
      const shortSeries = /series cortas/i.test(description);
      sections.push(makeDetailSection('series', 'Series', ['time', 'comment', ...(shortSeries ? ['withSled'] : [])], plannedRowsForOptionalBlock(session, 'Serie', 'serie', 'm'), { allowHundredths: true }));
    }
    return sections;
  }

  if (/competici[oó]n/.test(type)) {
    const sections = [makeDetailSection('competicion', 'Competición', ['time', 'comment'], ['Resultado de carrera'])];
    if (Number(details.preRaceReps) > 0) sections.push(makeDetailSection('pre-race', 'Series previas', ['time', 'comment'], Array.from({ length: Math.min(10, Number(details.preRaceReps)) }, (_, index) => `Serie previa ${index + 1}`)));
    if (Number(details.thresholdReps) > 0) sections.push(makeDetailSection('pre-threshold', 'Bloques de umbral', ['time', 'comment'], Array.from({ length: Math.min(5, Number(details.thresholdReps)) }, (_, index) => `Umbral ${index + 1}`)));
    return sections;
  }

  if (/test/.test(type)) return [makeDetailSection('test', 'Resultado del test', ['time', 'comment'], [details.testExplanation || 'Test'])];
  if (/umbral/.test(type)) return [makeDetailSection('umbral', 'Umbral', ['pace', 'comment'], plannedWorkoutRows(session, 'Bloque'))];
  return [makeDetailSection('bloques', 'Bloques del entrenamiento', ['time', 'comment'], plannedWorkoutRows(session, 'Bloque'))];
}

function createRunningDetailSections(workoutType, session, title, useGroups = true) {
  const type = workoutType.toLocaleLowerCase('es-ES');
  const isSeries = /series/.test(type);
  const rows = useGroups ? plannedWorkoutRows({ ...session, type: workoutType }, title, isSeries ? 'm' : '') : [title];
  const isShort = /cortas/.test(type) || (isSeries && rows.every((row) => isSubKilometerSeries(typeof row === 'string' ? row : row.label)));
  const fields = isSeries ? ['time', 'comment', ...(isShort ? ['withSled'] : [])] : ['pace', 'comment'];
  return [makeDetailSection(`gym-${title}`, title, fields, rows, { allowHundredths: isShort })];
}

function plannedWorkoutRows(session, rowName, defaultUnit = '') {
  const groups = (session.details?.groups || []).filter((group) => Number(group.repetitions) > 0);
  if (groups.length) {
    let rowNumber = 0;
    return groups.flatMap((group) => Array.from({ length: Math.min(50, Number(group.repetitions)) }, () => {
      rowNumber += 1;
      const interval = group.interval ? ` · ${group.interval}${defaultUnit && /^\d+(?:[.,]\d+)?$/.test(String(group.interval)) ? ` ${defaultUnit}` : ''}` : '';
      return { label: `${rowName} ${rowNumber}${interval}`, plannedSled: Boolean(group.withSled) };
    }));
  }

  const matches = [...`${session.type} ${session.desc || ''}`.matchAll(/(\d+)\s*[×x]\s*(\d+(?:[.,]\d+)?)\s*(km|m|min|s|′|″)?/gi)];
  let rowNumber = 0;
  const rows = matches.flatMap((match) => Array.from({ length: Math.min(50, Number(match[1])) }, () => {
    rowNumber += 1;
    const interval = `${match[2].replace(',', '.')}${match[3] ? ` ${match[3]}` : defaultUnit ? ` ${defaultUnit}` : ''}`;
    return { label: `${rowName} ${rowNumber} · ${interval}`, plannedSled: false };
  }));
  return rows.length ? rows : [rowName];
}

function plannedRowsForOptionalBlock(session, rowName, keyword, defaultUnit = '') {
  const matchingGroups = (session.details?.groups || []).filter((group) => `${group.guide || ''} ${group.target || ''} ${group.comment || ''}`.toLocaleLowerCase('es-ES').includes(keyword));
  const descriptionParts = `${session.desc || ''} · ${session.blocks || ''}`.split(/[·\n;]/).filter((part) => part.toLocaleLowerCase('es-ES').includes(keyword));
  const source = matchingGroups.length
    ? { ...session, details: { ...session.details, groups: matchingGroups } }
    : { ...session, type: rowName, desc: descriptionParts.join(' · ') || rowName, details: { ...session.details, groups: [] } };
  return plannedWorkoutRows(source, rowName, defaultUnit);
}

function makeDetailSection(id, title, fields, rowLabels, options = {}) {
  return {
    id,
    title,
    fields,
    allowHundredths: Boolean(options.allowHundredths),
    rows: rowLabels.map((row, index) => {
      const item = typeof row === 'string' ? { label: row } : row;
      return { id: createDetailId(), ...item, time: '', pace: '', comment: '', sets: '', reps: '', weight: '', withSled: false, performed: false };
    }),
  };
}

function createDetailId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isValidDuration(value, allowHundredths = false) {
  const decimalPart = allowHundredths ? '(?:[.,]\\d{1,2})?' : '';
  return new RegExp(`^(?:\\d{1,2}:)?[0-5]?\\d:[0-5]\\d${decimalPart}$`).test(value.trim());
}

export function isSubKilometerSeries(label) {
  const match = label.match(/(\d+(?:[.,]\d+)?)\s*(m|km)\b/i);
  if (!match) return false;
  const distance = Number(match[1].replace(',', '.')) * (match[2].toLowerCase() === 'km' ? 1000 : 1);
  return distance < 1000;
}
