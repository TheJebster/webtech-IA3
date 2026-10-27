// Ranked single-series bar list: label + value as text, thin bar for magnitude.
export default function BarList({ rows, format = (v) => v, label = 'Value' }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="list-unstyled mb-0 bar-list" aria-label={label}>
      {rows.map((r) => (
        <li key={r.key} className="mb-3" title={`${r.label}: ${format(r.value)}`}>
          <div className="d-flex justify-content-between gap-2 small mb-1">
            <span className="text-truncate">{r.label}</span>
            <span className="fw-semibold text-nowrap">{format(r.value)}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          {r.hint && <div className="small text-muted mt-1">{r.hint}</div>}
        </li>
      ))}
    </ul>
  );
}
