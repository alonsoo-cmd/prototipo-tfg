export const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export function summarize(records, label, key) {
  const days = records.map((record) => record.date);
  const wellnessValues = records.map((record) => record.wellbeingTotal).filter(Number.isFinite);
  const hrvValues = records.map((record) => record.hrv).filter(Number.isFinite);
  const restingHrValues = records.map((record) => record.restingHr).filter(Number.isFinite);
  return {
    key,
    label,
    records,
    date: records[0]?.date,
    week: records[0]?.preparationWeek,
    firstDate: days.sort()[0],
    kilometers: records.reduce((sum, record) => sum + record.distance, 0),
    minutes: records.reduce((sum, record) => sum + record.minutes, 0),
    trimps: records.reduce((sum, record) => sum + record.trimps, 0),
    wellbeingTotal: wellnessValues.length ? wellnessValues.reduce((sum, value) => sum + value, 0) / wellnessValues.length : null,
    hrv: hrvValues.length ? hrvValues.reduce((sum, value) => sum + value, 0) / hrvValues.length : null,
    restingHr: restingHrValues.length ? restingHrValues.reduce((sum, value) => sum + value, 0) / restingHrValues.length : null,
  };
}

export function toDateKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function summarizeTypes(records) {
  const groups = groupBy(records, (record) => record.type);
  return [...groups.entries()].map(([name, sessions]) => ({
    name,
    count: sessions.length,
    percent: records.length ? Math.round(sessions.length / records.length * 100) : 0,
  })).sort((a, b) => b.count - a.count);
}

export function summarizeZones(records) {
  return records.reduce((totals, record) => totals.map((total, index) => total + (record.zones[index] || 0)), [0, 0, 0, 0]);
}

export function createRollingLoad(allPhaseRecords, denseTrend) {
  const byDate = new Map([...groupBy(allPhaseRecords, (record) => record.date)].map(([date, records]) => [
    date, 
    {
      distance: records.reduce((sum, record) => sum + record.distance, 0),
      minutes: records.reduce((sum, record) => sum + record.minutes, 0),
      trimps: records.reduce((sum, record) => sum + record.trimps, 0)
    }
  ]));

  return denseTrend.map((trendDay) => {
    const end = new Date(`${trendDay.date}T00:00:00Z`);
    let distance = 0, minutes = 0, trimps = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(end);
      day.setUTCDate(day.getUTCDate() - offset);
      const stats = byDate.get(day.toISOString().slice(0, 10)) || { distance: 0, minutes: 0, trimps: 0 };
      distance += stats.distance;
      minutes += stats.minutes;
      trimps += stats.trimps;
    }
    return { ...trendDay, rollingDistance: round(distance), rollingMinutes: round(minutes), rollingTrimps: round(trimps) };
  });
}

export function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

export function matchesPeriod(date, period, months) {
  if (period === 'all') return true;
  if (period !== 'last30') return date.startsWith(period);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  const candidate = new Date(`${date}T00:00:00`);
  return candidate >= start && candidate <= end && months.includes(date.slice(0, 7));
}

export function formatDate(date) {
  return shortDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value);
}

export function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase('es-ES') + value.slice(1);
}

export function round(value) {
  return Math.round(value * 10) / 10;
}

export function sessionFromRecord(record) {
  const date = new Date(`${record.date}T00:00:00Z`);
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', timeZone: 'UTC',
  }).format(date);
  const compStatus = record.completionStatus || (record.status === 'Completado' ? 'completed' : 'unreported');
  const stateLabel = compStatus === 'completed'
    ? 'Completado'
    : compStatus === 'partial'
      ? 'A medias'
      : compStatus === 'missed'
        ? 'No realizado'
        : (record.status || 'Planificado');
  const tone = compStatus === 'completed' ? 'green' : compStatus === 'partial' ? 'yellow' : compStatus === 'missed' ? 'pink' : (/series|umbral|competición/i.test(record.type) ? 'blue' : 'navy');
  return {
    ...record,
    date: date.getUTCDate(),
    dateLabel,
    time: '—',
    mins: record.minutes,
    km: record.distance,
    tr: String(record.trimps),
    blocks: record.description,
    state: stateLabel,
    tone,
  };
}
