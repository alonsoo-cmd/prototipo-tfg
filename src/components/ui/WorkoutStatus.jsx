// Cada estado lleva símbolo además de color, para quien no distingue colores.
export const statusGlyphs = { completed: '✓', partial: '½', missed: '✕', unreported: '' };

const statusLabels = {
  completed: 'Completado',
  partial: 'A medias',
  missed: 'No realizado',
};

export default function WorkoutStatus({ status, className = '' }) {
  const normalizedStatus = statusLabels[status] ? status : 'unreported';
  const label = statusLabels[normalizedStatus] || 'Sin registrar';

  return (
    <span
      className={`workout-status-indicator ${normalizedStatus} ${className}`.trim()}
      role="img"
      aria-label={label}
      title={label}
    ><span aria-hidden="true">{statusGlyphs[normalizedStatus]}</span></span>
  );
}
