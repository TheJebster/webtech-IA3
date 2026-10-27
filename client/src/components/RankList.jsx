// Ranked list in type: label (and optional hint) on the left, value on the right
export default function RankList({ rows, format = (v) => v, label }) {
  return (
    <ol className="rank-list" aria-label={label}>
      {rows.map((r) => (
        <li key={r.key}>
          <span className="min-w-0">
            {r.label}
            {r.hint && <span className="rank-hint">{r.hint}</span>}
          </span>
          <span className="text-nowrap">{format(r.value)}</span>
        </li>
      ))}
    </ol>
  );
}
