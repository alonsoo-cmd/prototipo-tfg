// Fuente única de las páginas: clave interna → etiqueta visible e icono.
// La usan el menú lateral y la barra superior (migas de pan).

export const PAGES = {
  Dashboard: { label: 'Inicio', icon: '⌂' },
  Diary: { label: 'Diario', icon: '▦' },
  Data: { label: 'Datos', icon: '◌' },
  Profile: { label: 'Perfil', icon: '○' },
  'Find coach': { label: 'Buscar entrenador', icon: '⌕' },
  Athletes: { label: 'Atletas', icon: '♧' },
  Preparations: { label: 'Preparaciones', icon: '▤' },
  Workouts: { label: 'Entrenamientos', icon: '▣' },
};

export const athleteNavigation = ['Dashboard', 'Diary', 'Data'];
export const coachNavigation = ['Athletes', 'Preparations', 'Workouts'];

export const ROLE_AREAS = {
  atleta: 'Área del atleta',
  grupo: 'Área del grupo',
  entrenador: 'Área del entrenador',
};

export const ROLE_SUBTITLES = {
  atleta: 'Atleta · Madrid',
  grupo: 'Atleta de grupo',
  entrenador: 'Entrenador',
};

export function pageLabel(page) {
  return PAGES[page]?.label || page;
}
