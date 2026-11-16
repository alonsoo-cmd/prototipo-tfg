import { formatNumber } from './dataStats.js';
import InfoTip from '../../../components/ui/InfoTip.jsx';
import HrPercent from '../../../components/ui/HrPercent.jsx';

export function PanelHeading({ title, description }) {
  return <div className="panel-title data-panel-title"><div><h2>{title}</h2><p>{description}</p></div></div>;
}

export function SummaryTable({ rows, firstColumn, fcMax = 200 }) {
  const totalKm = rows.reduce((s, r) => s + (r.kilometers || 0), 0);
  const totalMin = rows.reduce((s, r) => s + (r.minutes || 0), 0);
  const hrRows = rows.filter((r) => r.averageHr);
  const overallHr = hrRows.length ? hrRows.reduce((s, r) => s + r.averageHr, 0) / hrRows.length : null;

  return (
    <div className="table-scroll">
      <table className="analytics-table summary-analytics-table">
        <thead><tr><th>{firstColumn}</th><th>Kilómetros</th><th>Minutos</th><th>% FC máx <InfoTip term="fcMaxPercent" /></th><th>WT medio</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{formatNumber(row.kilometers, 1)} km</td>
              <td>{row.minutes} min</td>
              <td><HrPercent averageHr={row.averageHr} fcMax={fcMax} /></td>
              <td>{row.wellbeingTotal === null ? '—' : `${formatNumber(row.wellbeingTotal, 1)} / 50`}</td>
            </tr>
          ))}
          {!rows.length && <EmptyRow columns={5} />}
          {rows.length > 0 && (
            <tr className="summary-consolidated-row">
              <td><b>Consolidado (Últimos 7 días)</b></td>
              <td><b>{formatNumber(totalKm, 1)} km</b></td>
              <td><b>{totalMin} min</b></td>
              <td><HrPercent averageHr={overallHr} fcMax={fcMax} /></td>
              <td><small className="muted">Total acumulado</small></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyRow({ columns }) {
  return <tr><td className="empty-table-cell" colSpan={columns}>No hay sesiones en este periodo y fase.</td></tr>;
}
