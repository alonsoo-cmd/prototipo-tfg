import { workoutTypes } from './coachAthletes.js';

const descriptions = {
  'Rodaje': ['Rodaje cómodo en terreno llano', 'Rodaje progresivo con final controlado', 'Rodaje aeróbico por caminos'],
  'Bicicleta': ['Rodaje suave en bicicleta', 'Sesión de ciclismo aeróbico regenerativo', 'Rodaje en bicicleta a velocidad constante'],
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

// Ritmo medio de la sesión completa (incluye calentamiento y recuperaciones), en min/km.
// Los km se calculan a partir de los minutos para que el ritmo resultante sea creíble.
const sessionPace = {
  'Rodaje': 5.25,
  'Long run / tirada larga': 5.35,
  'Cambios': 4.9,
  'Cuestas': 5.9,
  'Series largas': 4.75,
  'Series cortas': 5.1,
  'Competición': 4.4,
  'Test': 5,
};
const cyclingSpeed = 26; // km/h
const noDistanceTypes = ['Gimnasio', 'Acondicionamiento físico', 'Core', 'Movilidad', 'Pliometría', 'Descanso'];

export function createSampleWorkoutTemplates() {
  return Array.from({ length: 30 }, (_, index) => {
    const type = workoutTypes[index % workoutTypes.length];
    const seed = index + 5;
    const zones = type === 'Long run / tirada larga'
      ? [60 + (seed * 7) % 30, 8 + (seed * 11) % 12, 0]
      : [10 + (seed * 7) % 22, 5 + (seed * 11) % 18, (seed * 13) % 12];
    if (type === 'Descanso') zones.splice(0, 3, 0, 0, 0);
    const mins = zones.reduce((sum, value) => sum + value, 0) || 0;
    const variation = 1 + (((seed * 7) % 9) - 4) / 100; // ±4 % para que no salgan todas iguales
    const km = noDistanceTypes.includes(type)
      ? 0
      : type === 'Bicicleta'
        ? Math.round((mins / 60) * cyclingSpeed * variation * 10) / 10
        : Math.round((mins / ((sessionPace[type] || 5.25) * variation)) * 10) / 10;
    const description = descriptions[type]?.[seed % 3] || `${type}: sesión de ejemplo ${index + 1}`;
    const details = {};
    if (!['Descanso', 'Acondicionamiento físico'].includes(type)) {
      details.rpeMin = String(3 + (seed % 4));
      details.rpeMax = String(5 + (seed % 5));
    }
    if (type === 'Bicicleta') {
      details.speedFrom = '22';
      details.speedTo = '28';
    }
    if (type === 'Series largas' || type === 'Series cortas' || type === 'Cambios' || type === 'Cuestas') {
      details.groups = [{ repetitions: String(4 + seed % 5), interval: type.includes('Series') ? `${400 + seed % 4 * 200} m` : '2 min', guide: 'RPE', target: `RPE ${6 + seed % 3}`, recovery: '90 s', comment: 'Mantener la técnica', withSled: false }];
    }
    if (type === 'Gimnasio') details.exercises = [{ name: 'Sentadilla normal', sets: `${3 + seed % 3} × 8`, comment: 'Controlar la ejecución' }];
    if (type === 'Acondicionamiento físico') details.conditioningBlocks = [{ type: 'Core', exercises: 'Plancha y bird dog', volume: '3 × 30 s', comment: 'Sin dolor' }];
    return {
      id: `sample-${String(index + 1).padStart(2, '0')}`,
      day: 'Plantilla', type, tone: type === 'Descanso' ? 'rest' : 'blue',
      desc: description, blocks: description, mins, km,
      zones, details, shoes: type === 'Series cortas' ? 'Voladoras' : '',
      state: 'Planificado', time: '—', wt: 0,
    };
  });
}
