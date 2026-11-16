import { PanelHeading } from './DataPanels.jsx';
import { ExternalLoadChart, InternalLoadChart } from './LoadCharts.jsx';

export function ChartsSection({ role, weeklyRows, typeBreakdown, zoneTotals, denseTrend, rollingLoad, onSession }) {
  return (
    <div className="data-section charts-section">
      <div className="chart-grid">
        <InternalLoadChart data={denseTrend} onSession={onSession} />
      </div>
      <div className="chart-grid two-charts">
        <TypeBreakdown data={typeBreakdown} />
        <ZoneBreakdown totals={zoneTotals} />
      </div>
      <div className="chart-grid">
        <ExternalLoadChart data={rollingLoad} />
      </div>
    </div>
  );
}

function TypeBreakdown({ data }) {
  const colors = ['#6892ad', '#9d7aa9', '#78a487', '#d0a054', '#6c7fa4', '#c77883', '#8e9ca5'];
  return (
    <section className="panel chart-card">
      <PanelHeading title="Tipos de entrenamiento" description="Porcentaje de sesiones en el periodo seleccionado" />
      <div className="type-breakdown">
        {data.map((item, index) => (
          <div className="type-row" key={item.name}>
            <div className="type-row-label"><span><i style={{ background: colors[index % colors.length] }} />{item.name}</span><b>{item.count} {item.count === 1 ? 'entrenamiento' : 'entrenamientos'} · {item.percent}%</b></div>
            <div className="type-track"><span style={{ width: `${item.percent}%`, background: colors[index % colors.length] }} /></div>
          </div>
        ))}
        {!data.length && <p className="empty-chart">No hay sesiones para mostrar.</p>}
      </div>
    </section>
  );
}

function ZoneBreakdown({ totals }) {
  const colors = ['#91b8ce', '#73a681', '#d5a953', '#c66f70'];
  const labels = ['Zona 1 · Suave', 'Zona 2 · Aeróbica', 'Zona 3 · Umbral', 'Zona 4 · Alta intensidad'];
  const grandTotal = totals.reduce((sum, value) => sum + value, 0);
  return (
    <section className="panel chart-card">
      <PanelHeading title="Tiempo en zonas de entrenamiento" description="Distribución estimada a partir del tipo de sesión" />
      <div className="zone-stack" aria-label="Distribución de tiempo por zonas">
        {totals.map((value, index) => <span key={index} style={{ width: `${grandTotal ? value / grandTotal * 100 : 0}%`, background: colors[index] }} title={`${labels[index]}: ${value} min`} />)}
      </div>
      <div className="zone-legend-head"><span /><span>Tiempo</span><span>Tiempo %</span></div>
      <div className="zone-legend">
        {totals.map((value, index) => {
          const percentage = grandTotal ? Math.round((value / grandTotal) * 100) : 0;
          return (
            <div key={labels[index]}>
              <span><i style={{ background: colors[index] }} />{labels[index]}</span>
              <b>{value} min</b>
              <strong>{percentage}%</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
