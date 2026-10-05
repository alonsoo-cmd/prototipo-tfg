export function createInjuryAlerts(weeks = [], trainingLogs = [], athleteName = 'Atleta') {
  const orderedDays = [...weeks]
    .sort((a, b) => a.number - b.number)
    .flatMap((week) => week.days.map((day) => ({
      week: week.number,
      day,
      log: trainingLogs[`${week.number}-${day.day}`],
    })));
  const alerts = new Map();

  orderedDays.forEach(({ week, day, log }, index) => {
    (log?.injuries || []).forEach((injury) => {
      const level = Number(injury.level);
      const region = injury.region;
      if (!region || !level) return;

      const highIntensity = level > 5;
      const persisted = index >= 2 && [index - 2, index - 1, index].every((dayIndex) =>
        orderedDays[dayIndex].log?.injuries?.some((entry) => entry.region === region && Number(entry.level) > 0),
      );
      if (!highIntensity && !persisted) return;

      const current = alerts.get(region) || { region, regionLabel: injury.regionLabel || region.replaceAll('-', ' '), athleteName, level, week, day: day.day, reasons: [] };
      current.level = Math.max(current.level, level);
      current.week = week;
      current.day = day.day;
      current.regionLabel = injury.regionLabel || current.regionLabel;
      current.description = injury.description || current.description;
      if (highIntensity && !current.reasons.includes('Intensidad superior a 5/10')) current.reasons.push('Intensidad superior a 5/10');
      if (persisted && !current.reasons.includes('Molestia registrada 3 días seguidos')) current.reasons.push('Molestia registrada 3 días seguidos');
      alerts.set(region, current);
    });
  });

  return [...alerts.values()];
}
