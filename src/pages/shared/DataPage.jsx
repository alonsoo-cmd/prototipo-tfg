import { useMemo, useState } from 'react';
import { createTrainingHistory } from '../../data/trainingHistory.js';
import { createGroupHistory } from '../../data/groupHistory.js';
import { capitalize, createRollingLoad, groupBy, matchesPeriod, monthFormatter, summarize, summarizeTypes, summarizeZones } from './data/dataStats.js';
import { DataSection } from './data/DataSection.jsx';
import { ChartsSection } from './data/ChartsSection.jsx';
import './DataPage.css';
import InfoTip from '../../components/ui/InfoTip.jsx';

export default function DataPage({ trainingLogs = {}, setTrainingLogs, onSession, role, coachWeeks = [] }) {
  const [section, setSection] = useState('data');
  const [period, setPeriod] = useState('last30');
  const [phase, setPhase] = useState('all');
  
  const history = useMemo(() => (
    role === 'grupo' && coachWeeks.length > 0
      ? createGroupHistory(coachWeeks, trainingLogs)
      : createTrainingHistory(trainingLogs, coachWeeks)
  ), [trainingLogs, role, coachWeeks]);
  const phaseFilterOptions = [...new Set(history.map((record) => record.phase).filter(Boolean))];

  const availableMonths = [...new Set(history.map((record) => record.date.slice(0, 7)))].sort();
  const rangeFilteredRecords = history.filter((record) => matchesPeriod(record.date, period, availableMonths));
  const filteredRecords = rangeFilteredRecords.filter((record) => phase === 'all' || record.phase === phase);
  const weekGroups = groupBy(filteredRecords, (record) => record.preparationWeek);
  const weeklyRows = [...weekGroups.entries()].map(([week, records]) => summarize(records, `Semana ${week}`, week));
  const dailyRows = [...groupBy(filteredRecords, (record) => record.date).entries()]
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, records]) => summarize(records, date, date));

  const denseTrend = useMemo(() => {
    let startDate, endDate;
    if (period === 'last30') {
      endDate = new Date();
      endDate.setUTCHours(0, 0, 0, 0);
      startDate = new Date(endDate);
      startDate.setUTCDate(startDate.getUTCDate() - 29);
    } else if (period === 'all') {
      if (!dailyRows.length) return [];
      startDate = new Date(`${dailyRows.at(-1).date}T00:00:00Z`);
      endDate = new Date(`${dailyRows[0].date}T00:00:00Z`);
    } else {
      const [year, month] = period.split('-').map(Number);
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 0));
    }
    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().slice(0, 10);
      const row = dailyRows.find(r => r.key === dateStr);
      days.push(row || { key: dateStr, date: dateStr, empty: true });
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
  }, [period, dailyRows]);

  const recentSevenDays = dailyRows.slice(0, 7).reverse();
  const chartWeeks = weeklyRows;
  const typeBreakdown = summarizeTypes(filteredRecords);
  const zoneTotals = summarizeZones(filteredRecords);
  const wellnessTrend = dailyRows.slice(0, 30).reverse();
  const rollingLoad = useMemo(() => createRollingLoad(history.filter((record) => phase === 'all' || record.phase === phase), denseTrend), [history, phase, denseTrend]);

  return (
    <div className="content data-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ANÁLISIS DE LA PREPARACIÓN</div>
          <h1>Datos de entrenamiento</h1>
          <p>Consulta los entrenamientos, la carga y la evolución de tus métricas.</p>
        </div>
        <span className="example-tag">DATOS DE EJEMPLO</span>
      </div>

      <div className="data-toolbar">
        <div className="data-tabs" role="tablist" aria-label="Sección de datos">
          <button role="tab" aria-selected={section === 'data'} className={section === 'data' ? 'active' : ''} onClick={() => setSection('data')}>Datos</button>
          <button role="tab" aria-selected={section === 'charts'} className={section === 'charts' ? 'active' : ''} onClick={() => setSection('charts')}>Gráficas</button>
        </div>
        <div className="data-filters">
          <label>
            <span>Periodo</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="last30">Últimos 30 días</option>
              <option value="all">Todo el periodo</option>
              {availableMonths.map((month) => <option key={month} value={month}>{capitalize(monthFormatter.format(new Date(`${month}-01T00:00:00Z`)))}</option>)}
            </select>
          </label>
          <label>
            <span>Fase <InfoTip term="fases" /></span>
            <select value={phase} onChange={(event) => setPhase(event.target.value)}>
              <option value="all">Todas las fases</option>
              {phaseFilterOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      {section === 'data' ? (
        <DataSection
          records={filteredRecords}
          recentSevenDays={recentSevenDays}
          onSession={onSession}
          setTrainingLogs={setTrainingLogs}
        />
      ) : (
        <ChartsSection
          role={role}
          weeklyRows={chartWeeks}
          typeBreakdown={typeBreakdown}
          zoneTotals={zoneTotals}
          denseTrend={denseTrend}
          rollingLoad={rollingLoad}
          onSession={onSession}
        />
      )}
    </div>
  );
}
