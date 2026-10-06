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
    />
  );
}
