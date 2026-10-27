export default function ConditionBadge({ condition, prefix = '' }) {
  return <span className="status status-closed">{prefix}{condition}</span>;
}
