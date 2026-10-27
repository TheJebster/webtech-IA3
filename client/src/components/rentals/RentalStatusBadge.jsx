import { Badge } from 'react-bootstrap';

export const STATUS_META = {
  pending: { label: 'Pending', bg: 'warning', text: 'dark' },
  approved: { label: 'Approved', bg: 'success' },
  rejected: { label: 'Rejected', bg: 'danger' },
  cancelled: { label: 'Cancelled', bg: 'secondary' },
  returned: { label: 'Returned', bg: 'info', text: 'dark' },
};

export default function RentalStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, bg: 'secondary' };
  return (
    <Badge bg={meta.bg} text={meta.text} className="fw-semibold">
      {meta.label}
    </Badge>
  );
}
