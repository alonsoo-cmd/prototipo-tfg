// Directorio de entrenadores (datos de ejemplo) para «Buscar entrenador».
// 10 entrenadores en Madrid, Móstoles y Alcorcón con tres especialidades.

export const coachLocations = ['Madrid', 'Móstoles', 'Alcorcón'];
export const coachSpecialties = ['1.500 m', '10K', 'Maratón'];

export const coaches = [
  {
    id: 'carlos-ruiz', initials: 'CR', name: 'Carlos Ruiz', title: 'Entrenador de atletismo',
    location: 'Madrid', specialty: '10K', modality: 'Presencial y online', verified: true,
    experience: 12, athletes: 18,
    bio: 'Especialista en fondo en ruta. Planificación individual y seguimiento semanal de carga y sesiones.',
    approach: 'Bloques de 3-4 semanas con una semana de descarga. Revisión del diario cada lunes.',
    achievements: ['Entrenador nacional de atletismo (RFEA)', 'Atletas sub-35 en 10K'],
  },
  {
    id: 'lucia-morales', initials: 'LM', name: 'Lucía Morales', title: 'Entrenadora de running',
    location: 'Alcorcón', specialty: '10K', modality: 'Online', verified: true,
    experience: 7, athletes: 25,
    bio: 'Pruebas populares y planificación de temporada para atletas de distintos niveles.',
    approach: 'Planes flexibles para quien entrena 3-5 días por semana compaginando trabajo.',
    achievements: ['Monitora de atletismo (RFEA)', 'Grupo de running en Alcorcón desde 2019'],
  },
  {
    id: 'javier-ortega', initials: 'JO', name: 'Javier Ortega', title: 'Entrenador de medio fondo',
    location: 'Madrid', specialty: '1.500 m', modality: 'Presencial', verified: true,
    experience: 15, athletes: 12,
    bio: 'Medio fondo en pista: velocidad, técnica de carrera y táctica de competición.',
    approach: 'Sesiones en pista de Vallehermoso con trabajo de fuerza integrado.',
    achievements: ['Entrenador nacional de atletismo (RFEA)', 'Finalistas en campeonatos de España sub-23'],
  },
  {
    id: 'elena-santos', initials: 'ES', name: 'Elena Santos', title: 'Entrenadora de maratón',
    location: 'Madrid', specialty: 'Maratón', modality: 'Presencial y online', verified: true,
    experience: 10, athletes: 20,
    bio: 'Preparaciones de maratón y media maratón con control de volumen y prevención de lesiones.',
    approach: 'Ciclos de 16 semanas con tiradas largas progresivas y test de ritmo cada mes.',
    achievements: ['Máster en Alto Rendimiento Deportivo', 'Más de 80 maratonianos preparados'],
  },
  {
    id: 'david-herrero', initials: 'DH', name: 'David Herrero', title: 'Entrenador de atletismo',
    location: 'Móstoles', specialty: '1.500 m', modality: 'Presencial', verified: false,
    experience: 5, athletes: 9,
    bio: 'Iniciación y perfeccionamiento en medio fondo para atletas jóvenes y veteranos.',
    approach: 'Dos sesiones de calidad por semana en la pista de Móstoles y rodajes libres.',
    achievements: ['Monitor de atletismo (RFEA)'],
  },
  {
    id: 'marta-iglesias', initials: 'MI', name: 'Marta Iglesias', title: 'Entrenadora de fondo',
    location: 'Móstoles', specialty: '10K', modality: 'Presencial y online', verified: true,
    experience: 9, athletes: 16,
    bio: 'Fondo en ruta y cross. Trabajo por zonas de pulsaciones y umbrales de lactato.',
    approach: 'Test de lactato al inicio y a mitad de preparación para ajustar las zonas.',
    achievements: ['Graduada en Ciencias de la Actividad Física y del Deporte', 'Entrenadora nacional (RFEA)'],
  },
  {
    id: 'pablo-navarro', initials: 'PN', name: 'Pablo Navarro', title: 'Entrenador de maratón',
    location: 'Alcorcón', specialty: 'Maratón', modality: 'Online', verified: false,
    experience: 4, athletes: 11,
    bio: 'Primer maratón y mejora de marca para corredores populares.',
    approach: 'Plan semanal con alternativas para semanas con poco tiempo.',
    achievements: ['Maratoniano con 2:41 de marca personal'],
  },
  {
    id: 'irene-castro', initials: 'IC', name: 'Irene Castro', title: 'Entrenadora de medio fondo',
    location: 'Alcorcón', specialty: '1.500 m', modality: 'Presencial', verified: true,
    experience: 11, athletes: 14,
    bio: 'Medio fondo y obstáculos. Especial atención a la técnica y a la fuerza reactiva.',
    approach: 'Pliometría y técnica dos días por semana; series cortas en pista.',
    achievements: ['Entrenadora nacional de atletismo (RFEA)', 'Exatleta internacional de 1.500 m'],
  },
  {
    id: 'sergio-gil', initials: 'SG', name: 'Sergio Gil', title: 'Entrenador de running',
    location: 'Madrid', specialty: '10K', modality: 'Online', verified: false,
    experience: 3, athletes: 30,
    bio: 'Grupos de entrenamiento en Madrid Río y planes online para 5K y 10K.',
    approach: 'Entrenamientos en grupo martes y jueves; el resto, plan individual.',
    achievements: ['Técnico deportivo en atletismo'],
  },
  {
    id: 'nuria-vega', initials: 'NV', name: 'Nuria Vega', title: 'Entrenadora de maratón',
    location: 'Móstoles', specialty: 'Maratón', modality: 'Presencial y online', verified: true,
    experience: 14, athletes: 22,
    bio: 'Larga distancia: maratón, ultra en ruta y trail de media distancia.',
    approach: 'Periodización por bloques con seguimiento de HRV y bienestar diario.',
    achievements: ['Doctora en Ciencias del Deporte', 'Entrenadora nacional (RFEA)'],
  },
];
