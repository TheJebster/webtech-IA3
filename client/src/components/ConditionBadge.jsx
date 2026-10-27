export default function ConditionBadge({ condition, prefix = '' }) {
  return <span className="badge">{prefix}{condition}</span>;
}
