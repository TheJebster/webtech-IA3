import { Badge } from 'react-bootstrap';
import { CONDITION_VARIANT } from '../utils/categories';

export default function ConditionBadge({ condition, prefix = '' }) {
  const variant = CONDITION_VARIANT[condition] || 'secondary';
  return (
    <Badge bg={variant} text={variant === 'warning' ? 'dark' : undefined} className="fw-medium">
      {prefix}{condition}
    </Badge>
  );
}
