import { workoutTypes } from './coachAthletes.js';

const descriptions = {
  'Rodaje': ['Rodaje cómodo en terreno llano', 'Rodaje progresivo con final controlado', 'Rodaje aeróbico por caminos'],
  'Long run / tirada larga': ['Tirada continua a ritmo cómodo', 'Tirada larga con final progresivo', 'Fondo aeróbico estable'],
  'Cambios': ['Cambios de ritmo controlados', 'Fartlek con tramos vivos', 'Alternancia de ritmos en circuito'],
  'Cuestas': ['Repeticiones en cuesta con recuperación bajando', 'Trabajo de fuerza en cuesta', 'Cuestas cortas con técnica cuidada'],
  'Series largas': ['Intervalos largos a ritmo umbral', 'Series largas con recuperación activa', 'Bloques sostenidos de calidad'],
  'Series cortas': ['Repeticiones cortas y rápidas', 'Series cortas con recuperación amplia', 'Velocidad y técnica en pista'],
  'Competición': ['Competición con calentamiento completo', 'Carrera objetivo con estrategia conservadora', 'Control de ritmo de competición'],
  'Gimnasio': ['Fuerza general de tren inferior', 'Sesión de fuerza y estabilidad', 'Fuerza unilateral y trabajo de core'],
  'Acondicionamiento físico': ['Circuito de acondicionamiento general', 'Movilidad, core y estabilidad', 'Trabajo compensatorio y preventivo'],
  'Test': ['Test de campo para revisar zonas', 'Control de umbral y sensaciones', 'Prueba de referencia de temporada'],
  'Core': ['Estabilidad central y control postural', 'Circuito de core', 'Core y movilidad de cadera'],
  'Movilidad': ['Movilidad general y estiramientos dinámicos', 'Rutina de movilidad de tobillo y cadera', 'Descarga y amplitud de movimiento'],
  'Pliometría': ['Saltos de baja intensidad y coordinación', 'Pliometría básica con recuperación completa', 'Reactividad y técnica de salto'],
  'Descanso': ['Descanso completo', 'Día de recuperación', 'Descanso y paseo opcional'],
};

export function createSampleWorkoutTemplates() {
  return Array.from({ length: 30 }, (_, index) => {
    const type = workoutTypes[index % workoutTypes.length];
    const seed = index + 5;
    const zones = [10 + (seed * 7) % 22, 5 + (seed * 11) % 18, (seed * 13) % 12];
    if (type === 'Descanso') zones.splice(0, 3, 0, 0, 0);
    const mins = zones.reduce((sum, value) => sum + value, 0) || 0;
    const km = type === 'Gimnasio' || type === 'Core' || type === 'Movilidad' || type === 'Pliometría' || type === 'Descanso'
      ? 0 : Math.round((3 + ((seed * 17) % 145) / 10) * 10) / 10;
    const description = descriptions[type]?.[seed % 3] || `${type}: sesión de ejemplo ${index + 1}`;
    const details = {};
    if (!['Descanso', 'Acondicionamiento físico'].includes(type)) {
      details.rpeMin = String(3 + (seed % 4));
      details.rpeMax = String(5 + (seed % 5));
    }
    if (type === 'Series largas' || type === 'Series cortas' || type === 'Cambios' || type === 'Cuestas') {
      details.groups = [{ repetitions: String(4 + seed % 5), interval: type.includes('Series') ? `${400 + seed % 4 * 200} m` : '2 min', guide: 'RPE', target: `RPE ${6 + seed % 3}`, recovery: '90 s', comment: 'Mantener la técnica', withSled: false }];
    }
    if (type === 'Gimnasio') details.exercises = [{ name: 'Sentadilla normal', sets: `${3 + seed % 3} × 8`, comment: 'Controlar la ejecución' }];
    if (type === 'Acondicionamiento físico') details.conditioningBlocks = [{ type: 'Core', exercises: 'Plancha y bird dog', volume: '3 × 30 s', comment: 'Sin dolor' }];
    return {
      id: `sample-${String(index + 1).padStart(2, '0')}`,
      day: 'Plantilla', type, tone: type === 'Descanso' ? 'rest' : 'blue',
      desc: description, blocks: description, mins, km, tr: String(zones[0] + 2 * zones[1] + 3 * zones[2]),
      zones, details, shoes: type === 'Series cortas' ? 'Voladoras' : '',
      state: 'Planificado', time: '—', wt: 0,
    };
  });
}
