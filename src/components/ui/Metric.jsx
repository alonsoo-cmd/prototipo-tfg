import { TermLabel } from './InfoTip.jsx';

export default function Metric({label,value}){return <div className="metric"><small><TermLabel>{label}</TermLabel></small><b>{value}</b></div>}
